export type Language = 'en' | 'ar';

export type TemplateCategory =
  | 'certificates'
  | 'celebrations'
  | 'internal-announcements'
  | 'letterheads'
  | 'id-cards'
  | 'email-signatures'
  | 'linkedin-banners'
  | 'social-media'
  | 'event-graphics';

export interface SafeZone {
  minXPercent: number; // e.g. 5
  maxXPercent: number; // e.g. 95
  minYPercent: number; // e.g. 10
  maxYPercent: number; // e.g. 90
}

export interface Template {
  id: string;
  titleEn: string;
  titleAr: string;
  category: TemplateCategory;
  width: number; // in pixels, e.g. 1584 for LinkedIn, 1080 for Instagram, 800 for Email Sig
  height: number;
  descriptionEn: string;
  descriptionAr: string;
  theme: 'light' | 'dark' | 'gradient';
  svgBackground?: string; // High-res procedural SVG background
  imageUrl?: string; // Optional uploaded image URL
  defaultNameX: number; // percentage (0-100)
  defaultNameY: number; // percentage (0-100)
  defaultRoleX?: number;
  defaultRoleY?: number;
  defaultFontSize: number;
  defaultRoleFontSize?: number;
  defaultColor: string;
  defaultRoleColor?: string;
  defaultAlignment: 'left' | 'center' | 'right';
  safeZone: SafeZone;
  tags: string[];
  isActive: boolean;
  isPopular?: boolean;
  defaultElements?: CanvasTextElement[];
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface EmployeeData {
  fullName: string;
  roleTitle: string;
  department: string;
  optionalText?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
}

export interface CanvasTextElement {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number; // in px relative to base canvas size
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800';
  color: string;
  alignment: 'left' | 'center' | 'right';
  xPercent: number; // 0 - 100% of canvas width
  yPercent: number; // 0 - 100% of canvas height
  letterSpacing: number; // px or em
  lineHeight: number;
  hasShadow?: boolean;
  shadowColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  opacity?: number;
  isVisible?: boolean;
  labelEn?: string;
  labelAr?: string;
}

export interface BrandColor {
  nameEn: string;
  nameAr: string;
  hex: string;
  isPrimary?: boolean;
  description?: string;
}

export interface BrandFont {
  family: string;
  labelEn: string;
  labelAr: string;
  supportedScripts: ('latin' | 'arabic')[];
  category: 'sans' | 'serif' | 'display';
}

export interface AdminSettings {
  allowCustomColors: boolean;
  requireApproval: boolean;
  maxExportResolution: 'standard' | '2x' | '3x';
  watermarkEnabled: boolean;
  authorizedEmails: string[];
  approvedColors: BrandColor[];
  approvedFonts: string[];
}

export interface CloudSyncStatus {
  provider: 'supabase' | 'local_fallback';
  connected: boolean;
  tableExists: boolean;
  storageExists: boolean;
  totalTemplates: number;
  activeTemplates: number;
  lastSyncTime: string;
  message?: string;
  supabaseUrl?: string;
  hasServiceRoleKey?: boolean;
}

