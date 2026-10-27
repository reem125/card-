import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasTextElement, Language, SafeZone, Template } from '../types';
import { UI_TRANSLATIONS } from '../data/brandAssets';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  ShieldAlert,
  Move,
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

  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialElemPos, setInitialElemPos] = useState<{ xPercent: number; yPercent: number }>({ xPercent: 0, yPercent: 0 });
  const [initialFontSize, setInitialFontSize] = useState<number>(24);
  const [snapGuides, setSnapGuides] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  // Auto-fit canvas to container on mount or template switch
  const fitToContainer = useCallback(() => {
    if (!containerRef.current) return;
    const padding = 48; // px
    const containerWidth = containerRef.current.clientWidth - padding;
    const containerHeight = containerRef.current.clientHeight - padding;

    if (containerWidth <= 0 || containerHeight <= 0) return;

    const scaleX = containerWidth / template.width;
    const scaleY = containerHeight / template.height;
    const fitScale = Math.min(scaleX, scaleY, 1);
    setZoomScale(fitScale > 0.1 ? fitScale : 0.8);
  }, [template.width, template.height]);

  useEffect(() => {
    fitToContainer();
    const handleResize = () => fitToContainer();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToContainer]);

  // Coordinates helper: converts mouse/touch client point to percentage in canvas space
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    if (!canvasWrapperRef.current) return { xPercent: 50, yPercent: 50 };
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    return { xPercent, yPercent };
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

        // Enforce boundary constraints (safe zone bounds or canvas padding)
        const minX = template.safeZone ? template.safeZone.minXPercent : 5;
        const maxX = template.safeZone ? template.safeZone.maxXPercent : 95;
        const minY = template.safeZone ? template.safeZone.minYPercent : 8;
        const maxY = template.safeZone ? template.safeZone.maxYPercent : 92;

        newXPercent = Math.max(minX, Math.min(maxX, newXPercent));
        newYPercent = Math.max(minY, Math.min(maxY, newYPercent));

        onUpdateElementPosition(selectedElementId, Math.round(newXPercent * 10) / 10, Math.round(newYPercent * 10) / 10);
      } else if (isResizing) {
        const deltaX = clientX - dragStartPos.x;
        const scaleFactor = 1 + (deltaX / 150);
        const calculatedSize = Math.max(12, Math.min(96, Math.round(initialFontSize * scaleFactor)));
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
  }, [isDragging, isResizing, selectedElementId, dragStartPos, initialElemPos, initialFontSize, template.safeZone, onUpdateElementPosition, onUpdateElementFontSize]);

  // Center selected element on canvas
  const handleSnapToCenter = () => {
    if (!selectedElementId) return;
    onUpdateElementPosition(selectedElementId, 50, 50);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 rounded-2xl border border-slate-800 overflow-hidden shadow-xl select-none">
      {/* Top Canvas Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white tracking-wide">
            {currentLanguage === 'ar' ? template.titleAr : template.titleEn}
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-400">
            {template.width} × {template.height} px
          </span>
        </div>

        {/* Zoom & Canvas Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomScale((prev) => Math.max(0.2, prev - 0.1))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] px-1 text-slate-400 min-w-[42px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((prev) => Math.min(2.5, prev + 0.1))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={fitToContainer}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t.fitScreen}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {selectedElementId && (
            <button
              onClick={handleSnapToCenter}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title={t.snapToCenter}
            >
              <Crosshair className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>{t.snapToCenter}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Viewport */}
      <div
        ref={containerRef}
        onClick={() => onSelectElement(null)}
        className="relative flex-1 overflow-auto flex items-center justify-center p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <div
          ref={canvasWrapperRef}
          onClick={(e) => e.stopPropagation()}
          className="relative shadow-2xl transition-transform duration-75 origin-center rounded-lg overflow-hidden border border-slate-700/50"
          style={{
            width: `${template.width}px`,
            height: `${template.height}px`,
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Background Layer: Scaled SVG or Raster Image */}
          {template.imageUrl ? (
            <img
              src={template.imageUrl}
              alt="Template Background"
              className="w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
          ) : template.svgBackground ? (
            <div
              className="w-full h-full pointer-events-none"
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
              className="absolute pointer-events-none border border-dashed border-[#00A3E0]/30 z-20"
              style={{
                left: `${template.safeZone.minXPercent}%`,
                top: `${template.safeZone.minYPercent}%`,
                width: `${template.safeZone.maxXPercent - template.safeZone.minXPercent}%`,
                height: `${template.safeZone.maxYPercent - template.safeZone.minYPercent}%`,
              }}
            >
              <span className="absolute -top-4 start-1 text-[9px] font-mono text-[#00A3E0]/70 uppercase tracking-widest">
                Safe Text Zone
              </span>
            </div>
          )}

          {/* Interactive Text Elements (Draggable & Resizable) */}
          {elements
            .filter((el) => el.isVisible !== false)
            .map((el) => {
              const isSelected = selectedElementId === el.id;
              const elementLabel =
                el.id === 'name'
                  ? currentLanguage === 'ar'
                    ? 'الاسم'
                    : 'Name'
                  : el.id === 'role'
                  ? currentLanguage === 'ar'
                    ? 'المسمى'
                    : 'Role'
                  : currentLanguage === 'ar'
                  ? 'نص إضافي'
                  : 'Optional Text';

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleDragStart(e, el.id)}
                  onTouchStart={(e) => handleDragStart(e, el.id)}
                  className={`absolute cursor-move select-none z-20 group transition-shadow ${
                    isSelected
                      ? 'ring-2 ring-[#00A3E0] ring-offset-1 ring-offset-transparent shadow-lg'
                      : 'hover:ring-1 hover:ring-[#00A3E0]/50'
                  }`}
                  style={{
                    left: `${el.xPercent}%`,
                    top: `${el.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {/* Text Node */}
                  <p
                    dir="auto"
                    style={{
                      fontFamily: `"${el.fontFamily}", Cairo, "Plus Jakarta Sans", sans-serif`,
                      fontSize: `${el.fontSize}px`,
                      fontWeight: el.fontWeight,
                      color: el.color,
                      textAlign: el.alignment,
                      letterSpacing: `${el.letterSpacing}px`,
                      lineHeight: el.lineHeight,
                      whiteSpace: 'nowrap',
                      textShadow: el.hasShadow ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                    }}
                  >
                    {el.text ||
                      (el.id === 'name'
                        ? currentLanguage === 'ar'
                          ? 'الاسم هنا'
                          : 'Your Name Here'
                        : el.id === 'role'
                        ? currentLanguage === 'ar'
                          ? 'المسمى الوظيفي'
                          : 'Job Title'
                        : currentLanguage === 'ar'
                        ? 'نص إضافي اختياري'
                        : 'Optional Text')}
                  </p>

                  {/* Selection Handles (Visible when selected) */}
                  {isSelected && (
                    <>
                      {/* Top drag pill indicator */}
                      <div className="absolute -top-6 start-1/2 -translate-x-1/2 bg-[#00A3E0] text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md pointer-events-none whitespace-nowrap">
                        <Move className="w-2.5 h-2.5" />
                        <span>{elementLabel}</span>
                      </div>

                      {/* Bottom-right Corner Resize Handle */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, el.id)}
                        onTouchStart={(e) => handleResizeStart(e, el.id)}
                        className="absolute -bottom-1.5 -end-1.5 w-3.5 h-3.5 bg-white border-2 border-[#00A3E0] rounded-full shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                        title="Drag to resize text font"
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

      {/* Bottom Hint Banner */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span>{t.dragHint}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-500">
            X: {elements.find((e) => e.id === selectedElementId)?.xPercent ?? 50}% | Y:{' '}
            {elements.find((e) => e.id === selectedElementId)?.yPercent ?? 50}%
          </span>
        </div>
      </div>
    </div>
  );
};
