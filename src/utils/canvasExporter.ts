import { jsPDF } from 'jspdf';
import { CanvasTextElement, Template } from '../types';

export interface ExportConfig {
  scale?: number; // default 2 for retina / high-resolution export
  quality?: number; // 0.95 for JPG
  fileName?: string;
}

/**
 * Creates a clean safe filename for download:
 * e.g., VisionMedical_AhmedMohamed_LinkedInBanner.png
 */
export function generateFileName(
  employeeName: string,
  templateTitle: string,
  category: string,
  extension: 'png' | 'jpg' | 'pdf'
): string {
  const cleanName = (employeeName || 'Employee')
    .replace(/[^\w\s\u0600-\u06FF]/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('_');

  const cleanCategory = (category || 'Template')
    .replace(/-([a-z])/g, (_, g) => g.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

  const capitalizedCategory = cleanCategory.charAt(0).toUpperCase() + cleanCategory.slice(1);

  return `VisionMedical_${cleanName}_${capitalizedCategory}.${extension}`;
}

/**
 * Renders the SVG template and text elements to an offscreen high-DPI HTMLCanvasElement.
 */
export async function renderTemplateToCanvas(
  template: Template,
  elements: CanvasTextElement[],
  scale: number = 2
): Promise<HTMLCanvasElement> {
  // Ensure custom web fonts are loaded before painting
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font readiness promise rejects
    }
  }

  const canvas = document.createElement('canvas');
  const targetWidth = Math.round(template.width * scale);
  const targetHeight = Math.round(template.height * scale);
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context');
  }

  // Draw background
  if (template.imageUrl) {
    // Render uploaded raster image
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load template image'));
      img.src = template.imageUrl!;
    });
  } else if (template.svgBackground) {
    // Render SVG background string
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([template.svgBackground!], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to render SVG background'));
      };
      img.src = url;
    });
  } else {
    // Fallback solid navy background
    ctx.fillStyle = '#0B2545';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw text elements on canvas
  for (const el of elements) {
    if (!el.text || !el.text.trim()) continue;

    const scaledFontSize = Math.round(el.fontSize * scale);
    const x = (el.xPercent / 100) * targetWidth;
    const y = (el.yPercent / 100) * targetHeight;

    ctx.save();
    ctx.textAlign = el.alignment;
    ctx.textBaseline = 'middle';
    ctx.font = `${el.fontWeight} ${scaledFontSize}px "${el.fontFamily}", Cairo, "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = el.color;

    // Optional subtle drop shadow for contrast
    if (el.hasShadow) {
      ctx.shadowColor = el.shadowColor || 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * scale;
    }

    // Measure and render line
    ctx.fillText(el.text, x, y);
    ctx.restore();
  }

  return canvas;
}

/**
 * Triggers browser download for a data URL or blob
 */
function triggerDownload(url: string, fileName: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export high-resolution PNG
 */
export async function downloadPng(
  template: Template,
  elements: CanvasTextElement[],
  fileName: string,
  scale: number = 2
): Promise<void> {
  const canvas = await renderTemplateToCanvas(template, elements, scale);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  triggerDownload(dataUrl, fileName);
}

/**
 * Export high-resolution JPG
 */
export async function downloadJpg(
  template: Template,
  elements: CanvasTextElement[],
  fileName: string,
  scale: number = 2,
  quality: number = 0.95
): Promise<void> {
  const canvas = await renderTemplateToCanvas(template, elements, scale);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  triggerDownload(dataUrl, fileName);
}

/**
 * Export PDF (vector document containing high-res canvas render)
 */
export async function downloadPdf(
  template: Template,
  elements: CanvasTextElement[],
  fileName: string,
  scale: number = 2
): Promise<void> {
  const canvas = await renderTemplateToCanvas(template, elements, scale);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const isLandscape = template.width >= template.height;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [template.width, template.height],
    hotfixes: ['px_scaling'],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, template.width, template.height);
  pdf.save(fileName);
}
