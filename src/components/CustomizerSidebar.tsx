import React from 'react';
import {
  AdminSettings,
  CanvasTextElement,
  EmployeeData,
  Language,
  Template,
} from '../types';
import {
  OFFICIAL_BRAND_COLORS,
  OFFICIAL_FONTS,
  UI_TRANSLATIONS,
} from '../data/brandAssets';
import {
  Type,
  Palette,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  Building,
  RotateCcw,
} from 'lucide-react';

interface CustomizerSidebarProps {
  template: Template;
  employeeData: EmployeeData;
  onUpdateEmployeeData: (data: Partial<EmployeeData>) => void;
  elements: CanvasTextElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasTextElement>) => void;
  onResetPositions: () => void;
  onOpenAiAssistant: () => void;
  adminSettings: AdminSettings;
  currentLanguage: Language;
}

export const CustomizerSidebar: React.FC<CustomizerSidebarProps> = ({
  template,
  employeeData,
  onUpdateEmployeeData,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onResetPositions,
  onOpenAiAssistant,
  adminSettings,
  currentLanguage,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  // Current active text element being edited (defaults to 'name')
  const activeElement = elements.find((el) => el.id === (selectedElementId || 'name')) || elements[0];

  const handleNudge = (deltaX: number, deltaY: number) => {
    if (!activeElement) return;
    const newX = Math.max(5, Math.min(95, activeElement.xPercent + deltaX));
    const newY = Math.max(5, Math.min(95, activeElement.yPercent + deltaY));
    onUpdateElement(activeElement.id, {
      xPercent: Math.round(newX * 10) / 10,
      yPercent: Math.round(newY * 10) / 10,
    });
  };

  const handleSnapCenter = () => {
    if (!activeElement) return;
    onUpdateElement(activeElement.id, { xPercent: 50, yPercent: 50 });
  };

  return (
    <aside className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[#00A3E0]" />
          <h2 className="text-sm font-bold text-slate-900">
            {currentLanguage === 'ar' ? 'تخصيص الهوية والنص' : 'Customize Design & Text'}
          </h2>
        </div>

        {/* AI Smart Assist CTA Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#005A9C] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#00A3E0]/30 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span>{currentLanguage === 'ar' ? 'الضبط الذكي' : 'AI Smart Fix'}</span>
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {/* Step 2: Employee Information Inputs */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.employeeNameLabel}</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {currentLanguage === 'ar' ? 'عربي / English' : 'Arabic / English'}
            </span>
          </div>

          <input
            type="text"
            dir="auto"
            value={employeeData.fullName}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateEmployeeData({ fullName: val });
              onUpdateElement('name', { text: val });
            }}
            placeholder={t.employeeNamePlaceholder}
            className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
          />

          {/* Job Title / Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.employeeRoleLabel}</span>
            </label>
            <input
              type="text"
              dir="auto"
              value={employeeData.roleTitle}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateEmployeeData({ roleTitle: val });
                onUpdateElement('role', { text: val });
              }}
              placeholder={t.employeeRolePlaceholder}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
            />
          </div>

          {/* Department / Hospital */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.departmentLabel}</span>
            </label>
            <input
              type="text"
              dir="auto"
              value={employeeData.department}
              onChange={(e) => onUpdateEmployeeData({ department: e.target.value })}
              placeholder={t.departmentPlaceholder}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
            />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Step 3: Typography & Style Controls */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              {currentLanguage === 'ar' ? 'تنسيق النص المحدد' : 'Format Selected Element'}
            </label>

            {/* Switch target element (Name vs Role) */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onSelectElement('name')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeElement?.id === 'name'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {currentLanguage === 'ar' ? 'الاسم' : 'Name'}
              </button>
              <button
                onClick={() => onSelectElement('role')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeElement?.id === 'role'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {currentLanguage === 'ar' ? 'المسمى' : 'Role'}
              </button>
            </div>
          </div>

          {/* Font Family Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.fontStyle}</label>
            <select
              value={activeElement?.fontFamily || 'Cairo'}
              onChange={(e) => onUpdateElement(activeElement.id, { fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] text-slate-900 font-medium"
            >
              {OFFICIAL_FONTS.map((font) => (
                <option key={font.family} value={font.family}>
                  {currentLanguage === 'ar' ? font.labelAr : font.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size & Weight Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{t.fontSize}</span>
                <span className="font-mono text-slate-500">{activeElement?.fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="80"
                value={activeElement?.fontSize || 32}
                onChange={(e) => onUpdateElement(activeElement.id, { fontSize: Number(e.target.value) })}
                className="w-full accent-[#00A3E0] cursor-pointer"
              />
            </div>

            {/* Font Weight */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">{t.fontWeight}</span>
              <select
                value={activeElement?.fontWeight || '700'}
                onChange={(e) =>
                  onUpdateElement(activeElement.id, {
                    fontWeight: e.target.value as CanvasTextElement['fontWeight'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="400">{currentLanguage === 'ar' ? 'عادي (Regular)' : 'Regular (400)'}</option>
                <option value="500">{currentLanguage === 'ar' ? 'متوسط (Medium)' : 'Medium (500)'}</option>
                <option value="600">{currentLanguage === 'ar' ? 'نصف عريض (SemiBold)' : 'SemiBold (600)'}</option>
                <option value="700">{currentLanguage === 'ar' ? 'عريض (Bold)' : 'Bold (700)'}</option>
                <option value="800">{currentLanguage === 'ar' ? 'عريض جداً (ExtraBold)' : 'ExtraBold (800)'}</option>
              </select>
            </div>
          </div>

          {/* Alignment & Shadow */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Alignment buttons */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onUpdateElement(activeElement.id, { alignment: 'left' })}
                className={`p-1.5 rounded-md transition-colors ${
                  activeElement?.alignment === 'left' ? 'bg-white text-[#0B2545] shadow-xs' : 'text-slate-500'
                }`}
                title={t.alignLeft}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateElement(activeElement.id, { alignment: 'center' })}
                className={`p-1.5 rounded-md transition-colors ${
                  activeElement?.alignment === 'center' ? 'bg-white text-[#0B2545] shadow-xs' : 'text-slate-500'
                }`}
                title={t.alignCenter}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateElement(activeElement.id, { alignment: 'right' })}
                className={`p-1.5 rounded-md transition-colors ${
                  activeElement?.alignment === 'right' ? 'bg-white text-[#0B2545] shadow-xs' : 'text-slate-500'
                }`}
                title={t.alignRight}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Drop Shadow Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={activeElement?.hasShadow || false}
                onChange={(e) => onUpdateElement(activeElement.id, { hasShadow: e.target.checked })}
                className="rounded text-[#00A3E0] focus:ring-[#00A3E0]"
              />
              <span>{currentLanguage === 'ar' ? 'ظل متباين' : 'Contrast Shadow'}</span>
            </label>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Step 3C: Brand Colors Palette */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.textColor}</span>
            </label>
            <span className="font-mono text-xs text-slate-500 uppercase">{activeElement?.color}</span>
          </div>

          {/* Approved Brand Color Swatches */}
          <div className="grid grid-cols-5 gap-2">
            {OFFICIAL_BRAND_COLORS.map((col) => {
              const isSelected = activeElement?.color?.toLowerCase() === col.hex.toLowerCase();
              return (
                <button
                  key={col.hex}
                  onClick={() => onUpdateElement(activeElement.id, { color: col.hex })}
                  className={`group relative h-9 rounded-xl border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#00A3E0] ring-offset-1 border-transparent scale-102' : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={`${col.nameEn} (${col.hex})`}
                >
                  {isSelected && (
                    <span
                      className={`text-xs font-bold ${
                        col.hex === '#FFFFFF' || col.hex === '#38BDF8' || col.hex === '#E0F2FE'
                          ? 'text-[#0B2545]'
                          : 'text-white'
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Optional Custom Color Picker (Governed by Admin Settings) */}
          {adminSettings.allowCustomColors && (
            <div className="pt-2 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeElement?.color || '#0B2545'}
                  onChange={(e) => onUpdateElement(activeElement.id, { color: e.target.value })}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                />
                <span className="text-xs font-semibold text-slate-700">{t.customColor}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{activeElement?.color}</span>
            </div>
          )}
        </section>

        <hr className="border-slate-100" />

        {/* Step 4: Fine-Tuning Positioning Controls */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              {currentLanguage === 'ar' ? 'محاذاة وتحريك دقيق' : 'Precision Nudge & Center'}
            </label>
            <button
              onClick={onResetPositions}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              title={t.resetPosition}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetPosition}</span>
            </button>
          </div>

          {/* D-Pad Directional Nudge & Center */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                {currentLanguage === 'ar' ? 'تحريك بالأسهم' : 'Micro-Step Nudge'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                X: {activeElement?.xPercent}% · Y: {activeElement?.yPercent}%
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleNudge(-1, 0)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                title={t.nudgeLeft}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleNudge(0, -1)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                  title={t.nudgeUp}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNudge(0, 1)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                  title={t.nudgeDown}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => handleNudge(1, 0)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                title={t.nudgeRight}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSnapCenter}
                className="ms-2 px-2.5 py-1.5 rounded-lg bg-[#00A3E0] hover:bg-[#0091C8] text-white text-xs font-bold cursor-pointer shadow-2xs flex items-center gap-1"
                title={t.snapToCenter}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{t.snapToCenter.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
};
