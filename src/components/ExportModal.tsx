import React, { useState } from 'react';
import { CanvasTextElement, Language, Template } from '../types';
import { UI_TRANSLATIONS } from '../data/brandAssets';
import {
  downloadPng,
  downloadJpg,
  downloadPdf,
  generateFileName,
  renderTemplateToCanvas,
} from '../utils/canvasExporter';
import {
  Download,
  FileImage,
  FileText,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  elements: CanvasTextElement[];
  employeeName: string;
  currentLanguage: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  template,
  elements,
  employeeName,
  currentLanguage,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [scale, setScale] = useState<number>(2);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessType, setExportSuccessType] = useState<string | null>(null);

  const pngFileName = generateFileName(employeeName, template.titleEn, template.category, 'png');
  const jpgFileName = generateFileName(employeeName, template.titleEn, template.category, 'jpg');
  const pdfFileName = generateFileName(employeeName, template.titleEn, template.category, 'pdf');

  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      await downloadPng(template, elements, pngFileName, scale);
      setExportSuccessType('PNG');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PNG image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpg = async () => {
    try {
      setIsExporting(true);
      await downloadJpg(template, elements, jpgFileName, scale, 0.95);
      setExportSuccessType('JPG');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate JPG image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      await downloadPdf(template, elements, pdfFileName, scale);
      setExportSuccessType('PDF');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#00A3E0]" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {t.downloadModalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {currentLanguage === 'ar' ? template.titleAr : template.titleEn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Output Filename Info Box */}
          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {t.fileNameLabel}
            </span>
            <p className="font-mono text-xs font-semibold text-[#0B2545] break-all">
              {pngFileName}
            </p>
          </div>

          {/* Export Resolution Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {t.exportResolution}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setScale(1)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  scale === 1
                    ? 'border-[#00A3E0] bg-sky-50 text-[#005A9C] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">1x Standard</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {template.width} × {template.height}
                </div>
              </button>
              <button
                onClick={() => setScale(2)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  scale === 2
                    ? 'border-[#00A3E0] bg-sky-50 text-[#005A9C] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">2x High-Res (Retina)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {template.width * 2} × {template.height * 2}
                </div>
              </button>
              <button
                onClick={() => setScale(3)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  scale === 3
                    ? 'border-[#00A3E0] bg-sky-50 text-[#005A9C] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">3x Ultra-Sharp</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {template.width * 3} × {template.height * 3}
                </div>
              </button>
            </div>
          </div>

          {/* Download Buttons Stack */}
          <div className="space-y-2.5 pt-2">
            {/* PNG Export */}
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="w-full p-3.5 bg-[#0B2545] hover:bg-[#07192F] text-white rounded-xl shadow-xs flex items-center justify-between transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#00A3E0] transition-colors">
                  <FileImage className="w-5 h-5 text-white" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold">{t.downloadPng}</div>
                  <div className="text-[11px] text-slate-300">
                    {currentLanguage === 'ar' ? 'أفضل دقة للشاشات والمنصات الرقمية' : 'Ideal for digital screens & websites'}
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-[#00A3E0] group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* JPG Export */}
            <button
              onClick={handleExportJpg}
              disabled={isExporting}
              className="w-full p-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900 rounded-xl shadow-2xs flex items-center justify-between transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <FileImage className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold">{t.downloadJpg}</div>
                  <div className="text-[11px] text-slate-500">
                    {currentLanguage === 'ar' ? 'حجم ملف أصغر ومثالي للبريد الإلكتروني' : 'Optimized size for email and attachments'}
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            {/* PDF Export */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="w-full p-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900 rounded-xl shadow-2xs flex items-center justify-between transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <FileText className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold">{t.downloadPdf}</div>
                  <div className="text-[11px] text-slate-500">
                    {currentLanguage === 'ar' ? 'جاهز للطباعة وتوزيع المستندات' : 'Ready for high-quality printing'}
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>

          {/* Success Banner */}
          {exportSuccessType && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                {currentLanguage === 'ar'
                  ? `تم تحميل ملف ${exportSuccessType} بنجاح!`
                  : `${exportSuccessType} exported successfully!`}
              </span>
            </div>
          )}

          {/* Notice Badge */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-[#00A3E0] shrink-0" />
            <span>{t.exportNotice}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            {currentLanguage === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
