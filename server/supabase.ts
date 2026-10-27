import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Template, AdminSettings, CloudSyncStatus } from '../src/types';
import { INITIAL_TEMPLATES } from '../src/data/initialTemplates';

// Storage paths for reliable local fallback
const DATA_DIR = path.resolve(process.cwd(), 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const ADMIN_SETTINGS_FILE = path.join(DATA_DIR, 'admin_settings.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Global Supabase client instance (initialized if credentials provided)
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(`[Supabase] Initialized client for ${supabaseUrl}`);
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
    supabase = null;
  }
} else {
  console.log('[Supabase] No credentials found in environment. Running in persistent local mode.');
}

// Check configuration status
export function isSupabaseConfigured(): boolean {
  return !!(supabase && supabaseUrl && supabaseKey);
}

// Convert DB snake_case record to frontend Template object
function mapDbToTemplate(row: any): Template {
  return {
    id: row.id,
    titleEn: row.title_en || '',
    titleAr: row.title_ar || row.title_en || '',
    category: row.category,
    width: Number(row.width) || 1080,
    height: Number(row.height) || 1080,
    descriptionEn: row.description_en || '',
    descriptionAr: row.description_ar || '',
    theme: row.theme || 'light',
    imageUrl: row.image_url || undefined,
    svgBackground: row.svg_background || undefined,
    defaultNameX: Number(row.default_name_x) ?? 50,
    defaultNameY: Number(row.default_name_y) ?? 50,
    defaultRoleX: row.default_role_x != null ? Number(row.default_role_x) : undefined,
    defaultRoleY: row.default_role_y != null ? Number(row.default_role_y) : undefined,
    defaultFontSize: Number(row.default_font_size) || 36,
    defaultRoleFontSize: row.default_role_font_size != null ? Number(row.default_role_font_size) : undefined,
    defaultColor: row.default_color || '#0B2545',
    defaultRoleColor: row.default_role_color || undefined,
    defaultAlignment: row.default_alignment || 'center',
    safeZone: row.safe_zone || { minXPercent: 5, maxXPercent: 95, minYPercent: 8, maxYPercent: 92 },
    tags: Array.isArray(row.tags) ? row.tags : [],
    isActive: row.is_active !== false,
    isPopular: !!row.is_popular,
    defaultElements: row.default_elements || undefined,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
    isCustom: !!row.id.startsWith('custom-'),
  };
}

// Convert frontend Template to DB snake_case record
function mapTemplateToDb(t: Template): any {
  return {
    id: t.id,
    title_en: t.titleEn,
    title_ar: t.titleAr,
    category: t.category,
    width: t.width,
    height: t.height,
    description_en: t.descriptionEn || '',
    description_ar: t.descriptionAr || '',
    theme: t.theme,
    image_url: t.imageUrl || null,
    svg_background: t.svgBackground || null,
    default_name_x: t.defaultNameX,
    default_name_y: t.defaultNameY,
    default_role_x: t.defaultRoleX ?? null,
    default_role_y: t.defaultRoleY ?? null,
    default_font_size: t.defaultFontSize,
    default_role_font_size: t.defaultRoleFontSize ?? null,
    default_color: t.defaultColor,
    default_role_color: t.defaultRoleColor ?? null,
    default_alignment: t.defaultAlignment,
    safe_zone: t.safeZone,
    tags: t.tags || [],
    is_active: t.isActive !== false,
    is_popular: !!t.isPopular,
    default_elements: t.defaultElements || null,
  };
}

// Read from local persistent JSON
function getLocalTemplates(): Template[] {
  try {
    if (!fs.existsSync(TEMPLATES_FILE)) {
      // Seed with initial templates on first load
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(INITIAL_TEMPLATES, null, 2), 'utf8');
      return INITIAL_TEMPLATES;
    }
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('[Storage] Error reading local templates file:', err);
  }
  return INITIAL_TEMPLATES;
}

// Save to local persistent JSON
function saveLocalTemplates(templates: Template[]): void {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
  } catch (err) {
    console.error('[Storage] Error saving local templates file:', err);
  }
}

// Get all templates from Supabase or local fallback
export async function getAllTemplates(includeArchived = false): Promise<Template[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('templates').select('*').order('created_at', { ascending: false });
      if (!includeArchived) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map(mapDbToTemplate);
      }

      if (error) {
        console.warn('[Supabase] Query templates error, falling back to local store:', error.message);
      } else if (data && data.length === 0) {
        // Table exists but is empty -> auto seed initial templates to Supabase
        console.log('[Supabase] Templates table is empty. Auto-seeding initial templates...');
        await seedInitialTemplates();
        const recheck = await supabase.from('templates').select('*').order('created_at', { ascending: false });
        if (recheck.data && recheck.data.length > 0) {
          const list = recheck.data.map(mapDbToTemplate);
          return includeArchived ? list : list.filter((t) => t.isActive);
        }
      }
    } catch (err) {
      console.error('[Supabase] Exception querying templates:', err);
    }
  }

  // Fallback to persistent local file store
  const local = getLocalTemplates();
  return includeArchived ? local : local.filter((t) => t.isActive !== false);
}

// Create new template in Supabase & local store
export async function createTemplate(template: Template): Promise<Template> {
  const newTemplate: Template = {
    ...template,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Always update local storage for reliability
  const local = getLocalTemplates();
  const existingIdx = local.findIndex((t) => t.id === newTemplate.id);
  if (existingIdx >= 0) {
    local[existingIdx] = newTemplate;
  } else {
    local.unshift(newTemplate);
  }
  saveLocalTemplates(local);

  // If Supabase is connected, insert into Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbRecord = mapTemplateToDb(newTemplate);
      const { data, error } = await supabase
        .from('templates')
        .upsert(dbRecord, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error inserting template:', error);
      } else if (data) {
        return mapDbToTemplate(data);
      }
    } catch (err) {
      console.error('[Supabase] Exception inserting template:', err);
    }
  }

  return newTemplate;
}

// Update existing template in Supabase & local store
export async function updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
  // Update local
  const local = getLocalTemplates();
  const index = local.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }

  const updated: Template = {
    ...local[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  local[index] = updated;
  saveLocalTemplates(local);

  // Update Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbUpdates: any = {};
      if (updates.titleEn !== undefined) dbUpdates.title_en = updates.titleEn;
      if (updates.titleAr !== undefined) dbUpdates.title_ar = updates.titleAr;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.width !== undefined) dbUpdates.width = updates.width;
      if (updates.height !== undefined) dbUpdates.height = updates.height;
      if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
      if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.defaultNameX !== undefined) dbUpdates.default_name_x = updates.defaultNameX;
      if (updates.defaultNameY !== undefined) dbUpdates.default_name_y = updates.defaultNameY;
      if (updates.defaultRoleX !== undefined) dbUpdates.default_role_x = updates.defaultRoleX;
      if (updates.defaultRoleY !== undefined) dbUpdates.default_role_y = updates.defaultRoleY;
      if (updates.defaultFontSize !== undefined) dbUpdates.default_font_size = updates.defaultFontSize;
      if (updates.defaultRoleFontSize !== undefined) dbUpdates.default_role_font_size = updates.defaultRoleFontSize;
      if (updates.defaultColor !== undefined) dbUpdates.default_color = updates.defaultColor;
      if (updates.defaultRoleColor !== undefined) dbUpdates.default_role_color = updates.defaultRoleColor;
      if (updates.defaultAlignment !== undefined) dbUpdates.default_alignment = updates.defaultAlignment;
      if (updates.safeZone !== undefined) dbUpdates.safe_zone = updates.safeZone;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;
      if (updates.defaultElements !== undefined) dbUpdates.default_elements = updates.defaultElements;

      const { data, error } = await supabase
        .from('templates')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Error updating template:', error);
      } else if (data) {
        return mapDbToTemplate(data);
      }
    } catch (err) {
      console.error('[Supabase] Exception updating template:', err);
    }
  }

  return updated;
}

// Delete template
export async function deleteTemplate(id: string): Promise<boolean> {
  // Delete from local
  const local = getLocalTemplates();
  const filtered = local.filter((t) => t.id !== id);
  const existed = filtered.length < local.length;
  if (existed) {
    saveLocalTemplates(filtered);
  }

  // Delete from Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Error deleting template:', error);
      }
    } catch (err) {
      console.error('[Supabase] Exception deleting template:', err);
    }
  }

  return existed;
}

// Upload image to Supabase Storage or persistent file server
export async function uploadImageFile(
  base64Data: string,
  fileName: string,
  mimeType: string
): Promise<{ url: string; storage: 'supabase' | 'local' }> {
  // Clean base64 string
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const safeExt = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const cleanFileName = `vm-template-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;

  // Try Supabase Storage first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .upload(cleanFileName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage.from('templates').getPublicUrl(cleanFileName);
        if (publicData?.publicUrl) {
          console.log(`[Supabase Storage] Uploaded template image: ${publicData.publicUrl}`);
          return { url: publicData.publicUrl, storage: 'supabase' };
        }
      }
      if (error) {
        console.warn('[Supabase Storage] Upload failed, falling back to local uploads folder:', error.message);
      }
    } catch (err) {
      console.error('[Supabase Storage] Exception uploading file:', err);
    }
  }

  // Fallback to local uploads directory
  const localFilePath = path.join(UPLOADS_DIR, cleanFileName);
  fs.writeFileSync(localFilePath, buffer);
  const publicUrl = `/uploads/${cleanFileName}`;
  console.log(`[Storage] Saved template image locally: ${publicUrl}`);
  return { url: publicUrl, storage: 'local' };
}

// Seed initial templates to Supabase if empty
export async function seedInitialTemplates(): Promise<number> {
  if (!isSupabaseConfigured() || !supabase) return 0;

  try {
    const records = INITIAL_TEMPLATES.map(mapTemplateToDb);
    const { data, error } = await supabase
      .from('templates')
      .upsert(records, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[Supabase] Error seeding initial templates:', error);
      return 0;
    }
    console.log(`[Supabase] Successfully seeded ${data?.length || 0} official templates!`);
    return data?.length || 0;
  } catch (err) {
    console.error('[Supabase] Exception during seeding:', err);
    return 0;
  }
}

// Get cloud synchronization diagnostics
export async function getCloudDiagnostics(): Promise<CloudSyncStatus> {
  const localTemplates = getLocalTemplates();
  const activeCount = localTemplates.filter((t) => t.isActive !== false).length;

  if (!isSupabaseConfigured() || !supabase) {
    return {
      provider: 'local_fallback',
      connected: false,
      tableExists: false,
      storageExists: false,
      totalTemplates: localTemplates.length,
      activeTemplates: activeCount,
      lastSyncTime: new Date().toISOString(),
      message: 'Running in server persistent mode. Add SUPABASE_URL and SUPABASE_ANON_KEY to connect to Supabase PostgreSQL & Storage.',
    };
  }

  let tableExists = false;
  let storageExists = false;
  let remoteCount = 0;
  let remoteActive = 0;
  let statusMessage = 'Connected to Supabase PostgreSQL & Storage.';

  try {
    const { data, error } = await supabase.from('templates').select('id, is_active');
    if (!error) {
      tableExists = true;
      remoteCount = data?.length || 0;
      remoteActive = data?.filter((r) => r.is_active !== false).length || 0;
    } else {
      statusMessage = `Connected to Supabase, but templates table not found: ${error.message}. Please run supabase-schema.sql.`;
    }

    // Check storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (!bucketError && buckets) {
      storageExists = buckets.some((b) => b.name === 'templates');
    }
  } catch (err: any) {
    statusMessage = `Connection error: ${err.message || err}`;
  }

  return {
    provider: 'supabase',
    connected: tableExists,
    tableExists,
    storageExists,
    totalTemplates: tableExists ? remoteCount : localTemplates.length,
    activeTemplates: tableExists ? remoteActive : activeCount,
    lastSyncTime: new Date().toISOString(),
    message: statusMessage,
    supabaseUrl,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

// Get admin settings
export async function getAdminSettings(): Promise<AdminSettings | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 'current').single();
      if (!error && data) {
        return {
          allowCustomColors: data.allow_custom_colors,
          requireApproval: data.require_approval,
          maxExportResolution: data.max_export_resolution || '2x',
          watermarkEnabled: data.watermark_enabled,
          authorizedEmails: data.authorized_emails || [],
          approvedColors: data.approved_colors || [],
          approvedFonts: data.approved_fonts || [],
        };
      }
    } catch {
      // fallback
    }
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

// Save admin settings
export async function saveAdminSettings(settings: AdminSettings): Promise<boolean> {
  try {
    fs.writeFileSync(ADMIN_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local admin settings:', err);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('admin_settings').upsert({
        id: 'current',
        allow_custom_colors: settings.allowCustomColors,
        require_approval: settings.requireApproval,
        max_export_resolution: settings.maxExportResolution,
        watermark_enabled: settings.watermarkEnabled,
        authorized_emails: settings.authorizedEmails,
        approved_colors: settings.approvedColors,
        approved_fonts: settings.approvedFonts,
      });
      return true;
    } catch (err) {
      console.error('Error saving admin settings to Supabase:', err);
    }
  }

  return true;
}
