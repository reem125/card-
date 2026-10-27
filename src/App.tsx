import React, { useState, useEffect } from 'react';
import {
  AdminSettings,
  CanvasTextElement,
  EmployeeData,
  Language,
  Template,
} from './types';
import { INITIAL_TEMPLATES } from './data/initialTemplates';
import {
  OFFICIAL_BRAND_COLORS,
  OFFICIAL_FONTS,
  UI_TRANSLATIONS,
  VISION_LOGO_URL,
} from './data/brandAssets';
import { Header } from './components/Header';
import { TemplateGallery } from './components/TemplateGallery';
import { TemplateCanvas } from './components/TemplateCanvas';
import { CustomizerSidebar } from './components/CustomizerSidebar';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ExportModal } from './components/ExportModal';
import { AdminDashboard } from './components/AdminDashboard';
import {
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle,
  Download,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Check,
  FileText,
} from 'lucide-react';

export default function App() {
  // Language & Direction State (English LTR / Arabic RTL)
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Admin Mode Toggle
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Workflow Current Step (1: Select Template, 2: Name, 3: Style, 4: Position, 5: Export)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Active View Mode: 'gallery' or 'editor'
  const [activeView, setActiveView] = useState<'gallery' | 'editor'>('gallery');

  // Templates Repository - Authorized Vision Medical Templates Only
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      // Clear legacy unauthorized templates
      localStorage.removeItem('vm_templates');
      localStorage.removeItem('vm_templates_v2');
      localStorage.removeItem('vm_templates_v3');
      const saved = localStorage.getItem('vm_templates_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (t) =>
              t.imageUrl &&
              (t.id.startsWith('vm-ramadan') ||
                t.id.startsWith('vm-eid') ||
                t.id.startsWith('vm-welcome') ||
                t.id.startsWith('vm-official'))
          )
        ) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_TEMPLATES;
  });

  // Selected Template (default to first authorized greeting card)
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    templates[0] || INITIAL_TEMPLATES[0]
  );

  // Employee Personalization Details
  const [employeeData, setEmployeeData] = useState<EmployeeData>(() => {
    const saved = localStorage.getItem('vm_employee_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return {
      fullName: 'د. أحمد العتيبي',
      roleTitle: 'استشاري أول جراحة العيون والشبكية',
      department: 'مجموعة مراكز رؤية الطبية',
      employeeId: 'VM-884920',
      email: 'a.otaibi@visionmedicalksa.com',
      phone: '+966 11 000 0000',
    };
  });

  // Canvas Text Elements (Name, Role, and Optional Text Box)
  const initialTpl = templates[0] || INITIAL_TEMPLATES[0];
  const [elements, setElements] = useState<CanvasTextElement[]>([
    {
      id: 'name',
      text: 'د. أحمد العتيبي',
      fontFamily: 'Cairo',
      fontSize: initialTpl?.defaultFontSize || 36,
      fontWeight: '700',
      color: initialTpl?.defaultColor || '#0B2545',
      alignment: initialTpl?.defaultAlignment || 'center',
      xPercent: initialTpl?.defaultNameX || 50,
      yPercent: initialTpl?.defaultNameY || 76,
      letterSpacing: 0,
      lineHeight: 1.2,
      hasShadow: initialTpl?.theme === 'dark',
      isVisible: true,
    },
    {
      id: 'role',
      text: 'استشاري أول جراحة العيون والشبكية',
      fontFamily: 'Tajawal',
      fontSize: initialTpl?.defaultRoleFontSize || 22,
      fontWeight: '500',
      color: initialTpl?.defaultRoleColor || '#00A3E0',
      alignment: initialTpl?.defaultAlignment || 'center',
      xPercent: initialTpl?.defaultRoleX || 50,
      yPercent: initialTpl?.defaultRoleY || 82,
      letterSpacing: 0,
      lineHeight: 1.2,
      hasShadow: false,
      isVisible: true,
    },
    {
      id: 'optional',
      text: 'مجموعة مراكز رؤية الطبية',
      fontFamily: 'Cairo',
      fontSize: 18,
      fontWeight: '500',
      color: '#005A9C',
      alignment: initialTpl?.defaultAlignment || 'center',
      xPercent: initialTpl?.defaultNameX || 50,
      yPercent: 88,
      letterSpacing: 0,
      lineHeight: 1.2,
      hasShadow: false,
      isVisible: false,
    },
  ]);

  const [selectedElementId, setSelectedElementId] = useState<string | null>('name');
  const [isOptionalTextActive, setIsOptionalTextActive] = useState<boolean>(false);

  // Admin Governance Settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('vm_admin_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      allowCustomColors: true,
      requireApproval: false,
      maxExportResolution: '2x',
      watermarkEnabled: false,
      authorizedEmails: [
        'marketing@visionmedicalksa.com',
        'brand@visionmedicalksa.com',
        'hr@visionmedicalksa.com',
      ],
      approvedColors: OFFICIAL_BRAND_COLORS,
      approvedFonts: OFFICIAL_FONTS.map((f) => f.family),
    };
  });

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [showSafeZoneGuides, setShowSafeZoneGuides] = useState<boolean>(true);

  // Sync RTL / LTR document direction and language attribute
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  // Persist templates to localStorage
  useEffect(() => {
    localStorage.setItem('vm_templates_v4', JSON.stringify(templates));
  }, [templates]);

  // Persist employee details
  useEffect(() => {
    localStorage.setItem('vm_employee_data', JSON.stringify(employeeData));
  }, [employeeData]);

  // Persist admin settings
  useEffect(() => {
    localStorage.setItem('vm_admin_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  // Toggle optional text box
  const handleToggleOptionalText = (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !isOptionalTextActive;
    setIsOptionalTextActive(newState);
    handleUpdateElement('optional', { isVisible: newState });
    if (newState) {
      setSelectedElementId('optional');
    } else if (selectedElementId === 'optional') {
      setSelectedElementId('name');
    }
  };

  // Handle template selection from gallery
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    const existingOptional = elements.find((el) => el.id === 'optional');

    // Initialize elements matching template presets, preserving optional text box
    setElements([
      {
        id: 'name',
        text: employeeData.fullName || 'Dr. Ahmed Al-Otaibi',
        fontFamily: currentLanguage === 'ar' ? 'Cairo' : 'Plus Jakarta Sans',
        fontSize: template.defaultFontSize,
        fontWeight: '700',
        color: template.defaultColor,
        alignment: template.defaultAlignment,
        xPercent: template.defaultNameX,
        yPercent: template.defaultNameY,
        letterSpacing: currentLanguage === 'ar' ? 0 : 0.5,
        lineHeight: 1.2,
        hasShadow: template.theme === 'dark',
        isVisible: true,
      },
      {
        id: 'role',
        text: employeeData.roleTitle || 'Senior Consultant Cardiologist',
        fontFamily: currentLanguage === 'ar' ? 'Tajawal' : 'Outfit',
        fontSize: template.defaultRoleFontSize || Math.round(template.defaultFontSize * 0.6),
        fontWeight: '500',
        color: template.defaultRoleColor || (template.theme === 'dark' ? '#38BDF8' : '#005A9C'),
        alignment: template.defaultAlignment,
        xPercent: template.defaultRoleX || template.defaultNameX,
        yPercent: template.defaultRoleY || template.defaultNameY + 11,
        letterSpacing: 0,
        lineHeight: 1.2,
        hasShadow: false,
        isVisible: true,
      },
      {
        id: 'optional',
        text:
          existingOptional?.text ||
          employeeData.optionalText ||
          (currentLanguage === 'ar' ? 'مركز رؤية لجراحة القلب' : 'Heart & Vascular Center'),
        fontFamily: currentLanguage === 'ar' ? 'Cairo' : 'Plus Jakarta Sans',
        fontSize: Math.max(14, Math.round(template.defaultFontSize * 0.45)),
        fontWeight: '500',
        color: template.theme === 'dark' ? '#E0F2FE' : '#005A9C',
        alignment: template.defaultAlignment,
        xPercent: template.defaultRoleX || template.defaultNameX,
        yPercent: Math.min(90, (template.defaultRoleY || template.defaultNameY + 11) + 11),
        letterSpacing: 0,
        lineHeight: 1.2,
        hasShadow: false,
        isVisible: isOptionalTextActive,
      },
    ]);
    setActiveView('editor');
    setCurrentStep(2);
  };

  // Update specific text element properties
  const handleUpdateElement = (id: string, updates: Partial<CanvasTextElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Update element position on canvas
  const handleUpdateElementPosition = (id: string, xPercent: number, yPercent: number) => {
    handleUpdateElement(id, { xPercent, yPercent });
  };

  // Update element font size from canvas resize handle
  const handleUpdateElementFontSize = (id: string, newFontSize: number) => {
    handleUpdateElement(id, { fontSize: newFontSize });
  };

  // Reset positions to default template coordinates
  const handleResetPositions = () => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === 'name') {
          return {
            ...el,
            xPercent: selectedTemplate.defaultNameX,
            yPercent: selectedTemplate.defaultNameY,
            fontSize: selectedTemplate.defaultFontSize,
            alignment: selectedTemplate.defaultAlignment,
            color: selectedTemplate.defaultColor,
          };
        }
        if (el.id === 'role') {
          return {
            ...el,
            xPercent: selectedTemplate.defaultRoleX || selectedTemplate.defaultNameX,
            yPercent: selectedTemplate.defaultRoleY || selectedTemplate.defaultNameY + 11,
            fontSize: selectedTemplate.defaultRoleFontSize || Math.round(selectedTemplate.defaultFontSize * 0.6),
            alignment: selectedTemplate.defaultAlignment,
            color: selectedTemplate.defaultRoleColor || (selectedTemplate.theme === 'dark' ? '#38BDF8' : '#005A9C'),
          };
        }
        if (el.id === 'optional') {
          return {
            ...el,
            xPercent: selectedTemplate.defaultRoleX || selectedTemplate.defaultNameX,
            yPercent: Math.min(90, (selectedTemplate.defaultRoleY || selectedTemplate.defaultNameY + 11) + 11),
            fontSize: Math.max(14, Math.round(selectedTemplate.defaultFontSize * 0.45)),
            alignment: selectedTemplate.defaultAlignment,
            color: selectedTemplate.theme === 'dark' ? '#E0F2FE' : '#005A9C',
          };
        }
        return el;
      })
    );
  };

  // Apply AI Smart recommendations
  const handleApplyAiRecommendation = (rec: {
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    roleFontFamily?: string;
    roleFontSize?: number;
    roleFontColor?: string;
    alignment: 'left' | 'center' | 'right';
    xPercent: number;
    yPercent: number;
  }) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === 'name') {
          return {
            ...el,
            fontFamily: rec.fontFamily,
            fontSize: rec.fontSize,
            color: rec.fontColor,
            alignment: rec.alignment,
            xPercent: rec.xPercent,
            yPercent: rec.yPercent,
          };
        }
        if (el.id === 'role') {
          return {
            ...el,
            fontFamily: rec.roleFontFamily || rec.fontFamily,
            fontSize: rec.roleFontSize || Math.round(rec.fontSize * 0.6),
            color: rec.roleFontColor || rec.fontColor,
            alignment: rec.alignment,
            xPercent: rec.xPercent,
            yPercent: Math.min(92, rec.yPercent + 11),
          };
        }
        return el;
      })
    );
  };

  // Admin template operations
  const handleAddTemplate = (newTemplate: Template) => {
    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const handleUpdateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Global Brand Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        currentStep={currentStep}
        onStepClick={(step) => {
          setCurrentStep(step);
          if (step === 1) setActiveView('gallery');
          else if (step === 5) setIsExportModalOpen(true);
          else setActiveView('editor');
        }}
        onOpenExport={() => setIsExportModalOpen(true)}
        hasSelectedTemplate={Boolean(selectedTemplate)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {isAdmin ? (
          /* Admin Studio View */
          <AdminDashboard
            templates={templates}
            onAddTemplate={handleAddTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            adminSettings={adminSettings}
            onUpdateAdminSettings={handleUpdateAdminSettings}
            currentLanguage={currentLanguage}
            onCloseAdmin={() => setIsAdmin(false)}
          />
        ) : activeView === 'gallery' ? (
          /* Template Library & Landing View */
          <div className="space-y-8">
            {/* Landing Hero Section */}
            <section className="bg-gradient-to-br from-[#0B2545] via-[#091E38] to-[#041224] rounded-3xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
              {/* Subtle decorative circles */}
              <div className="absolute top-0 end-0 w-96 h-96 bg-[#00A3E0]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 start-1/3 w-64 h-64 bg-[#F58220]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#38BDF8] text-xs font-semibold backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>
                    {currentLanguage === 'ar'
                      ? 'المنصة الرسمية لتصاميم موظفي رؤية الطبية'
                      : 'Official Vision Medical Employee Branding Studio'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {currentLanguage === 'ar' ? (
                    <>
                      صمّم بطاقاتك وأغلفتك الرسمية <br />
                      <span className="text-[#00A3E0]">بأعلى معايير الهوية الصحية</span>
                    </>
                  ) : (
                    <>
                      Personalize Approved Templates <br />
                      <span className="text-[#00A3E0]">with Precision & Brand Integrity</span>
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {currentLanguage === 'ar'
                    ? 'اختر من مكتبة القوالب المعتمدة، خصص اسمك ومسماك الوظيفي بخطوط عربية وإنجليزية راقية، حدد الموضع المثالي وحمل تصميمك بدقة عالية فورية.'
                    : 'Select company-approved designs for employee IDs, email signatures, LinkedIn banners, and announcements. Customize your name with curated typography and download high-resolution assets instantly.'}
                </p>

                {/* 5-Step Workflow Micro-Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[#00A3E0] font-bold">1</span>
                    <span>{t.step1.replace(/^\d+\.\s*/, '')}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[#00A3E0] font-bold">2</span>
                    <span>{t.step2.replace(/^\d+\.\s*/, '')}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[#00A3E0] font-bold">3</span>
                    <span>{t.step3.replace(/^\d+\.\s*/, '')}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[#00A3E0] font-bold">4</span>
                    <span>{t.step4.replace(/^\d+\.\s*/, '')}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[#00A3E0] font-bold">5</span>
                    <span>{t.step5.replace(/^\d+\.\s*/, '')}</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Template Gallery Component */}
            <TemplateGallery
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              currentLanguage={currentLanguage}
              optionalText={elements.find((el) => el.id === 'optional')?.text || employeeData.optionalText}
              isOptionalTextActive={isOptionalTextActive}
              onToggleOptionalText={handleToggleOptionalText}
              onUpdateOptionalText={(txt) => {
                setEmployeeData((prev) => ({ ...prev, optionalText: txt }));
                handleUpdateElement('optional', { text: txt, isVisible: true });
                setIsOptionalTextActive(true);
              }}
            />
          </div>
        ) : (
          /* Interactive Editor Workspace View */
          <div className="flex-1 flex flex-col space-y-4">
            {/* Top Workspace Bar (including Change Template & Optional Text Box) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveView('gallery')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'ar' ? 'تغيير القالب' : 'Change Template'}</span>
                </button>

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                {/* Optional Text Box Button in Change Template part */}
                <button
                  onClick={() => handleToggleOptionalText()}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all border ${
                    isOptionalTextActive
                      ? 'bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#005A9C] border-[#00A3E0]/40 font-bold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title={isOptionalTextActive ? 'Optional text box is active on canvas' : 'Add an optional text box to this template'}
                >
                  {isOptionalTextActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00A3E0]" />
                      <span>{t.optionalTextActive}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#00A3E0]" />
                      <span>{t.addOptionalText}</span>
                    </>
                  )}
                </button>

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <span className="text-xs font-bold text-[#0B2545] hidden md:inline">
                  {currentLanguage === 'ar' ? selectedTemplate.titleAr : selectedTemplate.titleEn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Safe zone guide toggle */}
                <button
                  onClick={() => setShowSafeZoneGuides(!showSafeZoneGuides)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    showSafeZoneGuides
                      ? 'bg-sky-50 text-[#005A9C] border-[#00A3E0]/40'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle safe boundaries"
                >
                  <span>{showSafeZoneGuides ? t.showGuides : t.hideGuides}</span>
                </button>

                {/* AI Assistant Button */}
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#005A9C] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#00A3E0]/30 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{t.aiSmartPlacement}</span>
                </button>

                {/* Export Button */}
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadModalTitle.split(' ')[0]}</span>
                </button>
              </div>
            </div>

            {/* Canvas + Sidebar Side-by-Side Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
              {/* Left/Center: Interactive Canvas (Desktop 8 cols) */}
              <div className="lg:col-span-8 h-full min-h-[500px]">
                <TemplateCanvas
                  template={selectedTemplate}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElementPosition={handleUpdateElementPosition}
                  onUpdateElementFontSize={handleUpdateElementFontSize}
                  currentLanguage={currentLanguage}
                  showSafeZoneGuides={showSafeZoneGuides}
                />
              </div>

              {/* Right: Customization Panel (Desktop 4 cols) */}
              <div className="lg:col-span-4 h-full">
                <CustomizerSidebar
                  template={selectedTemplate}
                  employeeData={employeeData}
                  onUpdateEmployeeData={(data) => setEmployeeData((prev) => ({ ...prev, ...data }))}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onResetPositions={handleResetPositions}
                  onOpenAiAssistant={() => setIsAiModalOpen(true)}
                  adminSettings={adminSettings}
                  currentLanguage={currentLanguage}
                  onToggleOptionalText={handleToggleOptionalText}
                  isOptionalTextActive={isOptionalTextActive}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0B2545]">Vision Medical</span>
            <span>·</span>
            <span>{currentLanguage === 'ar' ? 'شركة رؤية الطبية' : 'Healthcare Network KSA'}</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{currentLanguage === 'ar' ? 'استوديو تصاميم الموظفين المعتمد' : 'Official Employee Template Studio'}</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-[#00A3E0]">v2.4 Production</span>
          </div>
        </div>
      </footer>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        template={selectedTemplate}
        employeeData={employeeData}
        onApplyRecommendation={handleApplyAiRecommendation}
        currentLanguage={currentLanguage}
      />

      {/* Export & Download Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        template={selectedTemplate}
        elements={elements}
        employeeName={employeeData.fullName}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
