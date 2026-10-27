import React, { useState } from 'react';
import { CATEGORY_DEFINITIONS, UI_TRANSLATIONS } from '../data/brandAssets';
import { Language, Template, TemplateCategory } from '../types';
import {
  Search,
  CheckCircle,
  Eye,
  IdCard,
  Mail,
  Linkedin,
  Share2,
  Megaphone,
  Calendar,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  Award,
} from 'lucide-react';

interface TemplateGalleryProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelectTemplate: (template: Template) => void;
  currentLanguage: Language;
  optionalText?: string;
  isOptionalTextActive?: boolean;
  onToggleOptionalText?: (active: boolean) => void;
  onUpdateOptionalText?: (text: string) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  currentLanguage,
  optionalText,
  isOptionalTextActive,
  onToggleOptionalText,
  onUpdateOptionalText,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    if (!template.isActive) return false;
    if (activeCategory !== 'all' && template.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = template.titleEn.toLowerCase().includes(q) || template.descriptionEn.toLowerCase().includes(q);
      const matchAr = template.titleAr.includes(q) || template.descriptionAr.includes(q);
      const matchTag = template.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchEn || matchAr || matchTag;
    }
    return true;
  });

  const categoryList: (TemplateCategory | 'all')[] = [
    'all',
    'certificates',
    'celebrations',
    'internal-announcements',
    'letterheads',
  ];

  const getCategoryIcon = (cat: TemplateCategory | 'all') => {
    switch (cat) {
      case 'certificates':
        return <Award className="w-3.5 h-3.5" />;
      case 'celebrations':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'internal-announcements':
        return <Megaphone className="w-3.5 h-3.5" />;
      case 'letterheads':
        return <FileText className="w-3.5 h-3.5" />;
      case 'id-cards':
        return <IdCard className="w-3.5 h-3.5" />;
      case 'email-signatures':
        return <Mail className="w-3.5 h-3.5" />;
      case 'linkedin-banners':
        return <Linkedin className="w-3.5 h-3.5" />;
      case 'social-media':
        return <Share2 className="w-3.5 h-3.5" />;
      case 'event-graphics':
        return <Calendar className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Optional Text Box Setup (in Change Template / Library View) */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E0F2FE] text-[#00A3E0] shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{t.optionalTextBox}</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {currentLanguage === 'ar' ? 'تخصيص اختياري لجميع القوالب' : 'Available across all templates'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{t.optionalTextDesc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            dir="auto"
            value={optionalText || ''}
            onChange={(e) => onUpdateOptionalText?.(e.target.value)}
            placeholder={t.optionalTextPlaceholder}
            className="flex-1 md:w-72 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] text-slate-900 transition-all"
          />
          <button
            type="button"
            onClick={() => onToggleOptionalText?.(!isOptionalTextActive)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
              isOptionalTextActive
                ? 'bg-[#00A3E0] text-white border-[#00A3E0] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {isOptionalTextActive
              ? '✓ ' + (currentLanguage === 'ar' ? 'مفعّل' : 'Active')
              : '+ ' + (currentLanguage === 'ar' ? 'تفعيل' : 'Enable')}
          </button>
        </div>
      </div>

      {/* Category Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categoryList.map((cat) => {
            const isSelected = activeCategory === cat;
            const label =
              cat === 'all'
                ? t.allCategories
                : currentLanguage === 'ar'
                ? CATEGORY_DEFINITIONS[cat].labelAr
                : CATEGORY_DEFINITIONS[cat].labelEn;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px] md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-9 pe-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            {currentLanguage === 'ar'
              ? 'لم يتم العثور على أي قوالب تطابق بحثك.'
              : 'No templates found matching your search criteria.'}
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#00A3E0] hover:underline cursor-pointer"
          >
            {currentLanguage === 'ar' ? 'عرض جميع القوالب' : 'View all templates'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            const title = currentLanguage === 'ar' ? template.titleAr : template.titleEn;
            const desc = currentLanguage === 'ar' ? template.descriptionAr : template.descriptionEn;
            const catDef = CATEGORY_DEFINITIONS[template.category];
            const catLabel = currentLanguage === 'ar' ? catDef.labelAr : catDef.labelEn;

            return (
              <div
                key={template.id}
                className={`group relative bg-white rounded-xl border transition-all duration-200 flex flex-col overflow-hidden hover:shadow-md ${
                  isSelected
                    ? 'border-[#00A3E0] ring-2 ring-[#00A3E0]/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Visual Thumbnail Preview Container */}
                <div
                  onClick={() => onSelectTemplate(template)}
                  className="relative aspect-4/3 bg-slate-100/80 cursor-pointer overflow-hidden flex items-center justify-center p-3 border-b border-slate-100"
                >
                  {template.imageUrl ? (
                    <img
                      src={template.imageUrl}
                      alt={title}
                      className="max-w-full max-h-full object-contain shadow-xs rounded-sm transition-transform duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                  ) : template.svgBackground ? (
                    <div
                      className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-102"
                      dangerouslySetInnerHTML={{ __html: template.svgBackground }}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">Preview Not Available</div>
                  )}

                  {/* Overlay Action Buttons */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                      className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-xs transition-transform hover:scale-105 cursor-pointer"
                      title={t.previewTemplate}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="px-3.5 py-2 rounded-lg bg-[#00A3E0] hover:bg-[#0091C8] text-white text-xs font-bold shadow-xs transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.useTemplate}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-3 end-3 bg-[#00A3E0] text-white rounded-full p-1 shadow-sm">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Card Content & Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Quiet typographic category & dimension separator (Zero-Pill discipline) */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
                      <span>{catLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{template.width} × {template.height} px</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#005A9C] transition-colors line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.previewTemplate}</span>
                    </button>

                    <button
                      onClick={() => onSelectTemplate(template)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B2545] text-white'
                          : 'bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#005A9C]'
                      }`}
                    >
                      {isSelected ? '✓ ' + (currentLanguage === 'ar' ? 'محدد' : 'Selected') : t.useTemplate}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {currentLanguage === 'ar' ? previewTemplate.titleAr : previewTemplate.titleEn}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{previewTemplate.category}</span>
                  <span>·</span>
                  <span className="font-mono">{previewTemplate.width} × {previewTemplate.height} px</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-2 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-900 flex items-center justify-center max-h-[60vh] overflow-auto">
              <div
                className="max-w-full max-h-full rounded-lg shadow-lg overflow-hidden"
                style={{
                  aspectRatio: `${previewTemplate.width} / ${previewTemplate.height}`,
                  maxWidth: '100%',
                }}
              >
                {previewTemplate.imageUrl ? (
                  <img
                    src={previewTemplate.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: previewTemplate.svgBackground || '' }}
                  />
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500 max-w-md">
                {currentLanguage === 'ar' ? previewTemplate.descriptionAr : previewTemplate.descriptionEn}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  {currentLanguage === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] rounded-lg cursor-pointer"
                >
                  {t.useTemplate}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
