import React, { useState } from 'react';
import { CanvasTextElement, EmployeeData, Language, Template } from '../types';
import { UI_TRANSLATIONS } from '../data/brandAssets';
import {
  Sparkles,
  CheckCircle,
  Move,
  Type,
  Palette,
  Maximize2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  employeeData: EmployeeData;
  onApplyRecommendation: (updates: {
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    roleFontFamily?: string;
    roleFontSize?: number;
    roleFontColor?: string;
    alignment: 'left' | 'center' | 'right';
    xPercent: number;
    yPercent: number;
  }) => void;
  currentLanguage: Language;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  template,
  employeeData,
  onApplyRecommendation,
  currentLanguage,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger real server-side Gemini API analysis
  const runAiAnalysis = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/smart-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateTitle: template.titleEn,
          category: template.category,
          canvasWidth: template.width,
          canvasHeight: template.height,
          employeeName: employeeData.fullName || 'Vision Medical Staff',
          employeeRole: employeeData.roleTitle || 'Healthcare Specialist',
          department: employeeData.department || 'Medical Care',
          language: currentLanguage,
          theme: template.theme,
          safeZone: template.safeZone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations from AI server');
      }

      const data = await response.json();
      if (data.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        throw new Error('Malformed recommendation payload');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        currentLanguage === 'ar'
          ? 'تعذر الاتصال بخادم الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.'
          : 'Could not connect to AI service. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically when modal opens if not already loaded
  React.useEffect(() => {
    if (isOpen && !recommendation && !isLoading) {
      runAiAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B2545] to-[#005A9C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-[#38BDF8]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {currentLanguage === 'ar'
                  ? 'مساعد التنسيق الذكي لهوية رؤية الطبية'
                  : 'AI Smart Brand Assistant'}
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                {currentLanguage === 'ar'
                  ? 'تحليل الموضع المناسب والخطوط المعتمدة وألوان التباين العالي'
                  : 'Analyzes safe zones, logos, typography, and contrast'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <RefreshCw className="w-8 h-8 text-[#00A3E0] animate-spin" />
              <p className="text-sm font-semibold text-slate-700">{t.aiThinking}</p>
              <p className="text-xs text-slate-400 max-w-xs">
                {currentLanguage === 'ar'
                  ? 'جاري فحص مواضع الشعارات وحجم النصوص العربية والإنجليزية...'
                  : 'Inspecting logo boundaries, Arabic/English scripts, and WCAG AA contrast...'}
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
              <button
                onClick={runAiAnalysis}
                className="ms-auto font-bold text-rose-900 underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : recommendation ? (
            <div className="space-y-4">
              {/* AI Recommendation Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Placement */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#005A9C]">
                    <Move className="w-3.5 h-3.5 text-[#00A3E0]" />
                    <span>{currentLanguage === 'ar' ? 'الموضع الذكي' : 'Smart Placement'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    X: {recommendation.xPercent}% · Y: {recommendation.yPercent}% ({recommendation.textAlignment})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentLanguage === 'ar' ? 'يبتعد عن موضع شعار رؤية الطبية' : 'Preserves official logo boundaries'}
                  </p>
                </div>

                {/* 2. Font Recommendation */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#005A9C]">
                    <Type className="w-3.5 h-3.5 text-[#00A3E0]" />
                    <span>{currentLanguage === 'ar' ? 'الخط الموصى به' : 'Recommended Font'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {recommendation.recommendedFont} ({recommendation.fontSize}px)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentLanguage === 'ar' ? 'متوافق مع النص المدخل' : 'Harmonious with detected script'}
                  </p>
                </div>

                {/* 3. Color & Contrast */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#005A9C]">
                    <Palette className="w-3.5 h-3.5 text-[#00A3E0]" />
                    <span>{currentLanguage === 'ar' ? 'اللون والتباين' : 'Contrast Color'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: recommendation.fontColor }}
                    />
                    <span className="text-xs font-semibold text-slate-800 uppercase font-mono">
                      {recommendation.fontColor}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {currentLanguage === 'ar' ? 'تباين عالي ومريح للعين' : 'High WCAG AA readability'}
                  </p>
                </div>

                {/* 4. Text Sizing */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#005A9C]">
                    <Maximize2 className="w-3.5 h-3.5 text-[#00A3E0]" />
                    <span>{currentLanguage === 'ar' ? 'ملاءمة الحجم التلقائية' : 'Auto Sizing'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {recommendation.fontSize}px / {recommendation.roleFontSize || 20}px
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentLanguage === 'ar' ? 'يمنع اقتطاع الأسماء الطويلة' : 'Prevents canvas text clipping'}
                  </p>
                </div>
              </div>

              {/* AI Rationale Box */}
              <div className="p-4 bg-sky-50/80 border border-sky-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-[#0B2545] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>{t.aiRationaleTitle}</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentLanguage === 'ar'
                    ? recommendation.aiRationaleAr || recommendation.aiRationaleEn
                    : recommendation.aiRationaleEn || recommendation.aiRationaleAr}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={runAiAnalysis}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{currentLanguage === 'ar' ? 'إعادة التحليل' : 'Re-analyze'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              {currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                if (recommendation) {
                  onApplyRecommendation({
                    fontFamily: recommendation.recommendedFont,
                    fontSize: recommendation.fontSize,
                    fontColor: recommendation.fontColor,
                    roleFontFamily: recommendation.recommendedRoleFont,
                    roleFontSize: recommendation.roleFontSize,
                    roleFontColor: recommendation.roleFontColor,
                    alignment: recommendation.textAlignment,
                    xPercent: recommendation.xPercent,
                    yPercent: recommendation.yPercent,
                  });
                  onClose();
                }
              }}
              disabled={!recommendation || isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-[#0091C8] disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t.applyAiSuggestions}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
