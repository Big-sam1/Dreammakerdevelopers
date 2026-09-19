/**
 * DMD CMS API Server — Supabase Edition
 *
 * All database operations use the Supabase REST API (no MongoDB).
 * Uploads go to Supabase Storage (dmd-assets bucket).
 *
 * Endpoints:
 *   POST /api/admin/login   — admin authentication
 *   GET  /api/cms-state     — read full CMS state (also readable directly from Supabase)
 *   PUT  /api/cms-state     — save CMS state (admin only)
 *   POST /api/uploads       — upload image/file to Supabase Storage (admin only)
 *   POST /api/submissions   — save a public form submission (no auth)
 *   GET  /*                 — serve the built React app
 */
import { createReadStream, existsSync } from 'node:fs';
import { createServer }                 from 'node:http';
import { extname, join, normalize }     from 'node:path';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const port          = Number(process.env.PORT || 4000);
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
// Service-role credentials must stay server-only. Keep the legacy variable as
// a temporary fallback for existing local installations, but use the same
// canonical name as the Vercel API function.
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[DMD] ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const TOKEN_SECRET = process.env.ADMIN_SESSION_SECRET || SERVICE_KEY;

// ─── IN-MEMORY STATE ──────────────────────────────────────────────────────────
/** Server-side CMS state cache — cleared on every PUT so users see changes within 5s */
let cmsStateCache = null; // { state, updatedAt }

// ─── HMAC TOKEN HELPERS (stateless — survive server restarts) ─────────────────

/**
 * Create a signed session token containing the admin email and expiry time.
 * The token format is:  base64url(payload) + "." + base64url(HMAC-SHA256)
 * This matches the format used by api/[...path].js on Vercel so the same
 * token works on both local dev (server.mjs) and production (Vercel functions).
 */
function createToken(email, expiresAt) {
  const payload = `${email}:${expiresAt}`;
  const sig = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

/**
 * Verify a signed token. Returns { email, expiresAt } on success, null otherwise.
 */
function verifyToken(value) {
  if (!value || !TOKEN_SECRET) return null;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) return null;
  try {
    const payload  = Buffer.from(encoded, 'base64url').toString();
    const expected = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    if (signature.length !== expected.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const sep      = payload.lastIndexOf(':');
    if (sep < 1) return null;
    const email     = payload.slice(0, sep);
    const expiresAt = Number(payload.slice(sep + 1));
    if (expiresAt <= Date.now()) return null;
    return { email, expiresAt };
  } catch {
    return null;
  }
}


// ─── SUPABASE REST HELPERS ────────────────────────────────────────────────────

/** Standard headers for Supabase REST calls using the service role key. */
function sbHeaders(extra = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/** GET rows from a Supabase table. */
async function sbGet(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: { ...sbHeaders(), Accept: 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.hint || `Supabase GET /${table} failed (${res.status})`);
  }
  return res.json();
}

/** Upsert (insert or update) a row in a Supabase table. */
async function sbUpsert(table, data, onConflict = 'key') {
  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method: 'POST',
    headers: sbHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.hint || `Supabase upsert /${table} failed (${res.status})`);
  }
}

// ─── PASSWORD HELPERS ─────────────────────────────────────────────────────────

function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function passwordMatches(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected  = Buffer.from(hash, 'hex');
    return expected.length === candidate.length && timingSafeEqual(expected, candidate);
  } catch {
    return false;
  }
}

// ─── ADMIN BOOTSTRAP ─────────────────────────────────────────────────────────

/**
 * Ensure the initial admin row exists in Supabase.
 * Called lazily on the first login attempt.
 */
async function bootstrapAdminIfNeeded() {
  const envEmail    = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envEmail || !envPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to create the first admin.');
  }
  const existing = await sbGet('admins', `?email=eq.${encodeURIComponent(envEmail)}&select=email`);
  if (existing.length === 0) {
    await sbUpsert('admins', {
      email:         envEmail,
      password_hash: passwordHash(envPassword),
      created_at:    new Date().toISOString(),
    }, 'email');
    console.log(`[DMD] Admin account created for ${envEmail}`);
  }
}

// ─── SESSION HELPERS ──────────────────────────────────────────────────────────

function getSession(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000_000) reject(new Error('Payload too large.'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Invalid JSON.')); }
    });
    req.on('error', reject);
  });
}

function readBytes(req, limit = 100_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) { reject(new Error('File too large (max 100 MB).')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end',   () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'text/javascript; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.svg':   'image/svg+xml',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.webp':  'image/webp',
  '.gif':   'image/gif',
  '.ico':   'image/x-icon',
  '.json':  'application/json',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ttf':   'font/ttf',
};

// ─── HTTP SERVER ──────────────────────────────────────────────────────────────

createServer(async (req, res) => {
  const url    = req.url || '/';
  const method = req.method || 'GET';

  // ── POST /api/admin/login ──────────────────────────────────────────────────
  if (url === '/api/admin/login' && method === 'POST') {
    try {
      const { email, password } = await readJson(req);
      const normalizedEmail = String(email || '').trim().toLowerCase();

      // Bootstrap admin on first login
      await bootstrapAdminIfNeeded();

      // Look up admin
      const rows = await sbGet(
        'admins',
        `?email=eq.${encodeURIComponent(normalizedEmail)}&select=email,password_hash`
      );
      const admin = rows[0];
      if (!admin || !passwordMatches(String(password || ''), admin.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid email or password.' });
      }

      // Issue a stateless, signed session token (8 h). It remains valid across
      // server restarts because it is verified from its signature and expiry.
      const token = createToken(admin.email, Date.now() + 8 * 60 * 60 * 1000);
      return sendJson(res, 200, { token, email: admin.email });
    } catch (err) {
      console.error('[DMD] Login error:', err.message);
      return sendJson(res, 503, { error: err.message || 'Login unavailable.' });
    }
  }

  // ── /api/cms-state  (GET + PUT) ────────────────────────────────────────────
  if (url === '/api/cms-state') {
    try {
      if (method === 'GET') {
        // Serve from cache when available (invalidated on each PUT)
        if (cmsStateCache) {
          return sendJson(res, 200, cmsStateCache);
        }
        const rows = await sbGet('cms_state', '?key=eq.primary&select=state,updated_at&limit=1');
        const row  = rows[0] ?? null;
        cmsStateCache = row ? { state: row.state, updatedAt: row.updated_at } : { state: null, updatedAt: null };
        return sendJson(res, 200, cmsStateCache);
      }

      if (method === 'PUT') {
        if (!getSession(req)) return sendJson(res, 401, { error: 'Authentication required.' });
        const { state } = await readJson(req);
        if (!state || typeof state !== 'object') {
          return sendJson(res, 400, { error: 'A CMS state object is required.' });
        }
        const updatedAt = new Date().toISOString();
        await sbUpsert('cms_state', { key: 'primary', state, updated_at: updatedAt });
        // Invalidate cache so the next GET returns fresh data
        cmsStateCache = { state, updatedAt };
        return sendJson(res, 200, { ok: true, updatedAt });
      }

      return sendJson(res, 405, { error: 'Method not allowed.' });
    } catch (err) {
      console.error('[DMD] cms-state error:', err.message);
      return sendJson(res, 503, { error: err.message || 'Database unavailable.' });
    }
  }

  // ── POST /api/uploads  (image/file -> Supabase Storage) ───────────────────
  if (url === '/api/uploads' && method === 'POST') {
    try {
      if (!getSession(req)) return sendJson(res, 401, { error: 'Authentication required.' });

      const bytes = await readBytes(req);
      if (!bytes.length) return sendJson(res, 400, { error: 'Select a non-empty file.' });

      const originalName  = decodeURIComponent(String(req.headers['x-file-name'] || 'upload'));
      const contentType   = String(req.headers['content-type'] || 'application/octet-stream');
      const safeName      = `uploads/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/dmd-assets/${safeName}`,
        {
          method:  'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': contentType,
            'Cache-Control': '3600',
          },
          body: bytes,
        }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Supabase Storage upload failed.');
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/dmd-assets/${safeName}`;
      return sendJson(res, 201, { url: publicUrl });
    } catch (err) {
      console.error('[DMD] Upload error:', err.message);
      return sendJson(res, 503, { error: err.message || 'Upload failed.' });
    }
  }

  // ── POST /api/upload-url  (signed URL for large file uploads) ────────────
  if (url === '/api/upload-url' && method === 'POST') {
    try {
      if (!getSession(req)) return sendJson(res, 401, { error: 'Authentication required.' });

      const { fileName } = await readJson(req);
      const safeName = String(fileName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectPath = `uploads/${Date.now()}-${safeName}`;

      // Ensure the dmd-assets bucket exists and is public
      const bucketCheck = await fetch(`${SUPABASE_URL}/storage/v1/bucket/dmd-assets`, {
        headers: sbHeaders(),
      });
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
      if (!bucketCheck.ok && bucketCheck.status === 404) {
        const createBucket = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
          method: 'POST',
          headers: sbHeaders(),
          body: JSON.stringify({
            id: 'dmd-assets',
            name: 'dmd-assets',
            public: true,
            file_size_limit: 52428800,
            allowed_mime_types: BUCKET_ALLOWED_MIME_TYPES,
          }),
        });
        if (!createBucket.ok) {
          const err = await createBucket.json().catch(() => ({}));
          throw new Error(err.message || 'Could not create media bucket.');
        }
      } else if (bucketCheck.ok) {
        const details = await bucketCheck.json().catch(() => null);
        if (details?.public !== true || details?.file_size_limit !== 52428800) {
          await fetch(`${SUPABASE_URL}/storage/v1/bucket/dmd-assets`, {
            method: 'PUT',
            headers: sbHeaders(),
            body: JSON.stringify({
              public: true,
              file_size_limit: 52428800,
              allowed_mime_types: BUCKET_ALLOWED_MIME_TYPES,
            }),
          });
        }
      }

      // Issue a Supabase signed upload URL so the browser PUTs the file directly
      const signRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/upload/sign/dmd-assets/${objectPath}`,
        {
          method: 'POST',
          headers: sbHeaders(),
          body: '{}',
        }
      );
      const result = await signRes.json().catch(() => null);
      if (!signRes.ok || !result?.url) {
        throw new Error(result?.message || 'Could not create a signed upload URL.');
      }

      return sendJson(res, 200, {
        uploadUrl: `${SUPABASE_URL}/storage/v1${result.url}`,
        publicUrl: `${SUPABASE_URL}/storage/v1/object/public/dmd-assets/${objectPath}`,
      });
    } catch (err) {
      console.error('[DMD] upload-url error:', err.message);
      return sendJson(res, 503, { error: err.message || 'Could not create upload URL.' });
    }
  }

  // ── POST /api/submissions  (public form submissions) ──────────────────────
  if (url === '/api/submissions' && method === 'POST') {
    try {
      const { type, submission } = await readJson(req);
      const field = type === 'project' ? 'projectSubmissions'
                  : type === 'contact' ? 'contactSubmissions'
                  : null;
      if (!field || !submission || typeof submission !== 'object') {
        return sendJson(res, 400, { error: 'Valid submission type and data required.' });
      }

      // Read current state, prepend submission, write back
      const rows = await sbGet('cms_state', '?key=eq.primary&select=state,updated_at&limit=1');
      const currentState = (rows[0]?.state) || {};
      const existing     = Array.isArray(currentState[field]) ? currentState[field] : [];
      const newState     = { ...currentState, [field]: [submission, ...existing] };
      const updatedAt    = new Date().toISOString();

      await sbUpsert('cms_state', { key: 'primary', state: newState, updated_at: updatedAt });
      cmsStateCache = { state: newState, updatedAt };
      return sendJson(res, 201, { ok: true });
    } catch (err) {
      console.error('[DMD] Submission error:', err.message);
      return sendJson(res, 503, { error: err.message || 'Database unavailable.' });
    }
  }

  // ── Static file serving (production build) ────────────────────────────────
  if (method !== 'GET' && method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const requestPath = url.split('?')[0];
  const safePath    = normalize(requestPath).replace(/^([.][.][\\/])+/, '');
  let   filePath    = join(process.cwd(), 'dist', safePath === '/' ? 'index.html' : safePath);
  if (!existsSync(filePath)) filePath = join(process.cwd(), 'dist', 'index.html');
  if (!existsSync(filePath)) {
    return sendJson(res, 404, { error: 'Build not found — run: npm run build' });
  }

  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  if (method === 'HEAD') return res.end();
  createReadStream(filePath).pipe(res);

}).listen(port, () => {
  console.log(`[DMD] Server listening  → http://localhost:${port}`);
  console.log(`[DMD] Supabase project  → ${SUPABASE_URL}`);
  console.log(`[DMD] Admin login       → http://localhost:${port}/admin/login`);
});
