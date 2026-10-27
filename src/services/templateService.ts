import { Template, AdminSettings, CloudSyncStatus } from '../types';

/**
 * Client service to communicate with the centralized template API
 * (backed by Postgres and Cloudinary, with a local file fallback)
 */

const ADMIN_PASSWORD_KEY = 'vm-admin-password';

function getAdminPassword(): string {
  try {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY) || '';
  } catch {
    return '';
  }
}

function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...extra, 'x-admin-password': getAdminPassword() };
}

/**
 * Verify the admin password with the server and remember it for this browser tab
 */
export async function loginAdminApi(password: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  try {
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
  } catch {}
  return true;
}

export function hasAdminSession(): boolean {
  return !!getAdminPassword();
}

export async function fetchTemplatesFromApi(includeAll = false): Promise<Template[]> {
  try {
    const url = `/api/templates${includeAll ? '?all=true' : ''}`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch templates (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.templates)) {
      return data.templates;
    }
  } catch (err) {
    console.error('Error fetching templates from server API:', err);
  }
  return [];
}

/**
 * Uploads an image file (PNG, JPG, WebP) to cloud storage
 * Returns permanent URL and natural dimensions
 */
export async function uploadTemplateImage(
  file: File
): Promise<{ url: string; width: number; height: number; storage: 'cloudinary' | 'database' | 'local' }> {
  // 1. Read dimensions on client side
  const { width, height } = await getImageDimensions(file);

  // 2. Read as base64
  const base64Data = await readFileAsBase64(file);

  // 3. Send to server upload endpoint
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      base64Data,
      fileName: file.name,
      mimeType: file.type || 'image/png',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed: ${errText || res.statusText}`);
  }

  const data = await res.json();
  if (!data.success || !data.url) {
    throw new Error(data.error || 'Failed to obtain uploaded image URL');
  }

  return {
    url: data.url,
    width,
    height,
    storage: data.storage || 'local',
  };
}

/**
 * Helper to get natural dimensions of image File
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth || 1080,
        height: img.naturalHeight || 1080,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: 1080, height: 1080 });
    };
    img.src = objectUrl;
  });
}

/**
 * Helper to convert File to base64
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Publish a new template to the cloud
 */
export async function createTemplateApi(template: Template): Promise<Template> {
  const res = await fetch('/api/admin/templates', {
    method: 'POST',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(template),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to publish template: ${err}`);
  }

  const data = await res.json();
  if (!data.success || !data.template) {
    throw new Error(data.error || 'Failed to publish template');
  }

  return data.template;
}

/**
 * Update an existing template (e.g. archive/reactivate, update safe zones, labels)
 */
export async function updateTemplateApi(
  id: string,
  updates: Partial<Template>
): Promise<Template> {
  const res = await fetch(`/api/admin/templates/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: adminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update template: ${err}`);
  }

  const data = await res.json();
  if (!data.success || !data.template) {
    throw new Error(data.error || 'Failed to update template');
  }

  return data.template;
}

/**
 * Delete a template from cloud storage
 */
export async function deleteTemplateApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/templates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to delete template: ${err}`);
  }

  const data = await res.json();
  return !!data.success;
}

/**
 * Retrieve cloud synchronization status & diagnostics
 */
export async function fetchCloudStatusApi(): Promise<CloudSyncStatus> {
  const res = await fetch('/api/admin/sync-status', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Diagnostics request failed (${res.status})`);
  }
  const data = await res.json();
  return data.status;
}

/**
 * Reseed official Vision Medical templates
 */
export async function reseedTemplatesApi(): Promise<string> {
  const res = await fetch('/api/admin/reseed', { method: 'POST', headers: adminHeaders() });
  const data = await res.json();
  return data.message || 'Reseeded successfully';
}

/**
 * Fetch company-wide admin settings
 */
export async function fetchAdminSettingsApi(): Promise<AdminSettings | null> {
  try {
    const res = await fetch('/api/admin/settings', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.settings || null;
    }
  } catch (err) {
    console.error('Error fetching admin settings:', err);
  }
  return null;
}

/**
 * Save company-wide admin settings
 */
export async function saveAdminSettingsApi(settings: AdminSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (err) {
    console.error('Error saving admin settings:', err);
    return false;
  }
}
