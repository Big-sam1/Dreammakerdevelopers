/**
 * Browser client for the server-side MongoDB API. The MongoDB URI stays in
 * the server environment; it must never be exposed as a VITE_ variable.
 */
export async function getCmsStateFromMongo(): Promise<unknown | null> {
  try {
    const response = await fetch('/api/cms-state', { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.state || null;
  } catch {
    return null;
  }
}

export async function saveCmsStateToMongo(state: unknown): Promise<boolean> {
  try {
    const token = localStorage.getItem('dmd_admin_token');
    const response = await fetch('/api/cms-state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ state }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function loginWithMongo(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!response.ok || !result.token) return { success: false, error: result.error || 'Login failed.' };
    localStorage.setItem('dmd_admin_token', result.token);
    return { success: true };
  } catch {
    return { success: false, error: 'Cannot reach the DMD server. Start the API server and try again.' };
  }
}

export async function makeCircularFavicon(file: File): Promise<File> {
  const image = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare favicon.');
  const sourceSize = Math.min(image.width, image.height);
  const sourceX = (image.width - sourceSize) / 2;
  const sourceY = (image.height - sourceSize) / 2;
  context.beginPath();
  context.arc(256, 256, 256, 0, Math.PI * 2);
  context.clip();
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 512, 512);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not create favicon.');
  return new File([blob], 'favicon.png', { type: 'image/png' });
}

export async function uploadImageToMongo(file: File): Promise<string> {
  const token = localStorage.getItem('dmd_admin_token');
  const response = await fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file,
  });
  const result = await response.json();
  if (!response.ok || !result.url) throw new Error(result.error || 'Upload failed.');
  return result.url;
}

export async function savePublicSubmission(type: 'project' | 'contact', submission: unknown): Promise<boolean> {
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, submission }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
