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

export type SaveCmsResult = {
  ok: boolean;
  updatedAt?: string;
};

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
          'Cache-Control': 'no-cache, no-store, max-age=0',
          Pragma: 'no-cache',
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
 * Persist CMS state via the Node.js server (requires admin JWT), with resilient fallback.
 * Returns { ok: true, updatedAt } with the exact server timestamp on success.
 */
export async function saveCmsStateToSupabase(state: unknown): Promise<SaveCmsResult> {
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
    // A static-hosting rewrite can return index.html with HTTP 200. Only the
    // API's explicit JSON acknowledgement represents a successful save.
    const result = await res.json().catch(() => null);
    if (res.ok && result?.ok === true) {
      return { ok: true, updatedAt: result.updatedAt };
    }
  } catch {
    // If backend server is unreachable (e.g. static Vercel without serverless),
    // state is already safely persisted in localStorage and BroadcastChannel.
  }
  return { ok: false };
}

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────

/**
 * Log in via the server, with seamless support for Vercel SPA deployments.
 * On success, stores the session in localStorage.
 */
export async function loginWithSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = (email || '').trim().toLowerCase();

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result?.token) {
        localStorage.setItem('dmd_admin_token', result.token);
        return { success: true };
      }
    } else if (res.status === 401) {
      const result = await res.json().catch(() => ({}));
      return { success: false, error: result.error || 'Access denied: Invalid credentials.' };
    }
  } catch {
    // Server endpoint not reachable (e.g. running on Vercel static hosting)
  }

  return {
    success: false,
    error: 'Admin service is unavailable. Please try again shortly.',
  };
}

// ─── FILE UPLOADS -> SUPABASE STORAGE (via server with client fallback) ───────

/**
 * Resolve MIME type based on file object and extension fallback.
 */
export function resolveFileMimeType(file: File): string {
  if (file.type && file.type.trim() && file.type !== 'application/octet-stream') {
    return file.type;
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  return map[ext] || 'application/octet-stream';
}

/**
 * Upload any image/video through an authenticated, server-issued Supabase
 * signed URL. Sending files to Storage directly avoids serverless request
 * body limits and makes the returned URL permanent, public CMS content.
 */
export async function uploadImageToSupabase(file: File): Promise<string> {
  const token = localStorage.getItem('dmd_admin_token');
  const contentType = resolveFileMimeType(file);

  try {
    const signedRes = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ fileName: file.name, contentType }),
    });
    const signed = await signedRes.json().catch(() => null);
    if (!signedRes.ok || !signed?.uploadUrl || !signed?.publicUrl) {
      throw new Error(signed?.error || 'Could not prepare a permanent upload. Please sign in again and retry.');
    }
    const directUpload = await fetch(signed.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });
    if (!directUpload.ok) {
      // Fallback for smaller files (<= 4 MB) via server proxy
      if (file.size <= 4_000_000) {
        try {
          const fallbackRes = await fetch('/api/uploads', {
            method: 'POST',
            headers: {
              'Content-Type': contentType,
              'x-file-name': encodeURIComponent(file.name),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: file,
          });
          const fallback = await fallbackRes.json().catch(() => null);
          if (fallbackRes.ok && fallback?.url) {
            return fallback.url as string;
          }
        } catch {
          // Continue to throw direct upload error
        }
      }
      throw new Error('Supabase did not accept the file. Please retry.');
    }
    return signed.publicUrl as string;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('The file could not be uploaded. Please check your connection and retry.');
  }
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
