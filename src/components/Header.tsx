import React from 'react';
import { VISION_LOGO_URL, UI_TRANSLATIONS } from '../data/brandAssets';
import { Language } from '../types';
import { ShieldCheck, Download, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  currentStep: number;
  onStepClick: (step: number) => void;
  onOpenExport: () => void;
  hasSelectedTemplate: boolean;
  onOpenAiAssistant?: () => void;
  isSyncing?: boolean;
  cloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  isAdmin,
  onToggleAdmin,
  currentStep,
  onStepClick,
  onOpenExport,
  hasSelectedTemplate,
  onOpenAiAssistant,
  isSyncing,
  cloudConnected,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const steps = [
    { num: 1, label: t.step1 },
    { num: 2, label: t.step2 },
    { num: 3, label: t.step3 },
    { num: 4, label: t.step4 },
    { num: 5, label: t.step5 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Official Logo */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-0.5 shadow-2xs">
            <img
              src={VISION_LOGO_URL}
              alt="Vision Medical Official Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#0B2545] font-['Plus_Jakarta_Sans',sans-serif]">
                VISION MEDICAL
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-sm text-[#00A3E0] font-['Cairo',sans-serif]">
                رؤية الطبية
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                {t.appSubtitle}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/80 shadow-2xs">
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-sky-500 animate-ping' : 'bg-emerald-500'}`} />
                <span>{cloudConnected ? 'Cloud Synced' : 'Local Mode'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Step Navigation Controls (Desktop) */}
        {!isAdmin && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => onStepClick(s.num)}
                  disabled={s.num > 1 && !hasSelectedTemplate}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#0B2545] shadow-xs'
                      : isPast
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                      : 'text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isActive
                        ? 'bg-[#00A3E0] text-white'
                        : isPast
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span>{s.label.replace(/^\d+\.\s*/, '')}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Actions (Language Switcher, AI Smart Assist, Admin Switcher, Export) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Quick Assist Trigger */}
          {hasSelectedTemplate && !isAdmin && onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005A9C] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#00A3E0]/30 rounded-lg transition-colors cursor-pointer"
              title="AI Smart Placement & Font Suggestion"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span className="whitespace-nowrap">{t.aiSmartPlacement}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(currentLanguage === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Toggle Arabic / English"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-sans font-bold">
              {currentLanguage === 'en' ? 'العربية' : 'English'}
            </span>
          </button>

          {/* Admin Mode Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isAdmin
                ? 'bg-[#0B2545] text-white border-[#0B2545]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Vision Medical Admin Dashboard"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-[#38BDF8]' : 'text-slate-500'}`} />
            <span className="whitespace-nowrap">
              {isAdmin ? t.backToStudio : t.adminDashboard}
            </span>
          </button>

          {/* Export CTA Button */}
          {hasSelectedTemplate && !isAdmin && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] active:scale-98 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="whitespace-nowrap">{t.downloadModalTitle.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
