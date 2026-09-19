import { createHmac, timingSafeEqual } from 'node:crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// Prefer the server-only name. The fallback prevents existing deployments
// from losing CMS writes while their environment variables are migrated.
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.ADMIN_SESSION_SECRET || SERVICE_KEY;

function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

function tokenFor(email, expiresAt) {
  // Email addresses commonly contain dots, so use a separator that cannot
  // appear in an email address. This keeps Vercel-issued upload tokens valid.
  const payload = `${email}:${expiresAt}`;
  return `${Buffer.from(payload).toString('base64url')}.${createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')}`;
}

function authenticated(req) {
  const value = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!value || !TOKEN_SECRET) return false;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return false;
  try {
    const payload = Buffer.from(encoded, 'base64url').toString();
    const expected = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const separator = payload.lastIndexOf(':');
    if (separator < 1) return false;
    const email = payload.slice(0, separator);
    const expiresAt = payload.slice(separator + 1);
    return email === ADMIN_EMAIL && Number(expiresAt) > Date.now();
  } catch {
    return false;
  }
}

async function readBody(req, maxBytes = 10_000_000) {
  // Vercel pre-parses request bodies for Node functions. Use that value when
  // present; attempting to consume the request stream again yields an empty
  // body and makes valid admin credentials appear invalid.
  if (req.body !== undefined && req.body !== null) {
    const body = Buffer.isBuffer(req.body)
      ? req.body
      : typeof req.body === 'string'
        ? Buffer.from(req.body)
        : Buffer.from(JSON.stringify(req.body));
    if (body.length > maxBytes) throw new Error('Payload too large.');
    return body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('Payload too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function supabase(path, options = {}) {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase server credentials are not configured.');
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...(options.headers || {}),
    },
  });
}

async function saveCmsState(state, updatedAt = new Date().toISOString()) {
  const response = await supabase('/rest/v1/cms_state?on_conflict=key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ key: 'primary', state, updated_at: updatedAt }),
  });
  if (!response.ok) throw new Error(await response.text());
  return updatedAt;
}

const BUCKET_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

// CMS media is intentionally linkable from the public site. Keep the bucket
// public so the permanent URL returned after an upload can be rendered by an
// avatar, image, or video element without a short-lived read token.
async function ensurePublicAssetsBucket() {
  const bucket = await supabase('/storage/v1/bucket/dmd-assets');
  if (bucket.ok) {
    const details = await bucket.json().catch(() => null);
    if (details?.public === true && details?.file_size_limit === 52428800) return;
    const update = await supabase('/storage/v1/bucket/dmd-assets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public: true,
        file_size_limit: 52428800,
        allowed_mime_types: BUCKET_ALLOWED_MIME_TYPES,
      }),
    });
    if (update.ok) return;
    throw new Error('The media bucket could not be made public.');
  }
  if (bucket.status !== 404) throw new Error('The media bucket could not be checked.');
  const create = await supabase('/storage/v1/bucket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'dmd-assets',
      name: 'dmd-assets',
      public: true,
      file_size_limit: 52428800,
      allowed_mime_types: BUCKET_ALLOWED_MIME_TYPES,
    }),
  });
  if (!create.ok) throw new Error('The public media bucket could not be created.');
}

export default async function handler(req, res) {
  // Vercel may route a one-segment API request through this catch-all as
  // `/api/[...path]?path=cms-state`. Prefer that route parameter, otherwise
  // retain the normal local-development URL parsing.
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = requestUrl.searchParams.get('path')
    || requestUrl.searchParams.get('...path')
    || requestUrl.pathname.replace(/^\/api\//, '').replace(/^\//, '');

  try {
    if (path === 'admin/login' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !TOKEN_SECRET) return json(res, 503, { error: 'Admin service is not configured.' });
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return json(res, 401, { error: 'Invalid email or password.' });
      return json(res, 200, { token: tokenFor(email, Date.now() + 8 * 60 * 60 * 1000) });
    }

    if (path === 'cms-state' && req.method === 'PUT') {
      if (!authenticated(req)) return json(res, 401, { error: 'Authentication required.' });
      const { state } = JSON.parse((await readBody(req)).toString() || '{}');
      if (!state || typeof state !== 'object') return json(res, 400, { error: 'A CMS state object is required.' });
      const updatedAt = new Date().toISOString();
      await saveCmsState(state, updatedAt);
      return json(res, 200, { ok: true, updatedAt });
    }

    if (path === 'uploads' && req.method === 'POST') {
      if (!authenticated(req)) return json(res, 401, { error: 'Authentication required.' });
      const bytes = await readBody(req, 4_000_000);
      if (!bytes.length) return json(res, 400, { error: 'Select a non-empty image.' });
      const fileName = decodeURIComponent(String(req.headers['x-file-name'] || 'image'))
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectPath = `uploads/${Date.now()}-${fileName}`;
      const response = await supabase(`/storage/v1/object/dmd-assets/${objectPath}`, {
        method: 'POST',
        headers: { 'Content-Type': String(req.headers['content-type'] || 'application/octet-stream') },
        body: bytes,
      });
      if (!response.ok) throw new Error(await response.text());
      return json(res, 201, { url: `${SUPABASE_URL}/storage/v1/object/public/dmd-assets/${objectPath}` });
    }

    // Large media bypasses Vercel's request-size limit: issue a short-lived
    // Supabase signed upload URL, then the browser sends the file directly to
    // Storage. The resulting public URL is still permanent CMS content.
    if (path === 'upload-url' && req.method === 'POST') {
      if (!authenticated(req)) return json(res, 401, { error: 'Authentication required.' });
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const fileName = String(body.fileName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectPath = `uploads/${Date.now()}-${fileName}`;
      await ensurePublicAssetsBucket();
      const response = await supabase(`/storage/v1/object/upload/sign/dmd-assets/${objectPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.url) throw new Error(result?.message || 'Could not create a Supabase upload URL.');
      return json(res, 200, {
        uploadUrl: `${SUPABASE_URL}/storage/v1${result.url}`,
        publicUrl: `${SUPABASE_URL}/storage/v1/object/public/dmd-assets/${objectPath}`,
      });
    }

    return json(res, 404, { error: 'API route not found.' });
  } catch (error) {
    console.error('[DMD API]', error);
    return json(res, 503, { error: 'The admin service could not complete this request.' });
  }
}
