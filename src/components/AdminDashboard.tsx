import React, { useState, useEffect } from 'react';
import {
  AdminSettings,
  BrandColor,
  CloudSyncStatus,
  Language,
  Template,
  TemplateCategory,
} from '../types';
import {
  CATEGORY_DEFINITIONS,
  UI_TRANSLATIONS,
} from '../data/brandAssets';
import {
  uploadTemplateImage,
  fetchCloudStatusApi,
  reseedTemplatesApi,
} from '../services/templateService';
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
  Users,
  Layers,
  Archive,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Edit,
  Loader2,
} from 'lucide-react';

interface AdminDashboardProps {
  templates: Template[];
  onAddTemplate: (newTemplate: Template) => Promise<void> | void;
  onUpdateTemplate: (id: string, updates: Partial<Template>) => Promise<void> | void;
  onDeleteTemplate: (id: string) => Promise<void> | void;
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

  const [activeTab, setActiveTab] = useState<'templates' | 'supabase' | 'brand' | 'permissions'>('templates');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Cloud Diagnostics State
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);

  // Brand color management
  const [newColorHex, setNewColorHex] = useState<string>('#0284C7');
  const [newColorName, setNewColorName] = useState<string>('Teal Accent');

  // Filter templates
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

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
    storageType: string;
  }>({
    titleEn: '',
    titleAr: '',
    category: 'celebrations',
    width: 1080,
    height: 1080,
    descriptionEn: '',
    descriptionAr: '',
    theme: 'light',
    imageUrl: '',
    storageType: 'local',
  });

  // Load cloud diagnostics on tab switch
  const loadCloudStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await fetchCloudStatusApi();
      setCloudStatus(status);
    } catch (err: any) {
      console.warn('Diagnostics error:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadCloudStatus();
  }, []);

  // Flash notification helper
  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle image upload from computer to cloud storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadTemplateImage(file);
      setNewTemplateForm((prev) => ({
        ...prev,
        imageUrl: result.url,
        width: result.width,
        height: result.height,
        storageType: result.storage,
      }));
      showNotice(
        currentLanguage === 'ar'
          ? `تم رفع الملف بنجاح (${result.width}×${result.height}) إلى التخزين المركزي!`
          : `Image uploaded successfully (${result.width}×${result.height}) to cloud storage!`
      );
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload template image');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit and publish new template
  const handlePublishTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.titleEn.trim() || !newTemplateForm.imageUrl) {
      alert('Please provide a title and upload an image template.');
      return;
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      titleEn: newTemplateForm.titleEn.trim(),
      titleAr: (newTemplateForm.titleAr || newTemplateForm.titleEn).trim(),
      category: newTemplateForm.category,
      width: newTemplateForm.width,
      height: newTemplateForm.height,
      descriptionEn: newTemplateForm.descriptionEn || 'Company approved Vision Medical template.',
      descriptionAr: newTemplateForm.descriptionAr || 'قالب معتمد تم نشره لجميع منسوبي رؤية الطبية.',
      theme: newTemplateForm.theme,
      imageUrl: newTemplateForm.imageUrl,
      defaultNameX: 50,
      defaultNameY: Math.round(newTemplateForm.height * 0.72) / (newTemplateForm.height || 1) * 100,
      defaultFontSize: Math.max(26, Math.min(54, Math.round(newTemplateForm.height * 0.045))),
      defaultColor: newTemplateForm.theme === 'dark' ? '#FFFFFF' : '#0B2545',
      defaultAlignment: 'center',
      safeZone: { minXPercent: 8, maxXPercent: 92, minYPercent: 10, maxYPercent: 90 },
      tags: ['Official', 'Uploaded', newTemplateForm.category],
      isActive: true,
      isCustom: true,
    };

    try {
      await onAddTemplate(newTemplate);
      setShowUploadModal(false);
      showNotice(
        currentLanguage === 'ar'
          ? 'تم نشر القالب بنجاح! أصبح متاحاً الآن لجميع الموظفين.'
          : 'Template published successfully! It is now live for all employees.'
      );
      // Reset form
      setNewTemplateForm({
        titleEn: '',
        titleAr: '',
        category: 'celebrations',
        width: 1080,
        height: 1080,
        descriptionEn: '',
        descriptionAr: '',
        theme: 'light',
        imageUrl: '',
        storageType: 'local',
      });
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    }
  };

  // Submit template edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      await onUpdateTemplate(editingTemplate.id, editingTemplate);
      setEditingTemplate(null);
      showNotice(
        currentLanguage === 'ar'
          ? 'تم حفظ تعديلات القالب وتحديثها لجميع الموظفين.'
          : 'Template updated successfully across all employee sessions.'
      );
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    }
  };

  // Toggle archive / reactivate
  const handleToggleArchive = async (template: Template) => {
    const newActiveState = !template.isActive;
    try {
      await onUpdateTemplate(template.id, { isActive: newActiveState });
      showNotice(
        newActiveState
          ? currentLanguage === 'ar'
            ? 'تمت إعادة تفعيل القالب وإتاحته للموظفين.'
            : 'Template reactivated and restored to employee gallery.'
          : currentLanguage === 'ar'
          ? 'تمت أرشفة القالب وإخفاؤه من معرض الموظفين.'
          : 'Template archived and removed from employee gallery.'
      );
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`);
    }
  };

  // Delete template
  const handleDelete = async (id: string, title: string) => {
    const confirmMsg =
      currentLanguage === 'ar'
        ? `هل أنت متأكد من حذف القالب "${title}" نهائياً من قاعدة البيانات والتخزين؟`
        : `Are you sure you want to permanently delete template "${title}" from cloud database and storage?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await onDeleteTemplate(id);
      showNotice(
        currentLanguage === 'ar'
          ? 'تم حذف القالب نهائياً من النظام.'
          : 'Template permanently deleted.'
      );
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Reseed templates
  const handleReseed = async () => {
    if (
      !window.confirm(
        currentLanguage === 'ar'
          ? 'هل تريد مزامنة وإعادة تثبيت القوالب الرسمية لرؤية الطبية في السحابة؟'
          : 'Sync official Vision Medical templates to the cloud database?'
      )
    )
      return;

    try {
      const msg = await reseedTemplatesApi();
      showNotice(msg);
      loadCloudStatus();
    } catch (err: any) {
      alert(`Reseed failed: ${err.message}`);
    }
  };

  // Filtered templates
  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter === 'active' && !t.isActive) return false;
    if (statusFilter === 'archived' && t.isActive) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 end-6 z-50 bg-[#0B2545] text-white px-4 py-3 rounded-xl shadow-xl border border-sky-400 flex items-center gap-2.5 animate-in slide-in-from-top-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#00A3E0] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner & Mode Notice */}
      <div className="p-6 bg-[#0B2545] rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-xl text-[#38BDF8]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold tracking-tight">
                {currentLanguage === 'ar'
                  ? 'لوحة إدارة القوالب السحابية المركزية'
                  : 'Centralized Cloud Template Studio'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00A3E0] text-white rounded-md uppercase tracking-wider">
                Admin Mode
              </span>
              {cloudStatus?.connected ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Storage Active
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Server Persistent Store
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentLanguage === 'ar'
                ? 'أي قالب يتم رفعه أو تعديله أو أرشفته هنا يُحفظ سحابياً ويظهر فوراً لجميع الموظفين على الرابط المنشور.'
                : 'All template uploads, modifications, and archives are saved to centralized cloud storage and instantly sync to all employees.'}
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
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-[#00A3E0] text-[#0B2545]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            {currentLanguage === 'ar' ? 'إدارة القوالب المركزية' : 'Templates Repository'} ({templates.length})
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('supabase');
            loadCloudStatus();
          }}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'border-[#00A3E0] text-[#0B2545]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>
            {currentLanguage === 'ar' ? 'قاعدة البيانات السحابية' : 'Cloud Database'}
          </span>
          {cloudStatus?.connected && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('brand')}
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'permissions'
              ? 'border-[#00A3E0] text-[#0B2545]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{currentLanguage === 'ar' ? 'الصلاحيات والوصول' : 'Access & Roles'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TEMPLATES REPOSITORY (Upload, Archive, Reactivate, Edit) */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
          {/* Filters & Actions Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                {currentLanguage === 'ar' ? 'تصفية القوالب:' : 'Filter:'}
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
              >
                <option value="all">
                  {currentLanguage === 'ar' ? 'كل التصنيفات' : 'All Categories'}
                </option>
                {Object.entries(CATEGORY_DEFINITIONS).map(([catKey, def]) => (
                  <option key={catKey} value={catKey}>
                    {currentLanguage === 'ar' ? def.labelAr : def.labelEn}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
              >
                <option value="all">
                  {currentLanguage === 'ar' ? 'الكل (مفعل ومؤرشف)' : 'All Statuses'}
                </option>
                <option value="active">
                  {currentLanguage === 'ar' ? 'مفعل فقط (ظاهر للموظفين)' : 'Active Only'}
                </option>
                <option value="archived">
                  {currentLanguage === 'ar' ? 'مؤرشف فقط (مخفي)' : 'Archived Only'}
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">
                {filteredTemplates.length} / {templates.length}
              </span>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1.5 text-xs font-bold bg-[#00A3E0] text-white hover:bg-[#0091C8] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.uploadTemplate}</span>
              </button>
            </div>
          </div>

          {/* Templates Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'القالب' : 'Template'}</th>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'التصنيف' : 'Category'}</th>
                  <th className="p-3 text-start">{currentLanguage === 'ar' ? 'الأبعاد والنسبة' : 'Dimensions'}</th>
                  <th className="p-3 text-center">{currentLanguage === 'ar' ? 'الحالة للموظفين' : 'Employee Status'}</th>
                  <th className="p-3 text-end">{currentLanguage === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTemplates.map((tmpl) => {
                  const title = currentLanguage === 'ar' ? tmpl.titleAr : tmpl.titleEn;
                  const catDef = CATEGORY_DEFINITIONS[tmpl.category];

                  return (
                    <tr
                      key={tmpl.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !tmpl.isActive ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-14 h-9 rounded bg-slate-900 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center shadow-2xs">
                          {tmpl.imageUrl ? (
                            <img
                              src={tmpl.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : tmpl.svgBackground ? (
                            <div
                              className="w-full h-full transform scale-20 origin-center"
                              dangerouslySetInnerHTML={{ __html: tmpl.svgBackground }}
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{title}</span>
                            {tmpl.isCustom && (
                              <span className="px-1.5 py-0.2 text-[9px] bg-sky-100 text-[#005A9C] rounded font-semibold">
                                Admin Uploaded
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{tmpl.id}</div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {currentLanguage === 'ar' ? catDef?.labelAr : catDef?.labelEn}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-600 tabular-nums">
                        {tmpl.width} × {tmpl.height} px
                        <span className="text-slate-400 ms-1 text-[10px]">
                          ({(tmpl.width / tmpl.height).toFixed(2)}:1)
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleArchive(tmpl)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto ${
                            tmpl.isActive
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          }`}
                          title={
                            tmpl.isActive
                              ? 'Active on employee studio (Click to Archive)'
                              : 'Archived / Hidden from employees (Click to Reactivate)'
                          }
                        >
                          {tmpl.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{currentLanguage === 'ar' ? 'مفعل ومنشور' : 'Live & Active'}</span>
                            </>
                          ) : (
                            <>
                              <Archive className="w-3 h-3 text-amber-600" />
                              <span>{currentLanguage === 'ar' ? 'مؤرشف (مخفي)' : 'Archived (Hidden)'}</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => setEditingTemplate(tmpl)}
                            className="p-1.5 text-slate-600 hover:text-[#00A3E0] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit template details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive/Reactivate Quick Button */}
                          <button
                            onClick={() => handleToggleArchive(tmpl)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              tmpl.isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={tmpl.isActive ? 'Archive template' : 'Reactivate template'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(tmpl.id, title)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete template permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CLOUD DATABASE DIAGNOSTICS */}
      {/* ============================================================== */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Cloud Diagnostics Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-[#00A3E0] rounded-xl border border-sky-100">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {currentLanguage === 'ar' ? 'حالة قاعدة البيانات السحابية' : 'Cloud Database Status'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentLanguage === 'ar'
                      ? 'التخزين السحابي المركزي المشترك بين جميع منسوبي رؤية الطبية'
                      : 'Centralized database and storage shared across all employee sessions'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadCloudStatus}
                  disabled={isLoadingStatus}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                  <span>{currentLanguage === 'ar' ? 'فحص الاتصال' : 'Refresh Diagnostics'}</span>
                </button>
                <button
                  onClick={handleReseed}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#0B2545] hover:bg-[#07192F] text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Restore official Vision Medical templates"
                >
                  <Cloud className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{currentLanguage === 'ar' ? 'مزامنة القوالب الرسمية' : 'Sync Official Templates'}</span>
                </button>
              </div>
            </div>

            {/* Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Database Provider
                </span>
                <span className="font-bold text-sm text-[#0B2545] flex items-center gap-1.5 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cloudStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {cloudStatus?.provider === 'postgres'
                    ? 'Neon PostgreSQL'
                    : 'Server Persistent Mode'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Templates Table
                </span>
                <span className="font-bold text-sm text-[#0B2545] flex items-center gap-1.5 mt-1">
                  {cloudStatus?.tableExists ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready ({cloudStatus.totalTemplates} templates)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Not connected</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Storage Bucket (templates)
                </span>
                <span className="font-bold text-sm text-[#0B2545] flex items-center gap-1.5 mt-1">
                  {cloudStatus?.storageExists ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Active (Public CDN)</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 text-sky-600" />
                      <span>Auto-managed</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Diagnostic Message */}
            {cloudStatus?.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  cloudStatus.connected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cloudStatus.message}</span>
              </div>
            )}
          </div>

          {/* Setup Guide: permanent free storage on Neon */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                {currentLanguage === 'ar'
                  ? 'خطوات تفعيل التخزين الدائم المجاني'
                  : 'Setup Guide: Permanent Free Storage'}
              </h4>
              <p className="text-xs text-slate-500">
                {currentLanguage === 'ar'
                  ? 'قاعدة بيانات Neon مجانية ولا تتوقف عند عدم الاستخدام'
                  : 'Neon Postgres is free and wakes up by itself, so it never needs a manual restore'}
              </p>
            </div>

            <ol className="space-y-3 text-xs text-slate-700 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <li className="font-medium">
                <span className="font-bold text-slate-900">Create a free Neon project:</span> Go to{' '}
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00A3E0] underline font-semibold inline-flex items-center gap-0.5"
                >
                  neon.tech <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and copy the project&apos;s <strong className="text-slate-900">connection string</strong>.
              </li>
              <li className="font-medium">
                <span className="font-bold text-slate-900">Add to Render Environment:</span>
                <div className="mt-1.5 font-mono text-[11px] bg-slate-900 text-sky-200 p-2.5 rounded-lg space-y-1">
                  <div>DATABASE_URL = postgresql://...neon.tech/neondb?sslmode=require</div>
                  <div>CLOUDINARY_URL = cloudinary://key:secret@cloud (optional, for images)</div>
                </div>
              </li>
              <li className="font-medium">
                <span className="font-bold text-slate-900">Done!</span> Tables are created automatically and the official templates are added on first start.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BRAND GOVERNANCE (Colors & Fonts) */}
      {/* ============================================================== */}
      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Color Toggle */}
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Typography Governance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {currentLanguage === 'ar' ? 'معايير الخطوط الرسمية' : 'Approved Typography'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentLanguage === 'ar'
                ? 'الخطوط المعتمدة رسمياً في هوية رؤية الطبية'
                : 'Curated corporate fonts configured for employee templates'}
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold">
                Cairo & Tajawal (Official Arabic Primary)
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold">
                Plus Jakarta Sans & Outfit (Official English Primary)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ACCESS & ROLES */}
      {/* ============================================================== */}
      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            {currentLanguage === 'ar' ? 'الصلاحيات الإدارية المعتمدة' : 'Authorized Administrators'}
          </h3>
          <p className="text-xs text-slate-500">
            {currentLanguage === 'ar'
              ? 'الحسابات المصرح لها برفع القوالب وتعديل سياسات الهوية'
              : 'Authorized email accounts permitted to access this management dashboard'}
          </p>
          <div className="space-y-2">
            {adminSettings.authorizedEmails.map((email) => (
              <div
                key={email}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-[#0B2545] font-semibold flex items-center justify-between"
              >
                <span>{email}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Authorized
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* UPLOAD NEW TEMPLATE MODAL (PNG, JPG, WebP) */}
      {/* ============================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="px-6 py-4 bg-[#0B2545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="font-bold text-sm">
                  {currentLanguage === 'ar' ? 'رفع ونشر قالب جديد للموظفين' : 'Upload & Publish Template'}
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishTemplate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {currentLanguage === 'ar' ? 'ملف التصميم (PNG / JPG / WebP)' : 'Template Graphic File'}
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#00A3E0] rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/70">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="template-file-input"
                    disabled={isUploading}
                  />
                  <label htmlFor="template-file-input" className="cursor-pointer space-y-2 block">
                    {isUploading ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-[#00A3E0] animate-spin" />
                        <span className="text-xs font-bold text-slate-700">
                          Uploading to cloud storage...
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#00A3E0] mx-auto" />
                        <p className="text-xs font-bold text-slate-800">
                          {newTemplateForm.imageUrl
                            ? 'Graphic uploaded successfully! Click to choose another'
                            : 'Click to select or drag and drop image'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Supports PNG, JPG, WebP at full resolution
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
                )}

                {newTemplateForm.imageUrl && (
                  <div className="relative mt-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="aspect-16/9 max-h-36 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={newTemplateForm.imageUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-600 px-1">
                      <span>Dimensions: {newTemplateForm.width} × {newTemplateForm.height} px</span>
                      <span className="text-emerald-700 font-semibold font-sans">Ready to publish</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={newTemplateForm.titleEn}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, titleEn: e.target.value })}
                    placeholder="e.g. Eid Al-Fitr Greeting Card"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Title (Arabic) *</label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    value={newTemplateForm.titleAr}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, titleAr: e.target.value })}
                    placeholder="مثال: بطاقة تهنئة عيد الفطر المبارك"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Category & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category *</label>
                  <select
                    value={newTemplateForm.category}
                    onChange={(e) =>
                      setNewTemplateForm({ ...newTemplateForm, category: e.target.value as TemplateCategory })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                  >
                    <option value="celebrations">Celebrations & Occasions (الأعياد والمناسبات)</option>
                    <option value="certificates">Training & Certificates (الشهادات والبرامج التدريبية)</option>
                    <option value="internal-announcements">Internal Announcements (التعاميم والإعلانات)</option>
                    <option value="letterheads">Letterhead, Header & Footer (الخطابات والترويسات)</option>
                    <option value="id-cards">Employee ID & Badges (بطاقات الموظفين)</option>
                    <option value="email-signatures">Email Signatures (تواقيع البريد)</option>
                    <option value="linkedin-banners">LinkedIn Covers (أغلفة لينكد إن)</option>
                    <option value="social-media">Social Media Posts (منشورات التواصل)</option>
                    <option value="event-graphics">Events & Conferences (الفعاليات والمؤتمرات)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Background Tone</label>
                  <select
                    value={newTemplateForm.theme}
                    onChange={(e) =>
                      setNewTemplateForm({ ...newTemplateForm, theme: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                  >
                    <option value="light">Light Background (White / Light theme)</option>
                    <option value="dark">Dark Background (Official Navy / Dark theme)</option>
                    <option value="gradient">Gradient Background</option>
                  </select>
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
                  disabled={!newTemplateForm.imageUrl || isUploading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] disabled:opacity-50 rounded-lg shadow-sm cursor-pointer"
                >
                  Publish Template for All Employees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT TEMPLATE MODAL */}
      {/* ============================================================== */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="px-6 py-4 bg-[#0B2545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="font-bold text-sm">
                  {currentLanguage === 'ar' ? 'تعديل بيانات القالب' : 'Edit Template'}
                </h3>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.titleEn}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, titleEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    value={editingTemplate.titleAr}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, titleAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, category: e.target.value as TemplateCategory })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                  >
                    {Object.entries(CATEGORY_DEFINITIONS).map(([catKey, def]) => (
                      <option key={catKey} value={catKey}>
                        {def.labelEn} ({def.labelAr})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={editingTemplate.isActive ? 'active' : 'archived'}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, isActive: e.target.value === 'active' })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                  >
                    <option value="active">Active (Visible to Employees)</option>
                    <option value="archived">Archived (Hidden from Employees)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Name Y (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={editingTemplate.defaultNameY}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, defaultNameY: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Default Font Size (px)</label>
                  <input
                    type="number"
                    min="14"
                    max="90"
                    value={editingTemplate.defaultFontSize}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, defaultFontSize: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
