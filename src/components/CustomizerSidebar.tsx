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
  FileText,
  Plus,
  Check,
  Award,
  Calendar,
  PenTool,
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
  onToggleOptionalText: (enabled: boolean) => void;
  isOptionalTextActive: boolean;
  onToggleOptionalText2: (enabled: boolean) => void;
  isOptionalText2Active: boolean;
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
  onToggleOptionalText,
  isOptionalTextActive,
  onToggleOptionalText2,
  isOptionalText2Active,
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
        {/* Step 2: Information Inputs */}
        {template.category === 'certificates' || elements.some((e) => e.id.startsWith('cert-')) ? (
          /* ================= Certificate 5 Text Boxes + Optional ================= */
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>{currentLanguage === 'ar' ? 'بيانات الشهادة التدريبية (5 حقول)' : 'Certificate Details (5 Fields)'}</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {currentLanguage === 'ar' ? '5 نصوص أساسية + اختياري' : '5 Core + Optional'}
              </span>
            </div>

            {/* 1. Recipient Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentLanguage === 'ar' ? '1. اسم المتدرب / المستلم' : '1. Recipient Full Name'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => onSelectElement('cert-name')}
                  className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                >
                  {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                </button>
              </div>
              <input
                type="text"
                dir="auto"
                value={elements.find((el) => el.id === 'cert-name')?.text ?? employeeData.fullName}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateEmployeeData({ fullName: val });
                  onUpdateElement('cert-name', { text: val });
                }}
                placeholder={currentLanguage === 'ar' ? 'مثال: د. طارق بن عبد العزيز المنصور' : 'e.g. Dr. Tariq Al-Mansoor'}
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
              />
            </div>

            {/* 2. Program / Course Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentLanguage === 'ar' ? '2. اسم الدورة / البرنامج التدريبي' : '2. Training Program Title'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => onSelectElement('cert-program')}
                  className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                >
                  {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                </button>
              </div>
              <input
                type="text"
                dir="auto"
                value={elements.find((el) => el.id === 'cert-program')?.text ?? ''}
                onChange={(e) => onUpdateElement('cert-program', { text: e.target.value })}
                placeholder={currentLanguage === 'ar' ? 'مثال: المناظير المتقدمة للجهاز الهضمي والتقنيات التشخيصية' : 'e.g. Advanced Gastrointestinal Endoscopy'}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
              />
            </div>

            {/* 3. Accreditation, Hours & Date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentLanguage === 'ar' ? '3. الاعتماد والساعات والتاريخ' : '3. Accreditation, Hours & Date'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => onSelectElement('cert-accreditation')}
                  className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                >
                  {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                </button>
              </div>
              <input
                type="text"
                dir="auto"
                value={elements.find((el) => el.id === 'cert-accreditation')?.text ?? ''}
                onChange={(e) => onUpdateElement('cert-accreditation', { text: e.target.value })}
                placeholder={currentLanguage === 'ar' ? 'مثال: معتمد بـ 15 ساعة تعليم طبي مستمر · 27 أكتوبر 2026' : 'e.g. CME Accredited: 15 Credit Hours · 27 October 2026'}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
              />
            </div>

            {/* 4 & 5. Signatories Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {/* Signatory 1 (Left) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-slate-500" />
                    <span>{currentLanguage === 'ar' ? '4. المشرف الأكاديمي (اليسار)' : '4. Academic Director (Left)'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onSelectElement('cert-signatory-1')}
                    className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                  >
                    {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                  </button>
                </div>
                <input
                  type="text"
                  dir="auto"
                  value={elements.find((el) => el.id === 'cert-signatory-1')?.text ?? ''}
                  onChange={(e) => onUpdateElement('cert-signatory-1', { text: e.target.value })}
                  placeholder={currentLanguage === 'ar' ? 'د. فهد العتيبي — رئيس الأكاديمية' : 'Dr. Fahad Al-Otaibi — Training Director'}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>

              {/* Signatory 2 (Right) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <PenTool className="w-3 h-3 text-slate-500" />
                    <span>{currentLanguage === 'ar' ? '5. المدير الطبي التنفيذي (اليمين)' : '5. Chief Medical Officer (Right)'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onSelectElement('cert-signatory-2')}
                    className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                  >
                    {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                  </button>
                </div>
                <input
                  type="text"
                  dir="auto"
                  value={elements.find((el) => el.id === 'cert-signatory-2')?.text ?? ''}
                  onChange={(e) => onUpdateElement('cert-signatory-2', { text: e.target.value })}
                  placeholder={currentLanguage === 'ar' ? 'أ.د. خالد الشهري — المدير الطبي التنفيذي' : 'Prof. Khalid Al-Shehri — Chief Medical Officer'}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900"
                />
              </div>
            </div>

            {/* 6. Optional Text Box 1 (Certificate ID / Distinction) */}
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{currentLanguage === 'ar' ? 'حقل اختياري ١ (رقم الشهادة / ملاحظات)' : 'Optional Text Box 1 (Cert ID / Notes)'}</span>
                </label>
                <div className="flex items-center gap-2">
                  {isOptionalTextActive && (
                    <button
                      type="button"
                      onClick={() => onSelectElement('optional')}
                      className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                    >
                      {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleOptionalText(!isOptionalTextActive)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isOptionalTextActive ? 'bg-[#00A3E0]' : 'bg-slate-300'
                    }`}
                    title="Toggle optional text box 1"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        isOptionalTextActive ? 'end-0.5' : 'start-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {currentLanguage === 'ar'
                  ? 'تفعيل حقل إضافي لرقم ترخيص الشهادة، أو التقدير، أو اسم المركز المعتمد.'
                  : 'Enable an optional extra text box for certificate license ID, honors, or training center.'}
              </p>

              {isOptionalTextActive && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <input
                    type="text"
                    dir="auto"
                    value={elements.find((el) => el.id === 'optional')?.text || employeeData.optionalText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateEmployeeData({ optionalText: val });
                      onUpdateElement('optional', { text: val, isVisible: true });
                    }}
                    placeholder={currentLanguage === 'ar' ? 'رقم الشهادة: VM-ACAD-2026-9082' : 'Certificate ID: VM-ACAD-2026-9082'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
                  />

                  {/* Certificate Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {[
                      {
                        label: currentLanguage === 'ar' ? 'رقم الشهادة' : 'Cert ID',
                        text: 'Certificate ID: VM-ACAD-2026-9082 · Riyadh, KSA',
                      },
                      {
                        label: currentLanguage === 'ar' ? 'مع مرتبة الشرف' : 'Honors',
                        text: currentLanguage === 'ar' ? 'بتقدير ممتاز مع مرتبة الشرف الأولى' : 'Passed with Highest Distinction',
                      },
                      {
                        label: currentLanguage === 'ar' ? 'اعتماد سباهي' : 'CBAHI',
                        text: currentLanguage === 'ar' ? 'برنامج معتمد من المركز السعودي للاعتماد' : 'CBAHI Accredited Program',
                      },
                      {
                        label: currentLanguage === 'ar' ? 'مركز التدريب' : 'Academy',
                        text: currentLanguage === 'ar' ? 'أكاديمية التدريب الطبي التخصصي · الرياض' : 'Vision Medical Training Center · Riyadh',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onUpdateEmployeeData({ optionalText: preset.text });
                          onUpdateElement('optional', { text: preset.text, isVisible: true });
                          onSelectElement('optional');
                        }}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#005A9C] text-slate-600 transition-colors cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Optional Text Box 2 (Accreditation Code / Date / Seal) */}
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{currentLanguage === 'ar' ? 'حقل اختياري ٢ (كود التحقق / التاريخ / الختم)' : 'Optional Text Box 2 (Verification / Date / Seal)'}</span>
                </label>
                <div className="flex items-center gap-2">
                  {isOptionalText2Active && (
                    <button
                      type="button"
                      onClick={() => onSelectElement('optional-2')}
                      className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                    >
                      {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleOptionalText2(!isOptionalText2Active)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isOptionalText2Active ? 'bg-[#00A3E0]' : 'bg-slate-300'
                    }`}
                    title="Toggle optional text box 2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        isOptionalText2Active ? 'end-0.5' : 'start-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {currentLanguage === 'ar'
                  ? 'تفعيل حقل ثانٍ لكود التحقق، أو تاريخ الإصدار، أو الملاحظات الأكاديمية.'
                  : 'Enable a second optional text box for verification code, issue date, or academic remarks.'}
              </p>

              {isOptionalText2Active && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <input
                    type="text"
                    dir="auto"
                    value={elements.find((el) => el.id === 'optional-2')?.text || employeeData.optionalText2 || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateEmployeeData({ optionalText2: val });
                      onUpdateElement('optional-2', { text: val, isVisible: true });
                    }}
                    placeholder={currentLanguage === 'ar' ? 'كود التحقق: CME-VM-8849 · معتمد' : 'Accreditation Code: CME-VM-8849 · Verified'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
                  />

                  {/* Certificate Quick Presets for Box 2 */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {[
                      {
                        label: currentLanguage === 'ar' ? 'كود الاعتماد' : 'Code',
                        text: 'CME-ACC-VM-2026-X88',
                      },
                      {
                        label: currentLanguage === 'ar' ? 'تاريخ التخرج' : 'Issued',
                        text: currentLanguage === 'ar' ? 'صدرت بتاريخ: ٢٧ أكتوبر ٢٠٢٦م' : 'Issued: 27 October 2026',
                      },
                      {
                        label: currentLanguage === 'ar' ? 'الختم الإلكتروني' : 'E-Seal',
                        text: currentLanguage === 'ar' ? 'شهادة موثقة إلكترونياً برقم ترخيص ٩٢١٠' : 'Digitally Certified & Sealed #9210',
                      },
                      {
                        label: currentLanguage === 'ar' ? 'التحقق' : 'Verify',
                        text: 'verify.visionmedicalksa.com/certs',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onUpdateEmployeeData({ optionalText2: preset.text });
                          onUpdateElement('optional-2', { text: preset.text, isVisible: true });
                          onSelectElement('optional-2');
                        }}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#005A9C] text-slate-600 transition-colors cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* ================= Regular Templates (Name, Role, Department + Optional) ================= */
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

            {/* Optional Text Box 1 Setup */}
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{t.optionalTextBox1 || (currentLanguage === 'ar' ? 'مربع نص اختياري ١' : 'Optional Text Box 1')}</span>
                </label>
                <div className="flex items-center gap-2">
                  {isOptionalTextActive && (
                    <button
                      type="button"
                      onClick={() => onSelectElement('optional')}
                      className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                    >
                      {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleOptionalText(!isOptionalTextActive)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isOptionalTextActive ? 'bg-[#00A3E0]' : 'bg-slate-300'
                    }`}
                    title="Toggle optional text box 1"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        isOptionalTextActive ? 'end-0.5' : 'start-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{t.optionalTextDesc}</p>

              {isOptionalTextActive && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <input
                    type="text"
                    dir="auto"
                    value={elements.find((el) => el.id === 'optional')?.text || employeeData.optionalText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateEmployeeData({ optionalText: val });
                      onUpdateElement('optional', { text: val, isVisible: true });
                    }}
                    placeholder={t.optionalTextPlaceholder}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
                  />

                  {/* Quick Presets for Box 1 */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {[
                      { label: currentLanguage === 'ar' ? 'المركز' : 'Center', text: currentLanguage === 'ar' ? 'مركز رؤية لجراحة القلب والأوعية' : 'Heart & Vascular Center' },
                      { label: currentLanguage === 'ar' ? 'الرقم' : 'ID', text: 'ID: VM-884920' },
                      { label: currentLanguage === 'ar' ? 'اعتماد' : 'Accredited', text: currentLanguage === 'ar' ? 'معتمد من سباهي و JCI' : 'CBAHI & JCI Accredited' },
                      { label: currentLanguage === 'ar' ? 'شعار' : 'Slogan', text: currentLanguage === 'ar' ? 'التميز في الرعاية الصحية' : 'Excellence in Healthcare' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onUpdateEmployeeData({ optionalText: preset.text });
                          onUpdateElement('optional', { text: preset.text, isVisible: true });
                          onSelectElement('optional');
                        }}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#005A9C] text-slate-600 transition-colors cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Text Box 2 Setup */}
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{t.optionalTextBox2 || (currentLanguage === 'ar' ? 'مربع نص اختياري ٢' : 'Optional Text Box 2')}</span>
                </label>
                <div className="flex items-center gap-2">
                  {isOptionalText2Active && (
                    <button
                      type="button"
                      onClick={() => onSelectElement('optional-2')}
                      className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                    >
                      {currentLanguage === 'ar' ? 'تنسيق' : 'Format'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleOptionalText2(!isOptionalText2Active)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isOptionalText2Active ? 'bg-[#00A3E0]' : 'bg-slate-300'
                    }`}
                    title="Toggle optional text box 2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        isOptionalText2Active ? 'end-0.5' : 'start-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {t.optionalText2Desc || (currentLanguage === 'ar' ? 'أضف حقلاً إضافياً ثانياً للمدينة، الفرع، الهاتف، أو الملاحظات.' : 'Add a second text line for branch, phone/ext, date, or notice.')}
              </p>

              {isOptionalText2Active && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <input
                    type="text"
                    dir="auto"
                    value={elements.find((el) => el.id === 'optional-2')?.text || employeeData.optionalText2 || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateEmployeeData({ optionalText2: val });
                      onUpdateElement('optional-2', { text: val, isVisible: true });
                    }}
                    placeholder={t.optionalText2Placeholder || (currentLanguage === 'ar' ? 'مثال: الفرع الرئيسي بالرياض أو هاتف: ٩٢٠٠٠٩٣٦٥' : 'e.g. Riyadh Main Center or Ext: 4402')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] transition-all text-slate-900"
                  />

                  {/* Quick Presets for Box 2 */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {[
                      { label: currentLanguage === 'ar' ? 'الموحد' : 'Toll-Free', text: currentLanguage === 'ar' ? 'الرقم الموحد: ٩٢٠٠ ٠٩٣٦٥' : 'Toll-Free: 9200 09365' },
                      { label: currentLanguage === 'ar' ? 'المدينة' : 'City', text: currentLanguage === 'ar' ? 'الرياض · المملكة العربية السعودية' : 'Riyadh, Saudi Arabia' },
                      { label: currentLanguage === 'ar' ? 'الموقع' : 'Web', text: 'www.visionmedicalksa.com' },
                      { label: currentLanguage === 'ar' ? 'الفرع' : 'Branch', text: currentLanguage === 'ar' ? 'فرع العليا التخصصي' : 'Olaya Specialized Branch' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onUpdateEmployeeData({ optionalText2: preset.text });
                          onUpdateElement('optional-2', { text: preset.text, isVisible: true });
                          onSelectElement('optional-2');
                        }}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#00A3E0] hover:text-[#005A9C] text-slate-600 transition-colors cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <hr className="border-slate-100" />

        {/* Step 3: Typography & Style Controls */}
        <section className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                {currentLanguage === 'ar' ? 'تنسيق الحقل المحدد' : 'Format Selected Element'}
              </label>
              <span className="text-[10px] font-mono text-[#00A3E0] bg-[#E0F2FE] px-2 py-0.5 rounded-md font-semibold">
                {activeElement?.id}
              </span>
            </div>

            {/* Dynamic element selector pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {elements.map((el) => {
                const isSelected = activeElement?.id === el.id;
                const rawLabel =
                  (currentLanguage === 'ar' ? el.labelAr : el.labelEn) ||
                  (el.id === 'name' || el.id === 'cert-name'
                    ? currentLanguage === 'ar' ? 'الاسم' : 'Name'
                    : el.id === 'role' || el.id === 'cert-program'
                    ? currentLanguage === 'ar' ? 'المسمى' : 'Role'
                    : el.id === 'optional-2'
                    ? currentLanguage === 'ar' ? 'نص إضافي ٢' : 'Optional 2'
                    : currentLanguage === 'ar' ? 'نص إضافي ١' : 'Optional 1');

                const shortLabel = rawLabel.split(/[(:—]/)[0].trim();
                const isInactiveOptional = (el.id === 'optional' && !isOptionalTextActive) || (el.id === 'optional-2' && !isOptionalText2Active);

                return (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => {
                      if (el.id === 'optional' && !isOptionalTextActive) {
                        onToggleOptionalText(true);
                      }
                      if (el.id === 'optional-2' && !isOptionalText2Active) {
                        onToggleOptionalText2(true);
                      }
                      onSelectElement(el.id);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#0B2545] shadow-xs font-bold ring-1 ring-slate-200'
                        : isInactiveOptional
                        ? 'text-slate-400 hover:text-slate-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
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
