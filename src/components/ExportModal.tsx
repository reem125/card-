import React, { useState } from 'react';
import { CanvasTextElement, EmployeeData, Language, Template } from '../types';
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
  Mail,
  MessageCircle,
  Copy,
  ExternalLink,
  Send,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  elements: CanvasTextElement[];
  employeeName: string;
  employeeData?: EmployeeData;
  currentLanguage: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  template,
  elements,
  employeeName,
  employeeData,
  currentLanguage,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [scale, setScale] = useState<number>(2);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessType, setExportSuccessType] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Recipient inputs for email / whatsapp sharing
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [targetPhone, setTargetPhone] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

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

  // Copy rendered image to clipboard (works on modern Chrome/Edge/Safari/Firefox)
  const handleCopyImageToClipboard = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderTemplateToCanvas(template, elements, Math.min(scale, 2));
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob creation failed');
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopySuccess(t.imageCopiedSuccess);
          setTimeout(() => setCopySuccess(null), 4000);
        } else {
          // Fallback to PNG download
          await downloadPng(template, elements, pngFileName, scale);
          setCopySuccess(
            currentLanguage === 'ar'
              ? 'تم تحميل الصورة لتتمكن من إرفاقها مباشرة!'
              : 'Image downloaded to attach directly!'
          );
          setTimeout(() => setCopySuccess(null), 4000);
        }
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      // Fallback: download the file
      await downloadPng(template, elements, pngFileName, scale);
      setCopySuccess(
        currentLanguage === 'ar'
          ? 'تم تنزيل التصميم لتتمكن من لصقه أو إرفاقه!'
          : 'Design downloaded to attach or paste!'
      );
      setTimeout(() => setCopySuccess(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Send via Email (mailto with personalized template text & details)
  const handleSendViaEmail = async () => {
    try {
      setIsExporting(true);
      // Automatically download PNG so employee has the file ready to attach
      await downloadPng(template, elements, pngFileName, scale);

      const recipient = targetEmail.trim() || employeeData?.email || '';
      const subject = encodeURIComponent(
        `${t.shareSubject} - ${employeeName || 'Vision Medical'}`
      );

      const templateTitle = currentLanguage === 'ar' ? template.titleAr : template.titleEn;
      const roleText = employeeData?.roleTitle ? `\n${currentLanguage === 'ar' ? 'المسمى الوظيفي:' : 'Title:'} ${employeeData.roleTitle}` : '';
      const deptText = employeeData?.department ? `\n${currentLanguage === 'ar' ? 'القسم / المركز:' : 'Department:'} ${employeeData.department}` : '';

      const bodyText =
        (customMessage ? `${customMessage}\n\n` : '') +
        `${currentLanguage === 'ar' ? 'تحية طيبة،' : 'Dear colleague,'}\n\n` +
        `${currentLanguage === 'ar' ? 'مرفق لكم تصميم القالب الرسمي المعتمد من شركة رؤية الطبية:' : 'Attached is my official approved Vision Medical template design:'}\n` +
        `• ${currentLanguage === 'ar' ? 'القالب:' : 'Template:'} ${templateTitle}\n` +
        `• ${currentLanguage === 'ar' ? 'الاسم:' : 'Name:'} ${employeeName}${roleText}${deptText}\n` +
        `• ${currentLanguage === 'ar' ? 'اسم الملف المرفق:' : 'Attached File:'} ${pngFileName}\n\n` +
        `${currentLanguage === 'ar' ? 'مجموعة مراكز رؤية الطبية' : 'Vision Medical Healthcare Network'}\n` +
        `www.visionmedicalksa.com`;

      const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
      window.location.href = mailtoUrl;

      setExportSuccessType('Email');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Send via WhatsApp (opens WhatsApp Web / App with personalized greeting)
  const handleSendViaWhatsApp = async () => {
    try {
      setIsExporting(true);
      // Automatically download PNG so employee has the high-res file in downloads to drag/send
      await downloadPng(template, elements, pngFileName, scale);

      const templateTitle = currentLanguage === 'ar' ? template.titleAr : template.titleEn;
      const roleText = employeeData?.roleTitle ? ` (${employeeData.roleTitle})` : '';

      const rawPhone = targetPhone.replace(/[^0-9]/g, '');

      const message =
        (customMessage ? `${customMessage}\n\n` : '') +
        `*${currentLanguage === 'ar' ? 'رؤية الطبية — تصميم رسمي معتمد' : 'Vision Medical — Official Design'}*\n` +
        `👤 *${employeeName}*${roleText}\n` +
        `📋 *${templateTitle}*\n\n` +
        `${currentLanguage === 'ar' ? 'تم تجهيز التصميم عالي الدقة، وتفضلوا بالاطلاع عليه.' : 'The high-resolution design is ready and attached.'}\n\n` +
        `🌐 www.visionmedicalksa.com`;

      const whatsappUrl = rawPhone
        ? `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(message)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      setExportSuccessType('WhatsApp');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00A3E0]/10 flex items-center justify-center text-[#00A3E0]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {t.downloadModalTitle}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {currentLanguage === 'ar' ? template.titleAr : template.titleEn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 text-lg font-bold rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Output Filename Info Box */}
          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {t.fileNameLabel}
              </span>
              <p className="font-mono text-xs font-semibold text-[#0B2545] truncate">
                {pngFileName}
              </p>
            </div>
            <button
              onClick={handleCopyImageToClipboard}
              disabled={isExporting}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-white hover:bg-slate-50 text-[#005A9C] border border-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
              title={t.copyImageForSending}
            >
              <Copy className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>{currentLanguage === 'ar' ? 'نسخ الصورة' : 'Copy Image'}</span>
            </button>
          </div>

          {/* ================================================= */}
          {/* NEW SECTION: SEND VIA EMAIL & SEND VIA WHATSAPP */}
          {/* ================================================= */}
          <div className="p-4 bg-gradient-to-br from-sky-50/70 via-emerald-50/40 to-white rounded-2xl border border-sky-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00A3E0]/15 flex items-center justify-center text-[#00A3E0]">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {t.shareOrSendTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t.shareOrSendDesc}
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {currentLanguage === 'ar' ? 'إرسال مباشر' : 'Direct Sending'}
              </span>
            </div>

            {/* Optional custom note / message */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#00A3E0]" />
                  <span>{currentLanguage === 'ar' ? 'بريد المستلم (اختياري)' : 'Recipient Email (Optional)'}</span>
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder={employeeData?.email || 'colleague@visionmedicalksa.com'}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3E0]/30 focus:border-[#00A3E0] text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>{currentLanguage === 'ar' ? 'رقم الواتساب مع المفتاح (اختياري)' : 'WhatsApp Phone (Optional)'}</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="9665XXXXXXXX"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>

            {/* Quick Action Send Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Send Via Email Button */}
              <button
                onClick={handleSendViaEmail}
                disabled={isExporting}
                className="p-3 bg-white hover:bg-sky-50 border border-[#00A3E0]/40 text-[#005A9C] rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs hover:shadow-xs disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5 text-start">
                  <div className="w-9 h-9 rounded-lg bg-[#E0F2FE] group-hover:bg-[#00A3E0] text-[#005A9C] group-hover:text-white flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#005A9C]">
                      {t.sendViaEmail}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      {currentLanguage === 'ar' ? 'عبر برنامج البريد الرسمي' : 'Via default work email client'}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#00A3E0] shrink-0" />
              </button>

              {/* Send Via WhatsApp Button */}
              <button
                onClick={handleSendViaWhatsApp}
                disabled={isExporting}
                className="p-3 bg-white hover:bg-emerald-50 border border-emerald-300/80 text-emerald-900 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs hover:shadow-xs disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5 text-start">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      {t.sendViaWhatsApp}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      {currentLanguage === 'ar' ? 'محادثة فورية (ويب أو تطبيق)' : 'Instant chat (Web / App)'}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            </div>

            <p className="text-[10.5px] text-slate-500 leading-snug">
              💡 {t.attachNotice}
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
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-bold text-slate-700">
              {currentLanguage === 'ar' ? 'تحميل مباشر على جهازك' : 'Direct File Downloads'}
            </div>

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
                {exportSuccessType === 'Email'
                  ? currentLanguage === 'ar'
                    ? 'تم فتح برنامج البريد الإلكتروني وجرى تنزيل الصورة للإرفاق!'
                    : 'Email client opened and design downloaded ready to attach!'
                  : exportSuccessType === 'WhatsApp'
                  ? currentLanguage === 'ar'
                    ? 'تم فتح تطبيق واتساب وجرى تنزيل الصورة للإرسال الفوري!'
                    : 'WhatsApp opened and design downloaded ready to send!'
                  : currentLanguage === 'ar'
                  ? `تم تجهيز وتحميل ملف ${exportSuccessType} بنجاح!`
                  : `${exportSuccessType} exported successfully!`}
              </span>
            </div>
          )}

          {/* Copy Image Success Banner */}
          {copySuccess && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-[#005A9C] text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#00A3E0]" />
              <span>{copySuccess}</span>
            </div>
          )}

          {/* Notice Badge */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-[#00A3E0] shrink-0" />
            <span>{t.exportNotice}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-[#0B2545]">Vision Medical</span>
            <span>·</span>
            <span>{currentLanguage === 'ar' ? 'رؤية الطبية' : 'Official Studio'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            {currentLanguage === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
