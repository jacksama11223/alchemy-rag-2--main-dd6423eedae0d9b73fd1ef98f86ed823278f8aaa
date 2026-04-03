
import React, { useState, useEffect, useRef } from 'react';
import { FeatureWindowControls } from './FeatureWindowControls';
import { SavedDrawing } from '../types';
import { getDrawingsFromBackend, saveDrawingToBackend, deleteDrawingFromBackend, getCurrentUser } from '../services/mockBackend';

interface DrawingManagerProps {
    onBack: () => void;
    onOpenDrawing: (drawing: SavedDrawing) => void;
    onShowAccount: () => void;
    onLogout: () => void;
    onNavigateToFeature: (feature: string, params?: any) => void;
}

// --- DYNAMIC OCEAN BACKGROUND ---
const CreativeOceanBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Elements: Bubbles, Light Rays, Floating Shapes
        const bubbles: any[] = [];
        const rays: any[] = [];
        
        for (let i = 0; i < 50; i++) {
            bubbles.push({
                x: Math.random() * width,
                y: Math.random() * height + height,
                radius: Math.random() * 4 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.1,
                sway: Math.random() * 20,
                offset: Math.random() * Math.PI * 2
            });
        }

        for (let i = 0; i < 5; i++) {
            rays.push({
                x: Math.random() * width,
                width: Math.random() * 100 + 50,
                angle: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.1 + 0.05
            });
        }

        let time = 0;

        const animate = () => {
            if (!ctx) return;
            time += 0.005;
            ctx.clearRect(0, 0, width, height);

            // Deep Ocean Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#0f172a'); // Surface Dark Blue
            gradient.addColorStop(1, '#020617'); // Deep Black/Blue
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw Light Rays
            ctx.save();
            rays.forEach(ray => {
                const rayGrad = ctx.createLinearGradient(ray.x, 0, ray.x, height);
                rayGrad.addColorStop(0, `rgba(56, 189, 248, ${ray.opacity})`); // Light Blue
                rayGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = rayGrad;
                ctx.beginPath();
                ctx.moveTo(ray.x - ray.width/2 + Math.sin(time + ray.x)*20, 0);
                ctx.lineTo(ray.x + ray.width/2 + Math.sin(time + ray.x)*20, 0);
                ctx.lineTo(ray.x + ray.width*2 + Math.tan(ray.angle)*height, height);
                ctx.lineTo(ray.x - ray.width*2 + Math.tan(ray.angle)*height, height);
                ctx.fill();
            });
            ctx.restore();

            // Draw Bubbles (Creative Ideas rising)
            bubbles.forEach(b => {
                b.y -= b.speed;
                const currentX = b.x + Math.sin(time + b.offset) * b.sway;
                
                if (b.y < -10) {
                    b.y = height + 10;
                    b.x = Math.random() * width;
                }

                ctx.beginPath();
                ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(165, 243, 252, ${b.opacity})`; // Cyan bubbles
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(165, 243, 252, 0.5)`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const TEMPLATES = [
    { id: 'blank', name: 'Giấy Trắng', icon: 'check_box_outline_blank', bg: 'bg-white' },
    { id: 'grid', name: 'Lưới Kỹ Thuật', icon: 'grid_on', bg: 'radial-gradient(#ccc 1px, transparent 1px)' },
    { id: 'dotted', name: 'Chấm Bi (Dot)', icon: 'grain', bg: 'radial-gradient(#999 1px, transparent 1px)' },
    { id: 'mindmap', name: 'Sơ Đồ Tư Duy', icon: 'hub', bg: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)' },
];

const DAILY_PROMPTS = [
    "Vẽ lại cấu trúc của một tế bào sinh học.",
    "Phác thảo sơ đồ quy trình đăng nhập User.",
    "Vẽ một nhân vật lịch sử theo phong cách Chibi.",
    "Thiết kế giao diện cho ứng dụng nghe nhạc.",
    "Minh họa định lý Pytago."
];

export const DrawingManager: React.FC<DrawingManagerProps> = ({ 
    onBack, onOpenDrawing, onShowAccount, onLogout, onNavigateToFeature 
}) => {
    const [drawings, setDrawings] = useState<SavedDrawing[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dailyPrompt, setDailyPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to sanitize drawing data to prevent crashes
    const sanitizeDrawings = (data: any[]): SavedDrawing[] => {
        return data
            .filter(d => d && typeof d === 'object') // Remove nulls
            .map(d => ({
                id: d.id || Date.now().toString() + Math.random(),
                name: typeof d.name === 'string' ? d.name : 'Untitled Drawing',
                date: typeof d.date === 'string' ? d.date : new Date().toLocaleString(),
                elements: Array.isArray(d.elements) ? d.elements : [],
                template: d.template || 'grid',
                mode: d.mode || 'infinite',
                pageCount: typeof d.pageCount === 'number' ? d.pageCount : 1
            }));
    };

    useEffect(() => {
        const loadDrawings = async () => {
            // 1. FAST LOAD: Load from LocalStorage immediately with SAFETY CHECK
            try {
                const localData = localStorage.getItem('draw_everything_files');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed)) {
                        const safeData = sanitizeDrawings(parsed);
                        setDrawings(safeData);
                        // Heal local storage if corruption was found
                        if (safeData.length !== parsed.length || JSON.stringify(safeData) !== localData) {
                             localStorage.setItem('draw_everything_files', JSON.stringify(safeData));
                        }
                    } else {
                        console.warn("Corrupt drawing data found (not array), resetting.");
                        localStorage.setItem('draw_everything_files', '[]');
                        setDrawings([]);
                    }
                    setIsLoading(false); 
                }
            } catch (e) { 
                console.error("Local load failed", e); 
                // Reset if totally broken to prevent white screen
                localStorage.setItem('draw_everything_files', '[]');
                setDrawings([]);
            }

            // 2. SYNC LOAD: Fetch from Backend in background
            try {
                const backendData = await getDrawingsFromBackend();
                if (backendData && Array.isArray(backendData)) {
                    const safeBackendData = sanitizeDrawings(backendData);
                    // Update state with fresh server data
                    setDrawings(safeBackendData);
                    // Update local cache safely
                    localStorage.setItem('draw_everything_files', JSON.stringify(safeBackendData));
                }
            } catch (e) {
                console.warn("Backend sync failed, using local data");
            } finally {
                setIsLoading(false);
            }
        };

        loadDrawings();
        setDailyPrompt(DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)]);
    }, []);

    const handleCreateNew = async (templateId: string = 'grid') => {
        const currentUser = getCurrentUser();
        
        const newDrawing: SavedDrawing = {
            id: Date.now().toString(), // Use client-side ID initially so fallback works
            name: `Bản vẽ mới ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            date: new Date().toLocaleString(),
            elements: [],
            template: templateId as any,
            mode: 'infinite',
            pageCount: 1
        };
        
        // Optimistically open, but save to backend first
        const saved = await saveDrawingToBackend(newDrawing);
        
        if (saved) {
             onOpenDrawing(saved);
        } else {
             // If completely failed (shouldn't happen with fallback), just open the local object
             onOpenDrawing(newDrawing);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Bạn chắc chắn muốn xóa bản vẽ này?")) {
            // Optimistic update for UI
            const newDrawings = drawings.filter(d => d.id !== id);
            setDrawings(newDrawings);
            // Sync local immediately to prevent ghost items
            localStorage.setItem('draw_everything_files', JSON.stringify(newDrawings));
            
            const success = await deleteDrawingFromBackend(id);
            if(!success) {
                 console.warn("Deleted locally only");
            }
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                if (parsed.elements && Array.isArray(parsed.elements)) {
                    const newDrawing: SavedDrawing = {
                        id: Date.now().toString(), 
                        name: parsed.name || "Imported Drawing",
                        date: new Date().toLocaleString(),
                        elements: parsed.elements,
                        template: parsed.template || 'blank',
                        mode: parsed.mode || 'infinite',
                        pageCount: parsed.pageCount || 1
                    };
                    const saved = await saveDrawingToBackend(newDrawing);
                    if(saved) {
                        const updated = [saved, ...drawings];
                        setDrawings(updated);
                        localStorage.setItem('draw_everything_files', JSON.stringify(updated));
                        alert("Đã nhập bản vẽ thành công!");
                    }
                } else { alert("File không hợp lệ."); }
            } catch (err) { alert("Lỗi đọc file."); }
        };
        reader.readAsText(fileObj);
        event.target.value = '';
    };

    // ... (Keep integration handlers: sendToAlchemy, askTutor, etc.) ...
     // 1. Alchemy: Image-to-Text / Analysis
    const sendToAlchemy = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('alchemy', { type: 'create', initialQuery: `Analyze the drawing "${drawing.name}" and extract learning points.` });
        alert(`Đang chuyển "${drawing.name}" sang Giả Kim Thuật...`);
    };

    // 2. Tutor: AI Critique
    const askTutor = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('tutor', { context: `Please critique this drawing concept: ${drawing.name}. Identify gaps.` });
        alert(`Đã mở Gia sư để thảo luận về "${drawing.name}"`);
    };

    // 3. Graph: Map Idea
    const addToGraph = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('explore-graph', { focus: 'create_from_drawing', data: drawing });
        alert(`Đã tạo một Node mới từ "${drawing.name}" trong Sơ đồ!`);
    };

    // 4. Community: Share
    const shareToCommunity = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('community');
        alert(`Đang chuẩn bị chia sẻ "${drawing.name}" lên triển lãm cộng đồng...`);
    };

    // 5. NoteLab: Embed
    const embedInNote = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('media', { action: 'embed_drawing', drawingId: drawing.id });
        alert(`Đã chèn bản vẽ vào ghi chú gần nhất.`);
    };

    // 6. Todo: Create Task
    const createTask = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('digest', { task: `Hoàn thiện bản vẽ: ${drawing.name}` });
        alert(`Đã thêm task: "Hoàn thiện ${drawing.name}"`);
    };

    // 7. Drive: Backup
    const backupToDrive = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('drive');
        alert(`Đang sao lưu "${drawing.name}" lên Drive Storage...`);
    };

    // 8. Dashboard: Pin
    const pinToDashboard = (drawing: SavedDrawing, e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigateToFeature('dashboard');
        alert(`Đã ghim "${drawing.name}" lên bảng tin Dashboard.`);
    };

    // Safe filter logic
    const filteredDrawings = drawings.filter(d => {
        if (!d || !d.name) return false;
        return d.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-display flex flex-col overflow-hidden relative">
            <CreativeOceanBackground />
            
            {/* 1. Header & Stats */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-[#2a2a2a] bg-[#0f172a]/80 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <span className="material-symbols-outlined text-amber-500 text-3xl">palette</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                            Xưởng Vẽ Sáng Tạo <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">Creative Studio</span>
                        </h1>
                        <div className="flex gap-4 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-cyan-400">image</span> {drawings.length} tác phẩm</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-green-400">cloud_done</span> {isLoading ? 'Đang đồng bộ...' : 'Đã đồng bộ'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tác phẩm..." 
                            className="bg-[#1e293b]/80 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 w-64 transition-all focus:w-72"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-lg group-hover:text-cyan-400 transition-colors">search</span>
                    </div>
                    
                    <button onClick={() => onNavigateToFeature('dashboard')} className="text-slate-300 hover:text-white flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors" title="Về Dashboard">
                        <span className="material-symbols-outlined text-xl">home</span>
                    </button>
                    
                    <button onClick={onShowAccount} className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 p-[2px] shadow-lg hover:scale-105 transition-transform">
                         <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-transparent transition-colors">
                             <span className="material-symbols-outlined text-white text-xl">person</span>
                         </div>
                    </button>
                    <FeatureWindowControls onClose={onBack} />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* 2. Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    
                    {/* Templates Section */}
                    <section className="mb-10 animate-[fadeInDown_0.5s]">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-cyan-400">dashboard_customize</span> Khởi tạo nhanh
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {TEMPLATES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => handleCreateNew(t.id)}
                                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#1e293b]/80 border border-white/5 hover:border-cyan-500/50 hover:bg-[#1e293b] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all group gap-3 backdrop-blur-sm"
                                >
                                    <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Gallery Section */}
                    <section className="animate-[fadeInUp_0.5s]">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-amber-400">gallery_thumbnail</span> Thư viện của bạn
                            </h2>
                            <div className="flex gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">upload</span> Import
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* Create New Card */}
                            <button 
                                onClick={() => handleCreateNew('blank')}
                                className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 hover:border-amber-500/50 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-amber-400 hover:bg-white/5 transition-all group backdrop-blur-sm"
                            >
                                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                                <span className="text-sm font-bold">Vẽ Trống</span>
                            </button>

                            {/* Drawing Cards */}
                            {filteredDrawings.map(drawing => (
                                <div 
                                    key={drawing.id} 
                                    onClick={() => onOpenDrawing(drawing)}
                                    className="group relative aspect-[4/3] bg-[#1e293b]/60 rounded-2xl border border-white/10 hover:border-cyan-500/30 overflow-hidden cursor-pointer shadow-lg hover:shadow-cyan-900/20 transition-all hover:-translate-y-1 backdrop-blur-md"
                                >
                                    {/* Preview */}
                                    <div className="absolute inset-0 p-4 opacity-50 group-hover:opacity-30 transition-opacity">
                                        <div className="w-full h-full bg-[#121212]/50 rounded-lg border border-white/5 flex items-center justify-center"
                                             style={{ 
                                                 backgroundImage: drawing.template === 'grid' ? 'radial-gradient(#444 1px, transparent 1px)' : 'none',
                                                 backgroundSize: '10px 10px'
                                             }}
                                        >
                                            <span className="material-symbols-outlined text-4xl text-slate-600 group-hover:text-cyan-600 transition-colors">brush</span>
                                        </div>
                                    </div>

                                    {/* Info Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                        <h3 className="font-bold text-white truncate mb-0.5 group-hover:text-cyan-300 transition-colors">{drawing.name}</h3>
                                        <p className="text-[10px] text-slate-400">
                                            {drawing.date ? drawing.date.split(',')[0] : 'Unknown Date'} • {drawing.elements ? drawing.elements.length : 0} items
                                        </p>
                                    </div>

                                    {/* Integration Actions (Reveal on Hover) - FULL 8 INTEGRATIONS */}
                                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 z-10 gap-2">
                                        <div className="grid grid-cols-4 gap-2 w-full">
                                            <button onClick={(e) => sendToAlchemy(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 transition-colors" title="Alchemy">
                                                <span className="material-symbols-outlined text-xl">science</span>
                                            </button>
                                            <button onClick={(e) => askTutor(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-green-600/20 text-slate-300 hover:text-green-400 transition-colors" title="Tutor">
                                                <span className="material-symbols-outlined text-xl">school</span>
                                            </button>
                                            <button onClick={(e) => addToGraph(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-400 transition-colors" title="Graph">
                                                <span className="material-symbols-outlined text-xl">hub</span>
                                            </button>
                                            <button onClick={(e) => shareToCommunity(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-pink-600/20 text-slate-300 hover:text-pink-400 transition-colors" title="Community">
                                                <span className="material-symbols-outlined text-xl">public</span>
                                            </button>
                                            
                                            {/* Row 2 */}
                                            <button onClick={(e) => embedInNote(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 transition-colors" title="NoteLab">
                                                <span className="material-symbols-outlined text-xl">edit_note</span>
                                            </button>
                                            <button onClick={(e) => createTask(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-amber-600/20 text-slate-300 hover:text-amber-400 transition-colors" title="Todo">
                                                <span className="material-symbols-outlined text-xl">checklist</span>
                                            </button>
                                            <button onClick={(e) => backupToDrive(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 transition-colors" title="Drive">
                                                <span className="material-symbols-outlined text-xl">cloud_upload</span>
                                            </button>
                                            <button onClick={(e) => pinToDashboard(drawing, e)} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-teal-600/20 text-slate-300 hover:text-teal-400 transition-colors" title="Dashboard">
                                                <span className="material-symbols-outlined text-xl">push_pin</span>
                                            </button>
                                        </div>
                                        
                                        <button onClick={(e) => handleDelete(drawing.id, e)} className="mt-1 text-red-500 hover:text-red-400 text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-sm">delete</span> Xóa bản vẽ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* 3. Right Sidebar: Ecosystem Hub */}
                <aside className="w-80 bg-[#0b1120]/80 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">lightbulb</span> Cảm hứng mỗi ngày
                        </h3>
                        <div className="p-4 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl shadow-lg">
                            <p className="text-sm text-white italic leading-relaxed">"{dailyPrompt}"</p>
                            <button 
                                onClick={() => handleCreateNew()}
                                className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
                            >
                                Thử vẽ ngay <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hub</span> Hệ Sinh Thái (Ecosystem)
                        </h3>
                        <div className="space-y-3">
                            <button onClick={() => onNavigateToFeature('alchemy')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all group text-left">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">science</span></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">Giả Kim Thuật</div>
                                    <div className="text-[10px] text-slate-500">Chế tác từ bản vẽ</div>
                                </div>
                            </button>

                            <button onClick={() => onNavigateToFeature('media')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-purple-500/50 hover:bg-purple-900/10 transition-all group text-left">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">edit_note</span></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">NoteLab</div>
                                    <div className="text-[10px] text-slate-500">Đính kèm vào ghi chú</div>
                                </div>
                            </button>

                            <button onClick={() => onNavigateToFeature('drive')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-blue-500/50 hover:bg-blue-900/10 transition-all group text-left">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">folder_open</span></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">Drive Storage</div>
                                    <div className="text-[10px] text-slate-500">Lấy ảnh tham khảo</div>
                                </div>
                            </button>
                            
                            <button onClick={() => onNavigateToFeature('digest')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-green-500/50 hover:bg-green-900/10 transition-all group text-left">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">checklist</span></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">Todo List</div>
                                    <div className="text-[10px] text-slate-500">Lên lịch vẽ</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-black/40 border-t border-white/10 text-center">
                        <p className="text-[10px] text-slate-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                            Dữ liệu được lưu & đồng bộ tự động
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};
