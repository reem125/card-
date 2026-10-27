import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasTextElement, Language, Template } from '../types';
import { UI_TRANSLATIONS } from '../data/brandAssets';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Move,
  Layers,
  Palette,
  Sun,
  Grid,
} from 'lucide-react';

interface TemplateCanvasProps {
  template: Template;
  elements: CanvasTextElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementPosition: (id: string, xPercent: number, yPercent: number) => void;
  onUpdateElementFontSize: (id: string, newFontSize: number) => void;
  currentLanguage: Language;
  showSafeZoneGuides?: boolean;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  template,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElementPosition,
  onUpdateElementFontSize,
  currentLanguage,
  showSafeZoneGuides = true,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // User zoom multiplier: 1.0 means exactly fit to container
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [canvasTheme, setCanvasTheme] = useState<'light' | 'white' | 'grid'>('light');
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 580,
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialElemPos, setInitialElemPos] = useState<{ xPercent: number; yPercent: number }>({
    xPercent: 0,
    yPercent: 0,
  });
  const [initialFontSize, setInitialFontSize] = useState<number>(24);
  const [snapGuides, setSnapGuides] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  // Measure container dimensions responsively
  const updateContainerSize = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    updateContainerSize();
    const handleResize = () => updateContainerSize();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      observer = new ResizeObserver(() => updateContainerSize());
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [updateContainerSize]);

  // Reset zoom to 100% fit on template switch
  useEffect(() => {
    setZoomFactor(1.0);
    updateContainerSize();
  }, [template.id, template.width, template.height, updateContainerSize]);

  // Compute adaptive fit scale: canvas adapts automatically to horizontal/landscape or vertical aspect ratios
  const paddingX = 32;
  const paddingY = 32;
  const availWidth = Math.max(120, containerSize.width - paddingX);
  const availHeight = Math.max(120, containerSize.height - paddingY);

  const scaleX = availWidth / template.width;
  const scaleY = availHeight / template.height;
  // Natural fit scale ensures the entire design is 100% visible inside the container
  const baseFitScale = Math.min(scaleX, scaleY);
  const effectiveScale = Math.max(0.05, baseFitScale * zoomFactor);

  // Exact rendered layout dimensions matching the template aspect ratio without excessive scroll space
  const renderedWidth = Math.max(100, Math.round(template.width * effectiveScale));
  const renderedHeight = Math.max(100, Math.round(template.height * effectiveScale));

  const isLandscape = template.width > template.height;
  const aspectRatioValue = (template.width / template.height).toFixed(2);

  // Fit to screen action
  const handleFitToScreen = () => {
    setZoomFactor(1.0);
  };

  // Start dragging text box
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, elemId: string) => {
    e.stopPropagation();
    onSelectElement(elemId);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragStartPos({ x: clientX, y: clientY });

    const elem = elements.find((el) => el.id === elemId);
    if (elem) {
      setInitialElemPos({ xPercent: elem.xPercent, yPercent: elem.yPercent });
    }
  };

  // Start resizing text box via corner handle
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, elemId: string) => {
    e.stopPropagation();
    setIsResizing(true);
    onSelectElement(elemId);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragStartPos({ x: clientX, y: clientY });

    const elem = elements.find((el) => el.id === elemId);
    if (elem) {
      setInitialFontSize(elem.fontSize);
    }
  };

  // Global move handler while dragging or resizing
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isResizing) return;
      if (!selectedElementId || !canvasWrapperRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rect = canvasWrapperRef.current.getBoundingClientRect();

      if (isDragging) {
        const deltaX = ((clientX - dragStartPos.x) / rect.width) * 100;
        const deltaY = ((clientY - dragStartPos.y) / rect.height) * 100;

        let newXPercent = initialElemPos.xPercent + deltaX;
        let newYPercent = initialElemPos.yPercent + deltaY;

        // Snap to center horizontal (50%) if within 2%
        let snappedX = false;
        let snappedY = false;

        if (Math.abs(newXPercent - 50) < 2.0) {
          newXPercent = 50;
          snappedX = true;
        }

        // Snap to center vertical (50%) if within 2%
        if (Math.abs(newYPercent - 50) < 2.0) {
          newYPercent = 50;
          snappedY = true;
        }

        setSnapGuides({ x: snappedX, y: snappedY });

        // Safe zone boundaries
        const minX = template.safeZone ? template.safeZone.minXPercent : 4;
        const maxX = template.safeZone ? template.safeZone.maxXPercent : 96;
        const minY = template.safeZone ? template.safeZone.minYPercent : 5;
        const maxY = template.safeZone ? template.safeZone.maxYPercent : 95;

        newXPercent = Math.max(minX, Math.min(maxX, newXPercent));
        newYPercent = Math.max(minY, Math.min(maxY, newYPercent));

        onUpdateElementPosition(
          selectedElementId,
          Math.round(newXPercent * 10) / 10,
          Math.round(newYPercent * 10) / 10
        );
      } else if (isResizing) {
        const deltaX = clientX - dragStartPos.x;
        // Normalize font resizing against the effective scale
        const scaleFactor = 1 + deltaX / (140 * effectiveScale);
        const calculatedSize = Math.max(10, Math.min(120, Math.round(initialFontSize * scaleFactor)));
        onUpdateElementFontSize(selectedElementId, calculatedSize);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setSnapGuides({ x: false, y: false });
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [
    isDragging,
    isResizing,
    selectedElementId,
    dragStartPos,
    initialElemPos,
    initialFontSize,
    effectiveScale,
    template.safeZone,
    onUpdateElementPosition,
    onUpdateElementFontSize,
  ]);

  // Center selected element on canvas
  const handleSnapToCenter = () => {
    if (!selectedElementId) return;
    onUpdateElementPosition(selectedElementId, 50, 50);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs select-none">
      {/* Top Canvas Toolbar */}
      <div className="px-4 py-2.5 bg-[#0B2545] border-b border-slate-800 flex items-center justify-between text-xs text-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-white tracking-wide">
            {currentLanguage === 'ar' ? template.titleAr : template.titleEn}
          </span>
          <span className="text-slate-500">|</span>
          <span className="bg-white/10 text-sky-200 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
            {isLandscape
              ? currentLanguage === 'ar'
                ? 'عرضي أفقي'
                : 'Landscape'
              : currentLanguage === 'ar'
              ? 'طولي عمودي'
              : 'Portrait'}
            <span className="text-slate-400 font-mono">({aspectRatioValue}:1)</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="font-mono text-slate-300 text-[11px] hidden sm:inline">
            {template.width} × {template.height} px
          </span>
        </div>

        {/* Zoom, Background Theme & Canvas Actions */}
        <div className="flex items-center gap-1.5">
          {/* Workspace Background Mode Toggle (Light Studio, Pure White, Blueprint Grid) */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 me-1">
            <button
              onClick={() => setCanvasTheme('light')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                canvasTheme === 'light' ? 'bg-[#00A3E0] text-white' : 'text-slate-300 hover:text-white'
              }`}
              title={currentLanguage === 'ar' ? 'خلفية استوديو ناعمة' : 'Soft Studio Canvas'}
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCanvasTheme('white')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                canvasTheme === 'white' ? 'bg-[#00A3E0] text-white' : 'text-slate-300 hover:text-white'
              }`}
              title={currentLanguage === 'ar' ? 'أبيض ناصع' : 'Pure White Background'}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCanvasTheme('grid')}
              className={`p-1 rounded cursor-pointer transition-colors ${
                canvasTheme === 'grid' ? 'bg-[#00A3E0] text-white' : 'text-slate-300 hover:text-white'
              }`}
              title={currentLanguage === 'ar' ? 'شبكة هندسية' : 'Blueprint Grid'}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoomFactor((prev) => Math.max(0.4, Math.round((prev - 0.15) * 100) / 100))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] px-1 text-sky-200 min-w-[42px] text-center font-semibold">
            {Math.round(zoomFactor * 100)}%
          </span>
          <button
            onClick={() => setZoomFactor((prev) => Math.min(2.5, Math.round((prev + 0.15) * 100) / 100))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="px-2 py-1 rounded-md hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium text-[11px]"
            title={t.fitScreen}
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>{t.fitScreen}</span>
          </button>
          {selectedElementId && (
            <button
              onClick={handleSnapToCenter}
              className="px-2.5 py-1 bg-[#00A3E0] hover:bg-[#0091C8] text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer font-bold shadow-2xs"
              title={t.snapToCenter}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{t.snapToCenter}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Viewport (Dynamic Aspect Ratio, Zero Dark Borders) */}
      <div
        ref={containerRef}
        onClick={() => onSelectElement(null)}
        className={`relative flex-1 overflow-auto flex items-center justify-center p-3 sm:p-5 transition-colors duration-200 ${
          canvasTheme === 'white'
            ? 'bg-[#ffffff]'
            : canvasTheme === 'grid'
            ? 'bg-slate-50 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]'
            : 'bg-slate-100/90 [background-image:radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:16px_16px]'
        }`}
      >
        <div
          ref={canvasWrapperRef}
          onClick={(e) => e.stopPropagation()}
          className="relative shadow-xl shadow-slate-400/25 transition-all duration-75 origin-center rounded-xl overflow-hidden border border-slate-200/90 bg-white"
          style={{
            width: `${renderedWidth}px`,
            height: `${renderedHeight}px`,
            aspectRatio: `${template.width} / ${template.height}`,
            flexShrink: 0,
          }}
        >
          {/* Background Layer: Template Graphic / Certificate / Banner */}
          {template.imageUrl ? (
            <img
              src={template.imageUrl}
              alt="Template Background"
              className="w-full h-full object-contain pointer-events-none select-none block"
              referrerPolicy="no-referrer"
            />
          ) : template.svgBackground ? (
            <div
              className="w-full h-full pointer-events-none select-none"
              dangerouslySetInnerHTML={{ __html: template.svgBackground }}
            />
          ) : (
            <div className="w-full h-full bg-[#0B2545]" />
          )}

          {/* Snap Crosshair Lines */}
          {snapGuides.x && (
            <div
              className="absolute top-0 bottom-0 w-[1.5px] bg-[#00A3E0] pointer-events-none z-30 shadow-[0_0_8px_#00A3E0]"
              style={{ left: '50%' }}
            />
          )}
          {snapGuides.y && (
            <div
              className="absolute left-0 right-0 h-[1.5px] bg-[#00A3E0] pointer-events-none z-30 shadow-[0_0_8px_#00A3E0]"
              style={{ top: '50%' }}
            />
          )}

          {/* Optional Safe Zone Boundaries Overlay */}
          {showSafeZoneGuides && template.safeZone && (
            <div
              className="absolute pointer-events-none border border-dashed border-[#00A3E0]/40 z-20"
              style={{
                left: `${template.safeZone.minXPercent}%`,
                top: `${template.safeZone.minYPercent}%`,
                width: `${template.safeZone.maxXPercent - template.safeZone.minXPercent}%`,
                height: `${template.safeZone.maxYPercent - template.safeZone.minYPercent}%`,
              }}
            >
              <span className="absolute -top-3.5 start-1 text-[8px] font-mono font-bold text-[#005A9C] bg-white/90 px-1 rounded shadow-2xs uppercase tracking-wider">
                {currentLanguage === 'ar' ? 'منطقة آمنة للنص' : 'Safe Text Zone'}
              </span>
            </div>
          )}

          {/* Interactive Text Elements (Draggable & Resizable, Proportional Rendering) */}
          {elements
            .filter((el) => el.isVisible !== false)
            .map((el) => {
              const isSelected = selectedElementId === el.id;
              const elementLabel =
                (currentLanguage === 'ar' ? el.labelAr : el.labelEn) ||
                (el.id === 'name' || el.id === 'cert-name'
                  ? currentLanguage === 'ar'
                    ? 'الاسم'
                    : 'Name'
                  : el.id === 'role' || el.id === 'cert-program'
                  ? currentLanguage === 'ar'
                    ? 'المسمى'
                    : 'Program / Role'
                  : currentLanguage === 'ar'
                  ? 'نص إضافي'
                  : 'Optional Text');

              const renderedFontSize = Math.max(8, Math.round(el.fontSize * effectiveScale));
              const renderedLetterSpacing = (el.letterSpacing || 0) * effectiveScale;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleDragStart(e, el.id)}
                  onTouchStart={(e) => handleDragStart(e, el.id)}
                  className={`absolute cursor-move select-none z-20 group transition-shadow ${
                    isSelected
                      ? 'ring-2 ring-[#00A3E0] ring-offset-1 ring-offset-white shadow-md'
                      : 'hover:ring-1 hover:ring-[#00A3E0]/50'
                  }`}
                  style={{
                    left: `${el.xPercent}%`,
                    top: `${el.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {/* Text Node */}
                  <p
                    dir="auto"
                    style={{
                      fontFamily: `"${el.fontFamily}", Cairo, "Plus Jakarta Sans", sans-serif`,
                      fontSize: `${renderedFontSize}px`,
                      fontWeight: el.fontWeight,
                      color: el.color,
                      textAlign: el.alignment,
                      letterSpacing: `${renderedLetterSpacing}px`,
                      lineHeight: el.lineHeight,
                      whiteSpace: 'nowrap',
                      textShadow: el.hasShadow ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    {el.text ||
                      (currentLanguage === 'ar' ? el.labelAr : el.labelEn) ||
                      (el.id === 'name' || el.id === 'cert-name'
                        ? currentLanguage === 'ar'
                          ? 'الاسم هنا'
                          : 'Your Name Here'
                        : el.id === 'role' || el.id === 'cert-program'
                        ? currentLanguage === 'ar'
                          ? 'المسمى / البرنامج'
                          : 'Program Title'
                        : currentLanguage === 'ar'
                        ? 'نص إضافي اختياري'
                        : 'Optional Text')}
                  </p>

                  {/* Selection Handles (Visible when selected) */}
                  {isSelected && (
                    <>
                      {/* Top drag pill indicator */}
                      <div className="absolute -top-5 start-1/2 -translate-x-1/2 bg-[#0B2545] text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-md pointer-events-none whitespace-nowrap border border-sky-400">
                        <Move className="w-2.5 h-2.5 text-[#00A3E0]" />
                        <span>{elementLabel}</span>
                      </div>

                      {/* Bottom-right Corner Resize Handle */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, el.id)}
                        onTouchStart={(e) => handleResizeStart(e, el.id)}
                        className="absolute -bottom-1.5 -end-1.5 w-3.5 h-3.5 bg-white border-2 border-[#00A3E0] rounded-full shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                        title={currentLanguage === 'ar' ? 'اسحب لتغيير حجم الخط' : 'Drag to resize font size'}
                      />

                      {/* Corner Dots */}
                      <div className="absolute -top-1 -start-1 w-2 h-2 bg-[#00A3E0] rounded-full" />
                      <div className="absolute -top-1 -end-1 w-2 h-2 bg-[#00A3E0] rounded-full" />
                      <div className="absolute -bottom-1 -start-1 w-2 h-2 bg-[#00A3E0] rounded-full" />
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Bottom Hint & Coordinates Status Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span>{t.dragHint}</span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <span className="text-slate-500">
            {currentLanguage === 'ar' ? 'الموقع:' : 'Position:'}
          </span>
          <span className="font-mono text-[#005A9C] bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
            X: {elements.find((e) => e.id === selectedElementId)?.xPercent ?? 50}% | Y:{' '}
            {elements.find((e) => e.id === selectedElementId)?.yPercent ?? 50}%
          </span>
        </div>
      </div>
    </div>
  );
};
