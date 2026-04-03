import React, { useState, useRef, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { OcrHighlight } from '../../services/ocrService';

interface OcrImageHighlighterProps {
  imageUrl: string;
  highlights: OcrHighlight[];
  onAddHighlight: (highlight: OcrHighlight) => void;
  onRemoveHighlight: (id: string) => void;
}

const OcrImageHighlighter: React.FC<OcrImageHighlighterProps> = ({ imageUrl, highlights, onAddHighlight, onRemoveHighlight }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const [mode, setMode] = useState<'pan' | 'annotate'>('pan');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setMode(prev => prev === 'pan' ? 'annotate' : 'pan');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && containerRef.current && containerRef.current.contains(e.target as Node)) {
        e.preventDefault();
        setScale(prev => {
          const newScale = prev - e.deltaY * 0.001;
          return Math.min(Math.max(0.1, newScale), 5); // Limit zoom between 0.1x and 5x
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.1));
  const handleZoomReset = () => setScale(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === 'pan') {
      if (!containerRef.current) return;
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop
      });
      return;
    }

    if (!imageRef.current || !containerRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && containerRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      containerRef.current.scrollLeft = panStart.scrollLeft - dx;
      containerRef.current.scrollTop = panStart.scrollTop - dy;
      return;
    }

    if (!isDrawing || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;
    
    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);
    
    setCurrentRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !currentRect) return;
    
    setIsDrawing(false);
    
    if (currentRect.width > 10 && currentRect.height > 10) {
      const newHighlight: OcrHighlight = {
        id: Date.now().toString(),
        text: 'Vùng được chọn', // In a real app, we might run OCR on this specific rect
        rect: currentRect,
        color: 'rgba(251, 191, 36, 0.4)' // Amber
      };
      onAddHighlight(newHighlight);
    }
    
    setCurrentRect(null);
  };

  return (
    <GlassSurface className="p-6 flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">image</span>
          Ảnh gốc
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px]">
              {mode === 'pan' ? 'pan_tool' : 'edit'}
            </span>
            {mode === 'pan' ? 'Chế độ Kéo (Ctrl+N để Ghi chú)' : 'Chế độ Ghi chú (Ctrl+N để Kéo)'}
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={handleZoomOut} className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors" title="Thu nhỏ (Ctrl + Scroll Down)">
              <span className="material-symbols-outlined text-sm">zoom_out</span>
            </button>
            <button onClick={handleZoomReset} className="px-2 text-xs font-medium text-slate-600 hover:text-slate-900" title="Khôi phục">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={handleZoomIn} className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors" title="Phóng to (Ctrl + Scroll Up)">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`flex-1 relative overflow-auto custom-scrollbar bg-slate-50 border border-slate-200 rounded-xl ${mode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative inline-block min-w-full min-h-full origin-top-left transition-transform duration-75"
          style={{ transform: `scale(${scale})` }}
        >
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="OCR Source" 
            className="max-w-none pointer-events-none select-none"
            draggable={false}
          />
          
          {/* Render saved highlights */}
          {highlights.map(h => (
            <div
              key={h.id}
              className="absolute border-2 border-amber-500 cursor-pointer transition-all"
              style={{
                left: h.rect.x,
                top: h.rect.y,
                width: h.rect.width,
                height: h.rect.height,
                backgroundColor: hoveredHighlightId === h.id ? 'rgba(251, 191, 36, 0.6)' : h.color,
              }}
              onMouseEnter={() => setHoveredHighlightId(h.id)}
              onMouseLeave={() => setHoveredHighlightId(null)}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHighlight(h.id);
              }}
            >
              {hoveredHighlightId === h.id && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                  Nhấp để xóa
                </div>
              )}
            </div>
          ))}
          
          {/* Render current drawing rect */}
          {isDrawing && currentRect && (
            <div
              className="absolute border-2 border-amber-500 bg-amber-500/30 pointer-events-none"
              style={{
                left: currentRect.x,
                top: currentRect.y,
                width: currentRect.width,
                height: currentRect.height,
              }}
            />
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">info</span>
        Kéo thả chuột trên ảnh để tạo vùng highlight. Nhấp vào vùng đã tạo để xóa.
      </p>
    </GlassSurface>
  );
};

export default OcrImageHighlighter;
