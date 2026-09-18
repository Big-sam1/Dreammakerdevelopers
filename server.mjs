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
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const port          = Number(process.env.PORT || 4000);
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY   = process.env.VITE_SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[DMD] ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_SECRET_KEY must be set in .env');
  process.exit(1);
}

// ─── IN-MEMORY STATE ──────────────────────────────────────────────────────────
/** Active admin sessions  token → { email, expiresAt } */
const sessions = new Map();
/** Server-side CMS state cache — cleared on every PUT so users see changes within 5s */
let cmsStateCache = null; // { state, updatedAt }

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
  const token   = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return session;
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

      // Issue session token (8 h)
      const token = randomBytes(32).toString('hex');
      sessions.set(token, { email: admin.email, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
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
