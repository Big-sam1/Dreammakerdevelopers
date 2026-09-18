import { createHmac, timingSafeEqual } from 'node:crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.ADMIN_SESSION_SECRET || SERVICE_KEY;

function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

function tokenFor(email, expiresAt) {
  const payload = `${email}.${expiresAt}`;
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
    const [email, expiresAt] = payload.split('.');
    return email === ADMIN_EMAIL && Number(expiresAt) > Date.now();
  } catch {
    return false;
  }
}

async function readBody(req, maxBytes = 10_000_000) {
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

async function saveCmsState(state) {
  const response = await supabase('/rest/v1/cms_state?on_conflict=key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ key: 'primary', state, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(await response.text());
}

export default async function handler(req, res) {
  const path = (req.url || '').split('?')[0].replace(/^\/api\//, '').replace(/^\//, '');

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
      await saveCmsState(state);
      return json(res, 200, { ok: true });
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

    return json(res, 404, { error: 'API route not found.' });
  } catch (error) {
    console.error('[DMD API]', error);
    return json(res, 503, { error: 'The admin service could not complete this request.' });
  }
}
