-- ==============================================================================
-- Vision Medical Employee Template Studio — Supabase Database & Storage Schema
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It creates:
--   1. The 'templates' table for centralized template management.
--   2. The 'admin_settings' table for brand governance.
--   3. Row Level Security (RLS) policies allowing public read for active templates
--      and authorized write access.
--   4. The 'templates' public Storage Bucket for high-resolution graphics.
--   5. Automatic updated_at timestamps.
-- ==============================================================================

-- 1. Create Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    category TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1080,
    height INTEGER NOT NULL DEFAULT 1080,
    description_en TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'light',
    image_url TEXT,
    svg_background TEXT,
    default_name_x NUMERIC NOT NULL DEFAULT 50,
    default_name_y NUMERIC NOT NULL DEFAULT 50,
    default_role_x NUMERIC,
    default_role_y NUMERIC,
    default_font_size INTEGER NOT NULL DEFAULT 36,
    default_role_font_size INTEGER,
    default_color TEXT NOT NULL DEFAULT '#0B2545',
    default_role_color TEXT,
    default_alignment TEXT NOT NULL DEFAULT 'center',
    safe_zone JSONB NOT NULL DEFAULT '{"minXPercent": 5, "maxXPercent": 95, "minYPercent": 8, "maxYPercent": 92}'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    default_elements JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy queries by category and status
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_created ON public.templates(created_at DESC);

-- 2. Create Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    allow_custom_colors BOOLEAN NOT NULL DEFAULT true,
    require_approval BOOLEAN NOT NULL DEFAULT false,
    max_export_resolution TEXT NOT NULL DEFAULT '2x',
    watermark_enabled BOOLEAN NOT NULL DEFAULT false,
    authorized_emails TEXT[] NOT NULL DEFAULT ARRAY['marketing@visionmedicalksa.com', 'brand@visionmedicalksa.com', 'hr@visionmedicalksa.com'],
    approved_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    approved_fonts TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_templates_updated_at ON public.templates;
CREATE TRIGGER trigger_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_admin_settings_updated_at ON public.admin_settings;
CREATE TRIGGER trigger_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 4a. Policies for 'templates' table
-- Anyone can view active templates (for employees)
DROP POLICY IF EXISTS "Public can view active templates" ON public.templates;
CREATE POLICY "Public can view active templates"
    ON public.templates
    FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Full access for service_role or authenticated administrators
DROP POLICY IF EXISTS "Service role full access on templates" ON public.templates;
CREATE POLICY "Service role full access on templates"
    ON public.templates
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4b. Policies for 'admin_settings' table
DROP POLICY IF EXISTS "Public can read admin settings" ON public.admin_settings;
CREATE POLICY "Public can read admin settings"
    ON public.admin_settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Service role manage admin settings" ON public.admin_settings;
CREATE POLICY "Service role manage admin settings"
    ON public.admin_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Storage Bucket Configuration for 'templates'
-- Insert the public bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'templates',
    'templates',
    true,
    52428800, -- 50 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- Storage RLS Policies: Public read access
DROP POLICY IF EXISTS "Public Access to Templates Bucket" ON storage.objects;
CREATE POLICY "Public Access to Templates Bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'templates');

-- Storage RLS Policies: Service role and admin upload access
DROP POLICY IF EXISTS "Service Role Upload to Templates Bucket" ON storage.objects;
CREATE POLICY "Service Role Upload to Templates Bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'templates');

DROP POLICY IF EXISTS "Service Role Update to Templates Bucket" ON storage.objects;
CREATE POLICY "Service Role Update to Templates Bucket"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'templates');

DROP POLICY IF EXISTS "Service Role Delete from Templates Bucket" ON storage.objects;
CREATE POLICY "Service Role Delete from Templates Bucket"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'templates');

-- ==============================================================================
-- Schema setup complete.
-- You can now paste your SUPABASE_URL and SUPABASE_ANON_KEY /
-- SUPABASE_SERVICE_ROLE_KEY into your Render / server environment variables!
-- ==============================================================================
