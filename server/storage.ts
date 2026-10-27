import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Template, AdminSettings, CloudSyncStatus } from '../src/types';
import { INITIAL_TEMPLATES } from '../src/data/initialTemplates';

// Storage backends:
//   - DATABASE_URL (free Neon Postgres, auto-wakes, never needs manual restore) holds
//     templates, admin settings, and uploaded images.
//   - CLOUDINARY_URL (optional, free) holds uploaded images instead of the database.
//   - Without DATABASE_URL, falls back to local files (fine for local dev only:
//     Render's free disk is wiped on every restart).

const DATA_DIR = path.resolve(process.cwd(), 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const ADMIN_SETTINGS_FILE = path.join(DATA_DIR, 'admin_settings.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const databaseUrl = process.env.DATABASE_URL?.trim();
const pool = databaseUrl
  ? new pg.Pool({
      connectionString: databaseUrl,
      ssl: /localhost|127\.0\.0\.1/.test(databaseUrl) ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30_000,
    })
  : null;

if (pool) {
  // Neon closes idle connections; log and let the pool reconnect instead of crashing.
  pool.on('error', (err) => console.warn('[Database] Idle connection error:', err.message));
  console.log('[Database] Using Postgres from DATABASE_URL');
} else {
  console.log('[Database] No DATABASE_URL found. Running in local file mode (not permanent on Render).');
}

// cloudinary://<api_key>:<api_secret>@<cloud_name>
function getCloudinaryConfig(): { cloudName: string; apiKey: string; apiSecret: string } | null {
  const raw = process.env.CLOUDINARY_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'cloudinary:' || !url.hostname || !url.username || !url.password) return null;
    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password),
    };
  } catch {
    console.warn('[Cloudinary] CLOUDINARY_URL is not in the form cloudinary://key:secret@cloud_name');
    return null;
  }
}

export function isDatabaseConfigured(): boolean {
  return !!pool;
}

// Create tables and seed official templates once
let readyPromise: Promise<void> | null = null;
function ensureReady(): Promise<void> {
  if (!pool) return Promise.resolve();
  if (!readyPromise) {
    readyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vm_templates (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS vm_settings (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS vm_images (
          id TEXT PRIMARY KEY,
          mime_type TEXT NOT NULL,
          bytes BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      const { rows } = await pool.query('SELECT count(*)::int AS n FROM vm_templates');
      if (rows[0].n === 0) {
        await seedInitialTemplates();
      }
    })().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}

function rowToTemplate(row: any): Template {
  return {
    ...row.data,
    id: row.id,
    isActive: row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    isCustom: row.id.startsWith('custom-'),
  };
}

// Read from local persistent JSON
function getLocalTemplates(): Template[] {
  try {
    if (!fs.existsSync(TEMPLATES_FILE)) {
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(INITIAL_TEMPLATES, null, 2), 'utf8');
      return INITIAL_TEMPLATES;
    }
    const parsed = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('[Storage] Error reading local templates file:', err);
  }
  return INITIAL_TEMPLATES;
}

function saveLocalTemplates(templates: Template[]): void {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
  } catch (err) {
    console.error('[Storage] Error saving local templates file:', err);
  }
}

export async function getAllTemplates(includeArchived = false): Promise<Template[]> {
  if (pool) {
    await ensureReady();
    const { rows } = await pool.query(
      `SELECT * FROM vm_templates ${includeArchived ? '' : 'WHERE is_active'} ORDER BY created_at DESC`
    );
    return rows.map(rowToTemplate);
  }

  const local = getLocalTemplates();
  return includeArchived ? local : local.filter((t) => t.isActive !== false);
}

export async function createTemplate(template: Template): Promise<Template> {
  const now = new Date().toISOString();
  const newTemplate: Template = { ...template, createdAt: now, updatedAt: now };

  if (pool) {
    await ensureReady();
    const { rows } = await pool.query(
      `INSERT INTO vm_templates (id, data, is_active)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, is_active = EXCLUDED.is_active, updated_at = now()
       RETURNING *`,
      [newTemplate.id, newTemplate, newTemplate.isActive !== false]
    );
    return rowToTemplate(rows[0]);
  }

  const local = getLocalTemplates();
  const existingIdx = local.findIndex((t) => t.id === newTemplate.id);
  if (existingIdx >= 0) {
    local[existingIdx] = newTemplate;
  } else {
    local.unshift(newTemplate);
  }
  saveLocalTemplates(local);
  return newTemplate;
}

export async function updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
  if (pool) {
    await ensureReady();
    const { id: _ignored, ...fields } = updates;
    const { rows } = await pool.query(
      `UPDATE vm_templates
       SET data = data || $2::jsonb,
           is_active = COALESCE($3, is_active),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, fields, updates.isActive ?? null]
    );
    return rows[0] ? rowToTemplate(rows[0]) : null;
  }

  const local = getLocalTemplates();
  const index = local.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }
  const updated: Template = { ...local[index], ...updates, updatedAt: new Date().toISOString() };
  local[index] = updated;
  saveLocalTemplates(local);
  return updated;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  if (pool) {
    await ensureReady();
    const { rowCount } = await pool.query('DELETE FROM vm_templates WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }

  const local = getLocalTemplates();
  const filtered = local.filter((t) => t.id !== id);
  const existed = filtered.length < local.length;
  if (existed) {
    saveLocalTemplates(filtered);
  }
  return existed;
}

async function uploadToCloudinary(
  dataUri: string,
  config: { cloudName: string; apiKey: string; apiSecret: string }
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'vision-medical-templates';
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${config.apiSecret}`)
    .digest('hex');

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', config.apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const body: any = await res.json();
  if (!res.ok || !body.secure_url) {
    throw new Error(body?.error?.message || `Cloudinary upload failed (HTTP ${res.status})`);
  }
  return body.secure_url;
}

export async function uploadImageFile(
  base64Data: string,
  fileName: string,
  mimeType: string
): Promise<{ url: string; storage: 'cloudinary' | 'database' | 'local' }> {
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const safeExt = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const imageId = `vm-template-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const cloudinary = getCloudinaryConfig();
  if (cloudinary) {
    const url = await uploadToCloudinary(`data:${mimeType};base64,${cleanBase64}`, cloudinary);
    console.log(`[Cloudinary] Uploaded template image: ${url}`);
    return { url, storage: 'cloudinary' };
  }

  if (pool) {
    await ensureReady();
    const id = `${imageId}.${safeExt}`;
    await pool.query('INSERT INTO vm_images (id, mime_type, bytes) VALUES ($1, $2, $3)', [id, mimeType, buffer]);
    return { url: `/api/images/${id}`, storage: 'database' };
  }

  const cleanFileName = `${imageId}.${safeExt}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, cleanFileName), buffer);
  console.log(`[Storage] Saved template image locally: /uploads/${cleanFileName}`);
  return { url: `/uploads/${cleanFileName}`, storage: 'local' };
}

export async function getImage(id: string): Promise<{ mimeType: string; bytes: Buffer } | null> {
  if (!pool) return null;
  await ensureReady();
  const { rows } = await pool.query('SELECT mime_type, bytes FROM vm_images WHERE id = $1', [id]);
  return rows[0] ? { mimeType: rows[0].mime_type, bytes: rows[0].bytes } : null;
}

// Restore the official templates (keeps admin-created ones)
export async function seedInitialTemplates(): Promise<number> {
  if (!pool) return 0;
  // Older created_at for later entries keeps the original gallery order
  const base = Date.now();
  for (const [i, t] of INITIAL_TEMPLATES.entries()) {
    await pool.query(
      `INSERT INTO vm_templates (id, data, is_active, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, is_active = EXCLUDED.is_active, updated_at = now()`,
      [t.id, t, t.isActive !== false, new Date(base - i * 1000)]
    );
  }
  console.log(`[Database] Seeded ${INITIAL_TEMPLATES.length} official templates`);
  return INITIAL_TEMPLATES.length;
}

export async function getCloudDiagnostics(): Promise<CloudSyncStatus> {
  const imageStorage = getCloudinaryConfig() ? 'Cloudinary' : 'the database';

  if (!pool) {
    const local = getLocalTemplates();
    return {
      provider: 'local_fallback',
      connected: false,
      tableExists: false,
      storageExists: false,
      totalTemplates: local.length,
      activeTemplates: local.filter((t) => t.isActive !== false).length,
      lastSyncTime: new Date().toISOString(),
      message: 'Not permanent: add DATABASE_URL (free Neon Postgres) in Render → Environment so uploads survive restarts.',
    };
  }

  try {
    await ensureReady();
    const { rows } = await pool.query(
      'SELECT count(*)::int AS total, count(*) FILTER (WHERE is_active)::int AS active FROM vm_templates'
    );
    return {
      provider: 'postgres',
      connected: true,
      tableExists: true,
      storageExists: true,
      totalTemplates: rows[0].total,
      activeTemplates: rows[0].active,
      lastSyncTime: new Date().toISOString(),
      message: `Connected to permanent Postgres storage. Uploaded images are saved in ${imageStorage}.`,
    };
  } catch (err: any) {
    return {
      provider: 'postgres',
      connected: false,
      tableExists: false,
      storageExists: false,
      totalTemplates: 0,
      activeTemplates: 0,
      lastSyncTime: new Date().toISOString(),
      message: `Database connection error: ${err.message || err}`,
    };
  }
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  if (pool) {
    await ensureReady();
    const { rows } = await pool.query("SELECT data FROM vm_settings WHERE id = 'current'");
    return rows[0]?.data ?? null;
  }

  if (fs.existsSync(ADMIN_SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ADMIN_SETTINGS_FILE, 'utf8'));
    } catch {
      // fallback
    }
  }
  return null;
}

export async function saveAdminSettings(settings: AdminSettings): Promise<boolean> {
  if (pool) {
    await ensureReady();
    await pool.query(
      `INSERT INTO vm_settings (id, data) VALUES ('current', $1)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [settings]
    );
    return true;
  }

  try {
    fs.writeFileSync(ADMIN_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local admin settings:', err);
  }
  return true;
}
