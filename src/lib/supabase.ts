/**
 * Browser client for the Supabase-backed DMD CMS API.
 *
 * READ   -> direct to Supabase (public RLS, no proxy, instant)
 * WRITE  -> through the Node.js server (auth-protected, debounced)
 * UPLOAD -> through the Node.js server -> Supabase Storage
 */

const SUPABASE_URL      = (import.meta.env.VITE_SUPABASE_URL      as string) || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// ─── CMS STATE ────────────────────────────────────────────────────────────────

/**
 * Read CMS state DIRECTLY from Supabase (public read RLS, no server proxy).
 * Returns state JSON + updated_at timestamp for change detection.
 */
export async function getCmsStateFromSupabase(): Promise<{
  state: unknown;
  updatedAt: string | null;
} | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cms_state?key=eq.primary&select=state,updated_at&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const rows = await res.json() as Array<{ state: unknown; updated_at: string }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return { state: rows[0].state, updatedAt: rows[0].updated_at ?? null };
  } catch {
    return null;
  }
}

/**
 * Persist CMS state via the Node.js server (requires admin JWT).
 */
export async function saveCmsStateToSupabase(state: unknown): Promise<boolean> {
  try {
    const token = localStorage.getItem('dmd_admin_token');
    const res = await fetch('/api/cms-state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────

/**
 * Log in via the server. On success, stores the JWT in localStorage.
 */
export async function loginWithSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok || !result.token) {
      return { success: false, error: result.error || 'Login failed.' };
    }
    localStorage.setItem('dmd_admin_token', result.token);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Cannot reach the DMD server. Start the API server and try again.',
    };
  }
}

// ─── FILE UPLOADS -> SUPABASE STORAGE (via server) ───────────────────────────

/**
 * Upload any image/video through the server to Supabase Storage.
 * Returns the permanent public URL.
 */
export async function uploadImageToSupabase(file: File): Promise<string> {
  const token = localStorage.getItem('dmd_admin_token');
  const res = await fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file,
  });
  const result = await res.json();
  if (!res.ok || !result.url) throw new Error(result.error || 'Upload failed.');
  return result.url as string;
}

// ─── PUBLIC FORM SUBMISSIONS ──────────────────────────────────────────────────

/**
 * Save a project brief or contact inquiry (no auth required).
 */
export async function savePublicSubmission(
  type: 'project' | 'contact',
  submission: unknown
): Promise<boolean> {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, submission }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── IMAGE UTILS ──────────────────────────────────────────────────────────────

/**
 * Crop and convert an image file into a circular 512x512 PNG favicon.
 */
export async function makeCircularFavicon(file: File): Promise<File> {
  const image = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare favicon canvas.');
  const size = Math.min(image.width, image.height);
  const sx = (image.width - size) / 2;
  const sy = (image.height - size) / 2;
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, sx, sy, size, size, 0, 0, 512, 512);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error('Could not create favicon blob.');
  return new File([blob], 'favicon.png', { type: 'image/png' });
}
