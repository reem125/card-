import React, { useState } from 'react';
import {
  AdminSettings,
  BrandColor,
  Language,
  Template,
  TemplateCategory,
} from '../types';
import {
  CATEGORY_DEFINITIONS,
  OFFICIAL_BRAND_COLORS,
  OFFICIAL_FONTS,
  UI_TRANSLATIONS,
} from '../data/brandAssets';
import {
  ShieldCheck,
  Plus,
  Upload,
  Trash2,
  Eye,
  Sliders,
  Check,
  X,
  Palette,
  Type,
  Users,
  Layers,
  Lock,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardProps {
  templates: Template[];
  onAddTemplate: (newTemplate: Template) => void;
  onUpdateTemplate: (id: string, updates: Partial<Template>) => void;
  onDeleteTemplate: (id: string) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: Partial<AdminSettings>) => void;
  currentLanguage: Language;
  onCloseAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  adminSettings,
  onUpdateAdminSettings,
  currentLanguage,
  onCloseAdmin,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [activeTab, setActiveTab] = useState<'templates' | 'brand' | 'permissions'>('templates');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newColorHex, setNewColorHex] = useState<string>('#0284C7');
  const [newColorName, setNewColorName] = useState<string>('Teal Accent');
  const [saveBanner, setSaveBanner] = useState<boolean>(false);

  // New template form state
  const [newTemplateForm, setNewTemplateForm] = useState<{
    titleEn: string;
    titleAr: string;
    category: TemplateCategory;
    width: number;
    height: number;
    descriptionEn: string;
    descriptionAr: string;
    theme: 'light' | 'dark' | 'gradient';
    imageUrl: string;
  }>({
    titleEn: '',
    titleAr: '',
    category: 'social-media',
    width: 1080,
    height: 1080,
    descriptionEn: '',
    descriptionAr: '',
    theme: 'light',
    imageUrl: '',
  });

  // Handle image upload from user computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewTemplateForm((prev) => ({
        ...prev,
        imageUrl: result,
      }));

      // Extract image natural dimensions
      const img = new Image();
      img.onload = () => {
        setNewTemplateForm((prev) => ({
          ...prev,
          width: img.naturalWidth || 1080,
          height: img.naturalHeight || 1080,
        }));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.titleEn.trim() || !newTemplateForm.imageUrl) {
      alert('Please provide a title and upload an image template.');
      return;
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      titleEn: newTemplateForm.titleEn,
      titleAr: newTemplateForm.titleAr || newTemplateForm.titleEn,
      category: newTemplateForm.category,
      width: newTemplateForm.width,
      height: newTemplateForm.height,
      descriptionEn: newTemplateForm.descriptionEn || 'Custom company uploaded template.',
      descriptionAr: newTemplateForm.descriptionAr || 'قالب مخصص تم رفعه بواسطة إدارة الهوية والتسويق.',
      theme: newTemplateForm.theme,
      imageUrl: newTemplateForm.imageUrl,
      defaultNameX: 50,
      defaultNameY: 50,
      defaultFontSize: Math.round(newTemplateForm.height * 0.05),
      defaultColor: newTemplateForm.theme === 'dark' ? '#FFFFFF' : '#0B2545',
      defaultAlignment: 'center',
      safeZone: { minXPercent: 10, maxXPercent: 90, minYPercent: 15, maxYPercent: 85 },
      tags: ['Custom', 'Uploaded', newTemplateForm.category],
      isActive: true,
    };

    onAddTemplate(newTemplate);
    setShowUploadModal(false);
    // Reset form
    setNewTemplateForm({
      titleEn: '',
      titleAr: '',
      category: 'social-media',
      width: 1080,
      height: 1080,
      descriptionEn: '',
      descriptionAr: '',
      theme: 'light',
      imageUrl: '',
    });
  };

  const handleAddColor = () => {
    if (!newColorHex) return;
    const color: BrandColor = {
      nameEn: newColorName || 'Custom Brand Color',
      nameAr: newColorName || 'لون معتمد إضافي',
      hex: newColorHex.toUpperCase(),
      isPrimary: false,
    };
    onUpdateAdminSettings({
      approvedColors: [...adminSettings.approvedColors, color],
    });
  };

  const handleRemoveColor = (hex: string) => {
    onUpdateAdminSettings({
      approvedColors: adminSettings.approvedColors.filter((c) => c.hex !== hex),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Mode Notice */}
      <div className="p-6 bg-[#0B2545] rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-xl text-[#38BDF8]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">
                {currentLanguage === 'ar' ? 'لوحة تحكم إدارة الهوية والقوالب' : 'Brand Governance & Admin Studio'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00A3E0] text-white rounded-md uppercase">
                Authorized
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentLanguage === 'ar'
                ? 'الحساب المصرح: marketing@visionmedicalksa.com · إدارة القوالب وحوكمة الألوان والخطوط'
                : 'Session: marketing@visionmedicalksa.com · Template publishing, brand enforcement & color permissions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-xs font-bold bg-[#00A3E0] hover:bg-[#0091C8] text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{t.uploadTemplate}</span>
          </button>
          <button
            onClick={onCloseAdmin}
            className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
          >
            {t.backToStudio}
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'border-[#00A3E0] text-[#0B2545]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{currentLanguage === 'ar' ? 'إدارة القوالب' : 'Templates Repository'} ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('brand')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'brand'
              ? 'border-[#00A3E0] text-[#0B2545]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>{currentLanguage === 'ar' ? 'حوكمة الألوان والخطوط' : 'Brand Governance'}</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-[#00A3E0] text-[#0B2545]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{currentLanguage === 'ar' ? 'الصلاحيات والوصول' : 'Access & Roles'}</span>
        </button>
      </div>

      {/* Tab 1: Template Management Table */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {currentLanguage === 'ar' ? 'قائمة القوالب المعتمدة' : 'Official Template Library'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentLanguage === 'ar'
                  ? 'يمكنك تفعيل أو أرشفة أي قالب لمنع الموظفين من استخدامه'
                  : 'Toggle active status or archive outdated templates'}
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[#0B2545] text-white hover:bg-[#07192F] rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.uploadTemplate}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'القالب' : 'Template'}</th>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'التصنيف' : 'Category'}</th>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'الأبعاد' : 'Dimensions'}</th>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'المظهر' : 'Theme'}</th>
                  <th className="p-3 text-center">{currentLanguage === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 text-end">{currentLanguage === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map((tmpl) => {
                  const title = currentLanguage === 'ar' ? tmpl.titleAr : tmpl.titleEn;
                  const catDef = CATEGORY_DEFINITIONS[tmpl.category];

                  return (
                    <tr key={tmpl.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-slate-900 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                          {tmpl.imageUrl ? (
                            <img src={tmpl.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : tmpl.svgBackground ? (
                            <div
                              className="w-full h-full transform scale-20 origin-center"
                              dangerouslySetInnerHTML={{ __html: tmpl.svgBackground }}
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{tmpl.id}</div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {currentLanguage === 'ar' ? catDef?.labelAr : catDef?.labelEn}
                      </td>
                      <td className="p-3 font-mono text-slate-600 tabular-nums">
                        {tmpl.width} × {tmpl.height}
                      </td>
                      <td className="p-3">
                        <span className="capitalize text-slate-700">{tmpl.theme}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onUpdateTemplate(tmpl.id, { isActive: !tmpl.isActive })}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            tmpl.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {tmpl.isActive ? 'Active' : 'Archived'}
                        </button>
                      </td>
                      <td className="p-3 text-end space-x-2">
                        {tmpl.id.startsWith('custom-') && (
                          <button
                            onClick={() => onDeleteTemplate(tmpl.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete custom template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Brand Governance */}
      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Permitted Colors & Custom Color Restriction */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#00A3E0]" />
                <span>{currentLanguage === 'ar' ? 'ضوابط ألوان الهوية' : 'Brand Color Governance'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLanguage === 'ar'
                  ? 'التحكم في خيارات الألوان المتاحة للموظفين'
                  : 'Manage employee color options and restrictions'}
              </p>
            </div>

            {/* Custom Color Toggle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {t.allowCustomColorsLabel}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 max-w-xs">
                  {t.allowCustomColorsDesc}
                </span>
              </div>
              <button
                onClick={() =>
                  onUpdateAdminSettings({
                    allowCustomColors: !adminSettings.allowCustomColors,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  adminSettings.allowCustomColors ? 'bg-[#00A3E0]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    adminSettings.allowCustomColors ? 'end-0.5' : 'start-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Approved Colors List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                {currentLanguage === 'ar' ? 'الألوان المعتمدة' : 'Approved Brand Palette'}
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {adminSettings.approvedColors.map((color) => (
                  <div
                    key={color.hex}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-lg border border-slate-300 shrink-0 shadow-2xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800">
                          {currentLanguage === 'ar' ? color.nameAr : color.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ms-2">
                          {color.hex}
                        </span>
                      </div>
                    </div>
                    {!color.isPrimary && (
                      <button
                        onClick={() => handleRemoveColor(color.hex)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove color"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Color Row */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color Name"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800"
                />
                <button
                  onClick={handleAddColor}
                  className="px-3 py-2 text-xs font-bold bg-[#0B2545] text-white hover:bg-[#07192F] rounded-lg cursor-pointer"
                >
                  {currentLanguage === 'ar' ? 'إضافة' : 'Add'}
                </button>
              </div>
            </div>
          </div>

          {/* Approved Fonts Governance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Type className="w-4 h-4 text-[#00A3E0]" />
                <span>{currentLanguage === 'ar' ? 'الخطوط المعتمدة' : 'Approved Typography'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLanguage === 'ar'
                  ? 'مجموعة الخطوط العربية والإنجليزية المعتمدة لهوية رؤية الطبية'
                  : 'Company-approved Arabic and Latin font families'}
              </p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {OFFICIAL_FONTS.map((font) => (
                <div
                  key={font.family}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block" style={{ fontFamily: font.family }}>
                      {currentLanguage === 'ar' ? font.labelAr : font.labelEn}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {font.supportedScripts.join(' & ')} · {font.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Enabled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Access & Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00A3E0]" />
              <span>{currentLanguage === 'ar' ? 'صلاحيات المشرفين' : 'Authorized Brand Administrators'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLanguage === 'ar'
                ? 'الحسابات المسموح لها بنشر القوالب وتعديل سياسات الهوية'
                : 'Accounts with permission to upload templates and modify brand rules'}
            </p>
          </div>

          <div className="space-y-3">
            {adminSettings.authorizedEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00A3E0] text-white flex items-center justify-center font-bold text-xs">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">{email}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {email.includes('marketing')
                        ? 'Marketing & Brand Governance Director (Current)'
                        : 'Senior Brand Manager'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  Super Admin
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">{t.uploadTemplate}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {currentLanguage === 'ar' ? 'ملف التصميم الخلفي (PNG / JPG / SVG)' : 'Template Background File'}
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-[#00A3E0] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="template-file-input"
                  />
                  <label htmlFor="template-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-[#00A3E0] mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      {newTemplateForm.imageUrl
                        ? 'Image loaded successfully! Click to change'
                        : 'Click to select or drag and drop image'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports PNG, JPG, WebP at high resolution
                    </p>
                  </label>
                </div>

                {newTemplateForm.imageUrl && (
                  <div className="relative mt-2 aspect-16/9 max-h-36 bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={newTemplateForm.imageUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={newTemplateForm.titleEn}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, titleEn: e.target.value })}
                    placeholder="e.g. Senior Medical Staff ID"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={newTemplateForm.titleAr}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, titleAr: e.target.value })}
                    placeholder="مثال: بطاقة الكادر الطبي الأول"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Category & Theme */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={newTemplateForm.category}
                    onChange={(e) =>
                      setNewTemplateForm({ ...newTemplateForm, category: e.target.value as TemplateCategory })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900"
                  >
                    <option value="celebrations">Celebrations & Holidays</option>
                    <option value="internal-announcements">Internal Announcements</option>
                    <option value="letterheads">Letterhead, Header & Footer</option>
                    <option value="id-cards">Employee ID & Badges</option>
                    <option value="email-signatures">Email Signatures</option>
                    <option value="linkedin-banners">LinkedIn Covers</option>
                    <option value="social-media">Social Media Posts</option>
                    <option value="event-graphics">Events & Conferences</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Background Tone</label>
                  <select
                    value={newTemplateForm.theme}
                    onChange={(e) =>
                      setNewTemplateForm({ ...newTemplateForm, theme: e.target.value as 'light' | 'dark' | 'gradient' })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900"
                  >
                    <option value="light">Light Background</option>
                    <option value="dark">Dark / Navy Background</option>
                    <option value="gradient">Gradient Background</option>
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Width (px)</label>
                  <input
                    type="number"
                    value={newTemplateForm.width}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, width: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Height (px)</label>
                  <input
                    type="number"
                    value={newTemplateForm.height}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, height: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] rounded-lg shadow-xs cursor-pointer"
                >
                  Publish Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
