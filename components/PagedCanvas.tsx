
import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { DrawingElement, ToolType, DrawingPoint, PageTemplate } from '../types';

interface PagedCanvasProps {
    elements: DrawingElement[];
    setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
    onHistorySave: () => void;
    tool: ToolType;
    setTool: (t: ToolType) => void;
    color: string;
    fillColor: string;
    strokeWidth: number;
    eraserSize: number;
    fontSize: number;
    template: PageTemplate;
    setSelectedElementId: (id: string | null) => void;
    selectedElementId: string | null;
    initialPageCount?: number;
    onPageCountChange: (count: number) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// A4 Dimensions at approx 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_GAP = 30;

const PagedCanvas: React.FC<PagedCanvasProps> = ({
    elements, setElements, onHistorySave, tool, setTool,
    color, fillColor, strokeWidth, eraserSize, fontSize, template,
    setSelectedElementId, selectedElementId, initialPageCount = 1, onPageCountChange
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const [pageCount, setPageCount] = useState(initialPageCount);
    const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'typing' | 'panning'>('none');
    const [cursorPos, setCursorPos] = useState<DrawingPoint>({ x: 0, y: 0 });
    const [textInput, setTextInput] = useState<{ x: number, y: number, value: string, id: string } | null>(null);

    const startPos = useRef<DrawingPoint>({ x: 0, y: 0 });
    const currentPos = useRef<DrawingPoint>({ x: 0, y: 0 });
    const lastMousePos = useRef<DrawingPoint>({ x: 0, y: 0 }); // For panning

    const totalHeight = pageCount * (A4_HEIGHT + PAGE_GAP) + PAGE_GAP;

    const screenToWorld = (sx: number, sy: number) => {
        // Map screen coordinates to absolute canvas coordinates
        if (!scrollContainerRef.current) return { x: 0, y: 0 };
        
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const scrollTop = scrollContainerRef.current.scrollTop;
        
        // Calculate offset of the centered pages area
        const containerWidth = scrollContainerRef.current.clientWidth;
        const xOffset = Math.max(0, (containerWidth - A4_WIDTH) / 2);
        
        // Screen (Client) -> Relative to Container
        const relX = sx - containerRect.left + scrollLeft;
        const relY = sy - containerRect.top + scrollTop;
        
        // Adjust for centering
        return {
            x: relX - xOffset,
            y: relY - PAGE_GAP // Start drawing at first page top
        };
    };

    const handleAddPage = () => {
        const newCount = pageCount + 1;
        setPageCount(newCount);
        onPageCountChange(newCount);
    };

    // --- EVENTS ---
    const isWithinElement = (ex: number, ey: number, el: DrawingElement) => {
        const padding = 10;
        if (['freedraw', 'highlighter', 'line', 'arrow', 'eraser'].includes(el.type)) {
            if (!el.points) return false;
            const xs = el.points.map(p => p.x);
            const ys = el.points.map(p => p.y);
            return ex >= Math.min(...xs) - padding && ex <= Math.max(...xs) + padding &&
                   ey >= Math.min(...ys) - padding && ey <= Math.max(...ys) + padding;
        } else {
            return ex >= el.x && ex <= el.x + el.width && ey >= el.y && ey <= el.y + el.height;
        }
    };

    // Manual Wheel Handler because Canvas captures events
    const handleWheel = (e: React.WheelEvent) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += e.deltaY;
            scrollContainerRef.current.scrollLeft += e.deltaX;
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        if (action === 'typing') return;

        const { x, y } = screenToWorld(e.clientX, e.clientY);
        startPos.current = { x, y };
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        // Handle Panning (Hand tool or Middle Mouse)
        if (tool === 'hand' || e.button === 1) {
            setAction('panning');
            return;
        }

        if (tool === 'selection') {
            const found = [...elements].reverse().find(el => isWithinElement(x, y, el));
            if (found) {
                setSelectedElementId(found.id);
                setAction('moving');
            } else {
                setSelectedElementId(null);
                // If clicking empty space with selection tool, maybe pan?
                // For now standard behavior is deselect.
            }
            return;
        }

        setAction('drawing');
        const id = generateId();
        
        // Settings similar to InfiniteCanvas
        let currentOpacity = 1;
        let currentStrokeWidth = strokeWidth;
        let currentStrokeColor = color;
        let currentBgColor = fillColor;

        if (tool === 'highlighter') {
            currentOpacity = 0.4;
            currentStrokeWidth = 20;
            currentBgColor = 'transparent';
            if (color === '#ffffff' || color === '#1e1e1e') currentStrokeColor = '#facc15';
        } else if (tool === 'eraser') {
            currentOpacity = 1;
            currentStrokeWidth = eraserSize;
            currentStrokeColor = '#000';
            currentBgColor = 'transparent';
        }

        const newElement: DrawingElement = {
            id, type: tool, x, y, width: 0, height: 0,
            strokeColor: currentStrokeColor, backgroundColor: currentBgColor, strokeWidth: currentStrokeWidth, opacity: currentOpacity, fontSize,
            points: ['freedraw', 'highlighter', 'arrow', 'line', 'eraser'].includes(tool) ? [{ x, y }] : undefined,
            text: tool === 'text' ? '' : undefined
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElementId(id);

        if (tool === 'text') {
            setAction('typing');
            setTextInput({ x: e.clientX, y: e.clientY, value: '', id });
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const { x, y } = screenToWorld(e.clientX, e.clientY);
        setCursorPos({ x: e.clientX, y: e.clientY });
        
        const threshold = 2; 
        const dist = Math.hypot(x - currentPos.current.x, y - currentPos.current.y);
        currentPos.current = { x, y };

        if (action === 'panning' && scrollContainerRef.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            scrollContainerRef.current.scrollLeft -= dx;
            scrollContainerRef.current.scrollTop -= dy;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (action === 'drawing') {
            const index = elements.length - 1;
            if (index < 0) return;
            const el = elements[index];
            
            if (['freedraw', 'highlighter', 'eraser'].includes(tool) && dist < threshold) return;

            const updated = { ...el };
            if (tool === 'freedraw' || tool === 'highlighter' || tool === 'eraser') {
                updated.points = [...(updated.points || []), { x, y }];
            } else if (tool === 'arrow' || tool === 'line') {
                updated.points = [updated.points![0], { x, y }];
            } else if (['rectangle', 'ellipse', 'diamond'].includes(tool)) {
                updated.width = x - startPos.current.x;
                updated.height = y - startPos.current.y;
            }
            const copy = [...elements];
            copy[index] = updated;
            setElements(copy);
        } else if (action === 'moving' && selectedElementId) {
            const dx = x - startPos.current.x;
            const dy = y - startPos.current.y;
            startPos.current = { x, y }; // Reset start for incremental move

            setElements(prev => prev.map(el => {
                if (el.id === selectedElementId) {
                    const newEl = { ...el, x: el.x + dx, y: el.y + dy };
                    if (newEl.points) newEl.points = newEl.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                    return newEl;
                }
                return el;
            }));
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        if (action === 'drawing' || action === 'moving') onHistorySave();
        if (action === 'drawing') setSelectedElementId(null);
        if (action !== 'typing') setAction('none');
    };

    const handleTextFinish = () => {
        if (textInput) {
            if (textInput.value.trim() === '') setElements(prev => prev.filter(el => el.id !== textInput.id));
            else {
                setElements(prev => prev.map(el => el.id === textInput.id ? { ...el, text: textInput.value } : el));
                onHistorySave();
            }
        }
        setTextInput(null);
        setAction('none');
        setTool('selection');
    };

    // --- RENDER LOGIC ---
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = A4_WIDTH;
        canvas.height = totalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        
        // Render in chronological order to support true erasing
        elements.forEach(el => {
            if (el.isDeleted) return;

            ctx.save();
            if (el.type === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }
            drawElement(ctx, el);
            ctx.restore();
        });

        if (selectedElementId && tool === 'selection' && action === 'none') {
            const el = elements.find(e => e.id === selectedElementId);
            if (el) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                drawSelectionBox(ctx, el);
                ctx.restore();
            }
        }

        if (['eraser', 'freedraw', 'highlighter'].includes(tool)) {
            if (scrollContainerRef.current) {
                const { x, y } = screenToWorld(cursorPos.x, cursorPos.y);
                const size = tool === 'highlighter' ? 20 : (tool === 'eraser' ? eraserSize : strokeWidth);
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.arc(x, y + PAGE_GAP, size / 2, 0, Math.PI * 2); 
                
                ctx.strokeStyle = tool === 'eraser' ? '#000' : color;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();
    }, [elements, pageCount, tool, action, cursorPos, totalHeight]);

    // Helper draw functions
    const drawElement = (ctx: CanvasRenderingContext2D, el: DrawingElement) => {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.backgroundColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        switch (el.type) {
            case 'rectangle':
                ctx.rect(el.x, el.y, el.width, el.height);
                if (el.backgroundColor !== 'transparent') ctx.fill();
                ctx.stroke();
                if (el.text) drawTextInBox(ctx, el.text, el.x, el.y, el.width, el.height, el.strokeColor, el.fontSize);
                break;
            case 'diamond':
                ctx.moveTo(el.x + el.width / 2, el.y);
                ctx.lineTo(el.x + el.width, el.y + el.height / 2);
                ctx.lineTo(el.x + el.width / 2, el.y + el.height);
                ctx.lineTo(el.x, el.y + el.height / 2);
                ctx.closePath();
                if (el.backgroundColor !== 'transparent') ctx.fill();
                ctx.stroke();
                if (el.text) drawTextInBox(ctx, el.text, el.x, el.y, el.width, el.height, el.strokeColor, el.fontSize);
                break;
            case 'ellipse':
                ctx.ellipse(el.x + el.width/2, el.y + el.height/2, Math.abs(el.width/2), Math.abs(el.height/2), 0, 0, 2 * Math.PI);
                if (el.backgroundColor !== 'transparent') ctx.fill();
                ctx.stroke();
                if (el.text) drawTextInBox(ctx, el.text, el.x, el.y, el.width, el.height, el.strokeColor, el.fontSize);
                break;
            case 'line':
            case 'arrow':
                if (el.points && el.points.length > 0) {
                    const start = el.points[0];
                    const end = el.points[el.points.length - 1];
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                    if (el.type === 'arrow') {
                        const angle = Math.atan2(end.y - start.y, end.x - start.x);
                        const headLen = 15 + (el.strokeWidth * 2);
                        ctx.beginPath();
                        ctx.moveTo(end.x, end.y);
                        ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
                        ctx.moveTo(end.x, end.y);
                        ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
                        ctx.stroke();
                    }
                }
                break;
            case 'freedraw':
            case 'highlighter':
            case 'eraser':
                if (el.points && el.points.length > 0) {
                    const points = el.points;
                    const smooth = (points.length > 2);
                    if (!smooth) {
                        ctx.moveTo(points[0].x, points[0].y);
                        points.forEach(p => ctx.lineTo(p.x, p.y));
                    } else {
                        ctx.moveTo(points[0].x, points[0].y);
                        for (let i = 1; i < points.length - 1; i++) {
                            const p0 = points[i];
                            const p1 = points[i + 1];
                            const midX = (p0.x + p1.x) / 2;
                            const midY = (p0.y + p1.y) / 2;
                            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
                        }
                        const last = points[points.length - 1];
                        ctx.lineTo(last.x, last.y);
                    }
                    ctx.stroke();
                }
                break;
            case 'text':
                if (el.text) {
                    const fSize = el.fontSize || 20;
                    ctx.font = `${fSize}px "Virgil", "Lexend", sans-serif`;
                    ctx.fillStyle = el.strokeColor;
                    ctx.textBaseline = 'top';
                    const lines = el.text.split('\n');
                    lines.forEach((line, i) => {
                        ctx.fillText(line, el.x, el.y + (i * (fSize * 1.2)));
                    });
                }
                break;
        }
        ctx.restore();
    };

    const drawTextInBox = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number, h: number, color: string, fSize?: number) => {
        const size = fSize || 16;
        ctx.font = `${size}px "Virgil", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Simple word wrap and centering
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < Math.abs(w) - 10) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        const totalHeight = lines.length * (size * 1.2);
        const startY = y + h / 2 - (totalHeight / 2) + (size / 2);

        lines.forEach((line, i) => {
            ctx.fillText(line, x + w / 2, startY + i * (size * 1.2));
        });
    };

    const drawSelectionBox = (ctx: CanvasRenderingContext2D, el: DrawingElement) => {
        const padding = 8;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        let bx = el.x, by = el.y, bw = el.width, bh = el.height;
        if (['arrow', 'line', 'freedraw', 'highlighter', 'eraser'].includes(el.type) && el.points) {
            const xs = el.points.map(p => p.x);
            const ys = el.points.map(p => p.y);
            bx = Math.min(...xs); by = Math.min(...ys);
            bw = Math.max(...xs) - bx; bh = Math.max(...ys) - by;
        }
        ctx.strokeRect(bx - padding, by - padding, bw + padding*2, bh + padding*2);
        ctx.setLineDash([]);
    };

    const getPageStyle = () => {
        let backgroundImage = 'none';
        if (template === 'grid') backgroundImage = `radial-gradient(#ccc 1px, transparent 1px)`;
        else if (template === 'ruled') backgroundImage = `linear-gradient(0deg, transparent 95%, #ccc 100%)`;
        else if (template === 'dotted') backgroundImage = `radial-gradient(#999 1px, transparent 1px)`;
        
        return {
            backgroundImage,
            backgroundSize: '30px 30px'
        };
    };

    return (
        <div className="flex-1 relative bg-gray-200 overflow-hidden flex flex-col h-full">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full relative h-full">
                <div className="flex flex-col items-center py-8 relative min-h-full">
                    {/* Render Page Backgrounds */}
                    {Array.from({ length: pageCount }).map((_, i) => (
                        <div 
                            key={i}
                            className="bg-white shadow-lg mb-[30px] relative"
                            style={{ 
                                width: A4_WIDTH, 
                                height: A4_HEIGHT,
                                ...getPageStyle()
                            }}
                        >
                            <span className="absolute bottom-2 right-4 text-xs text-gray-400 select-none">Page {i+1}</span>
                        </div>
                    ))}

                    {/* Overlay Canvas for Drawing */}
                    <canvas 
                        ref={canvasRef}
                        className={`absolute top-[32px] left-1/2 -translate-x-1/2 z-10 touch-none ${tool === 'text' ? 'cursor-text' : tool === 'eraser' ? 'cursor-none' : tool === 'hand' || action === 'panning' ? 'cursor-grabbing' : 'cursor-crosshair'}`}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onWheel={handleWheel}
                        style={{ pointerEvents: 'auto', touchAction: 'none' }}
                    />

                    {/* Add Page Button at Bottom */}
                    <button 
                        onClick={handleAddPage}
                        className="mt-4 mb-10 flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-50 transition-all font-bold text-sm z-20 cursor-pointer"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Thêm trang
                    </button>
                </div>
            </div>

            {textInput && (
                <textarea
                    autoFocus
                    style={{
                        position: 'fixed',
                        left: textInput.x,
                        top: textInput.y,
                        fontSize: `${fontSize}px`,
                        color: color,
                        minWidth: '100px',
                        zIndex: 50,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: '"Virgil", sans-serif'
                    }}
                    value={textInput.value}
                    onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                    onBlur={handleTextFinish}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextFinish(); }
                        if (e.key === 'Escape') { setTextInput(null); setAction('none'); }
                    }}
                    placeholder="Type..."
                />
            )}
        </div>
    );
};

export default React.memo(PagedCanvas);
