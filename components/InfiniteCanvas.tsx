
import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { DrawingElement, ToolType, DrawingPoint, PageTemplate } from '../types';

interface InfiniteCanvasProps {
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
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
    elements, setElements, onHistorySave, tool, setTool,
    color, fillColor, strokeWidth, eraserSize, fontSize, template,
    setSelectedElementId, selectedElementId
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'panning' | 'typing'>('none');
    const [cursorPos, setCursorPos] = useState<DrawingPoint>({ x: 0, y: 0 });
    const [textInput, setTextInput] = useState<{ x: number, y: number, value: string, id: string } | null>(null);

    const startPos = useRef<DrawingPoint>({ x: 0, y: 0 });
    const currentPos = useRef<DrawingPoint>({ x: 0, y: 0 });
    const mousePosScreen = useRef<DrawingPoint>({ x: 0, y: 0 });

    const screenToWorld = (sx: number, sy: number) => ({
        x: (sx - pan.x) / scale,
        y: (sy - pan.y) / scale
    });

    // --- TEMPLATE BACKGROUND STYLES ---
    const getBackgroundStyle = () => {
        const bgSize = `${40 * scale}px ${40 * scale}px`;
        const bgPos = `${pan.x}px ${pan.y}px`;
        
        let backgroundImage = 'none';
        if (template === 'grid') {
            backgroundImage = `radial-gradient(#333 1px, transparent 1px)`;
        } else if (template === 'ruled') {
            backgroundImage = `linear-gradient(0deg, transparent 95%, #333 100%)`;
        } else if (template === 'dotted') {
            backgroundImage = `radial-gradient(#444 1px, transparent 1px)`;
        }

        return {
            backgroundImage,
            backgroundSize: bgSize,
            backgroundPosition: bgPos,
            backgroundColor: '#121212'
        };
    };

    // --- EVENTS ---
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const zoomIntensity = 0.1;
                const delta = -Math.sign(e.deltaY);
                const scaleAmount = Math.exp(delta * zoomIntensity);
                
                const rect = canvasRef.current!.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                setScale(prevScale => {
                    const newScale = Math.min(Math.max(0.1, prevScale * scaleAmount), 5);
                    const zoomRatio = newScale / prevScale;
                    setPan(prevPan => ({
                        x: mouseX - (mouseX - prevPan.x) * zoomRatio,
                        y: mouseY - (mouseY - prevPan.y) * zoomRatio
                    }));
                    return newScale;
                });
            } else {
                setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
            }
        };
        const canvas = canvasRef.current;
        if(canvas) canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => { if(canvas) canvas.removeEventListener('wheel', handleWheel); };
    }, []);

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

    const handlePointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        if (action === 'typing') return;

        const { x, y } = screenToWorld(e.clientX, e.clientY);
        startPos.current = { x, y };
        mousePosScreen.current = { x: e.clientX, y: e.clientY };

        if (e.button === 1 || tool === 'selection' && !elements.find(el => isWithinElement(x,y,el))) {
             if (tool !== 'selection') setAction('panning'); // Middle click always pans
             else {
                 // Check if clicking background in selection mode
                 const found = [...elements].reverse().find(el => isWithinElement(x, y, el));
                 if (!found) setAction('panning');
             }
        }

        if (tool === 'selection') {
            const found = [...elements].reverse().find(el => isWithinElement(x, y, el));
            if (found) {
                setSelectedElementId(found.id);
                setAction('moving');
            } else {
                setSelectedElementId(null);
                if (e.button === 0) setAction('panning'); 
            }
            return;
        }

        if (action !== 'panning') {
            setAction('drawing');
            const id = generateId();
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
                currentStrokeColor = '#000'; // Logic only, visually transparent
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
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const { x, y } = screenToWorld(e.clientX, e.clientY);
        setCursorPos({ x: e.clientX, y: e.clientY });
        const threshold = 2 / scale;
        const dist = Math.hypot(x - currentPos.current.x, y - currentPos.current.y);
        currentPos.current = { x, y };
        
        const deltaX = e.clientX - mousePosScreen.current.x;
        const deltaY = e.clientY - mousePosScreen.current.y;
        mousePosScreen.current = { x: e.clientX, y: e.clientY };

        if (action === 'panning') {
            setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
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
            const dxWorld = deltaX / scale;
            const dyWorld = deltaY / scale;
            setElements(prev => prev.map(el => {
                if (el.id === selectedElementId) {
                    const newEl = { ...el, x: el.x + dxWorld, y: el.y + dyWorld };
                    if (newEl.points) newEl.points = newEl.points.map(p => ({ x: p.x + dxWorld, y: p.y + dyWorld }));
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

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(scale, scale);

        // Render elements in CHRONOLOGICAL order
        // This ensures that an eraser stroke only erases what was drawn BEFORE it,
        // allowing new strokes to be drawn on top of erased areas.
        elements.forEach(el => {
            if (el.isDeleted) return;

            ctx.save();
            if (el.type === 'eraser') {
                // True erasing: cuts a hole in the ink layer
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                // Normal drawing: adds ink
                ctx.globalCompositeOperation = 'source-over';
            }
            drawElement(ctx, el);
            ctx.restore();
        });

        // 3. Selection & Cursor
        if (selectedElementId && tool === 'selection' && action === 'none') {
            const el = elements.find(e => e.id === selectedElementId);
            if (el) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                drawSelectionBox(ctx, el, scale);
                ctx.restore();
            }
        }
        
        if (['eraser', 'freedraw', 'highlighter'].includes(tool)) {
            const { x, y } = screenToWorld(cursorPos.x, cursorPos.y);
            const size = tool === 'highlighter' ? 20 : (tool === 'eraser' ? eraserSize : strokeWidth);
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(x, y, size / 2 / scale, 0, Math.PI * 2);
            ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
            ctx.lineWidth = 1 / scale;
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }, [elements, pan, scale, selectedElementId, tool, action, cursorPos]);

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

    const drawSelectionBox = (ctx: CanvasRenderingContext2D, el: DrawingElement, scale: number) => {
        const padding = 8 / scale;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([5 / scale, 5 / scale]);
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

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={getBackgroundStyle()}>
            <canvas 
                ref={canvasRef}
                className={`absolute inset-0 z-10 touch-none ${tool === 'text' ? 'cursor-text' : tool === 'eraser' ? 'cursor-none' : action === 'panning' ? 'cursor-grabbing' : 'cursor-crosshair'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ touchAction: 'none' }}
            />
            {textInput && (
                <textarea
                    autoFocus
                    style={{
                        position: 'absolute',
                        left: textInput.x,
                        top: textInput.y,
                        fontSize: `${fontSize * scale}px`,
                        color: color,
                        transformOrigin: 'top left',
                        minWidth: '100px',
                        zIndex: 30,
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

export default React.memo(InfiniteCanvas);
