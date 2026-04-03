
import React, { useState, useEffect, useMemo } from 'react';

// ----------------------------------------------------------------------
// 1. FOCUS HEATMAP: Interactive 24h Grid
// ----------------------------------------------------------------------

export const FocusHeatmap: React.FC = () => {
    // Generate mock data for 24 hours
    const data = useMemo(() => Array.from({length: 24}, (_, i) => ({
        hour: i,
        value: Math.floor(Math.random() * 100), // 0-100 focus score
        active: Math.random() > 0.3 // Did study or not
    })), []);

    const [hoveredHour, setHoveredHour] = useState<number | null>(null);

    const getColor = (value: number, active: boolean) => {
        if (!active) return 'bg-slate-800';
        if (value > 80) return 'bg-cyan-400 shadow-[0_0_10px_cyan]';
        if (value > 50) return 'bg-cyan-600';
        return 'bg-cyan-900';
    };

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span> Giờ học hiệu quả
                </h4>
                <div className="flex gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-900 rounded-sm"></div> Thấp</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-400 rounded-sm"></div> Cao</span>
                </div>
            </div>
            
            <div className="relative h-24 flex items-end gap-1" onMouseLeave={() => setHoveredHour(null)}>
                {data.map((d) => (
                    <div 
                        key={d.hour} 
                        className={`flex-1 rounded-sm transition-all duration-300 relative group cursor-pointer ${getColor(d.value, d.active)}`}
                        style={{ 
                            height: d.active ? `${Math.max(10, d.value)}%` : '4px',
                            opacity: hoveredHour === null || hoveredHour === d.hour ? 1 : 0.4
                        }}
                        onMouseEnter={() => setHoveredHour(d.hour)}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <span className="font-bold">{d.hour}:00</span> - {d.active ? `Focus: ${d.value}%` : 'Idle'}
                        </div>
                    </div>
                ))}
                
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-10">
                    <div className="w-full h-px bg-white border-b border-dashed"></div>
                    <div className="w-full h-px bg-white border-b border-dashed"></div>
                    <div className="w-full h-px bg-white border-b border-dashed"></div>
                </div>
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. FORGETTING CURVE GRAPH: Custom SVG Engine
// ----------------------------------------------------------------------

export const ForgettingCurveGraph: React.FC = () => {
    const width = 300;
    const height = 150;
    const padding = 20;

    // Ebbinghaus Forgetting Curve formula approximation: R = e^(-t/S)
    const generateCurve = (strength: number) => {
        const points = [];
        for (let t = 0; t <= width; t+=5) {
            const r = Math.exp(-t / (strength * 50)); // Scale t
            const y = height - (r * (height - padding*2)) - padding;
            points.push(`${t},${y}`);
        }
        return points.join(' ');
    };

    const curveNoReview = generateCurve(1); // Fast decay
    const curveReview1 = generateCurve(3); // Slower
    const curveReview2 = generateCurve(8); // Very slow

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 mb-4 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">trending_down</span> Đường cong quên lãng
            </h4>
            
            <div className="relative w-full aspect-[2/1] bg-black/20 rounded-lg overflow-hidden border border-white/5">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Axes */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="#334155" strokeWidth="2" />
                    <line x1="0" y1="0" x2="0" y2={height} stroke="#334155" strokeWidth="2" />
                    
                    {/* Curves */}
                    <polyline points={curveNoReview} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,2" />
                    <polyline points={curveReview1} fill="none" stroke="#facc15" strokeWidth="2" strokeOpacity="0.7" />
                    <polyline points={curveReview2} fill="none" stroke="#22c55e" strokeWidth="2" />

                    {/* Labels placed manually */}
                    <text x={width - 10} y={height - 10} fill="#f43f5e" fontSize="10" textAnchor="end">Quên nhanh</text>
                    <text x={width - 10} y="30" fill="#22c55e" fontSize="10" textAnchor="end">Ghi nhớ sâu</text>
                </svg>

                {/* Legend Overlay */}
                <div className="absolute top-2 left-2 text-[9px] space-y-1">
                    <div className="flex items-center gap-1 text-slate-400"><div className="w-2 h-0.5 bg-red-500"></div> Không ôn tập</div>
                    <div className="flex items-center gap-1 text-slate-400"><div className="w-2 h-0.5 bg-green-500"></div> Ôn tập định kỳ</div>
                </div>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                Hiệu suất ghi nhớ tăng 200% khi ôn tập đúng thời điểm.
            </p>
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. WEAKNESS RADAR: SVG Polygon Chart
// ----------------------------------------------------------------------

export const WeaknessRadar: React.FC = () => {
    // Mock Data: 0-100 scale
    const stats = {
        grammar: 85,
        vocab: 60,
        reflex: 40,
        listening: 75,
        reading: 90
    };

    // Calculate Polygon Points
    const size = 100;
    const center = size / 2;
    const radius = 40;
    
    const getPoint = (val: number, angle: number) => {
        const r = (val / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    };

    const angles = [0, 72, 144, 216, 288].map(d => (d - 90) * (Math.PI / 180)); // Start from top
    const polyPoints = [
        getPoint(stats.grammar, angles[0]),
        getPoint(stats.vocab, angles[1]),
        getPoint(stats.reflex, angles[2]),
        getPoint(stats.listening, angles[3]),
        getPoint(stats.reading, angles[4]),
    ].join(' ');

    const fullPoly = angles.map(a => getPoint(100, a)).join(' ');

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 mb-4 shadow-lg flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible transform hover:scale-110 transition-transform duration-500">
                    {/* Background Grid */}
                    <polygon points={fullPoly} fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                    
                    {/* Data Shape */}
                    <polygon points={polyPoints} fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" strokeWidth="2" />
                    
                    {/* Points */}
                    {angles.map((a, i) => {
                        const vals = Object.values(stats);
                        const [px, py] = getPoint(vals[i], a).split(',').map(Number);
                        return <circle key={i} cx={px} cy={py} r="2" fill="white" />;
                    })}
                </svg>
            </div>
            
            <div className="flex-1 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phân tích kỹ năng</h4>
                <div className="space-y-1.5">
                    {Object.entries(stats).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                            <span className="capitalize text-slate-300">{key}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${val < 50 ? 'bg-red-500' : val < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                        style={{ width: `${val}%` }}
                                    ></div>
                                </div>
                                <span className={`font-mono w-6 text-right ${val < 50 ? 'text-red-400' : 'text-slate-400'}`}>{val}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. STUDY SESSION TIMER: Interactive Stopwatch
// ----------------------------------------------------------------------

export const StudySessionTimer: React.FC = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);

    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLap = () => {
        setLaps(prev => [...prev, seconds]);
    };

    const handleReset = () => {
        setSeconds(0);
        setIsActive(false);
        setLaps([]);
    };

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 mb-4 text-center shadow-lg relative overflow-hidden">
            {/* Background Pulse */}
            {isActive && <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"></div>}

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thời gian tập trung</h4>
            <div className="text-4xl font-mono font-black text-white mb-4 tracking-widest relative z-10 drop-shadow-md">
                {formatTime(seconds)}
            </div>
            
            <div className="flex justify-center gap-3 relative z-10">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`px-6 py-2 rounded-full font-bold text-xs transition-all shadow-lg hover:scale-105 ${
                        isActive 
                        ? 'bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500/30'
                    }`}
                >
                    {isActive ? 'Tạm dừng' : 'Bắt đầu'}
                </button>
                <button onClick={handleLap} disabled={!isActive} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 transition-colors">
                    <span className="material-symbols-outlined text-lg">flag</span>
                </button>
                <button onClick={handleReset} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
            </div>

            {laps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 max-h-24 overflow-y-auto text-xs scrollbar-thin scrollbar-thumb-slate-600">
                    <table className="w-full text-left text-slate-300">
                        <tbody>
                            {laps.slice().reverse().map((lap, i) => (
                                <tr key={i} className="border-b border-white/5 last:border-none">
                                    <td className="py-1 text-slate-500">Lap {laps.length - i}</td>
                                    <td className="py-1 text-right font-mono">{formatTime(lap)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. GOAL SETTER: Interactive Checklist
// ----------------------------------------------------------------------

export const GoalSetterWidget: React.FC = () => {
    const [goals, setGoals] = useState([
        { id: 1, text: "Học 50 thẻ từ vựng", checked: false },
        { id: 2, text: "Đọc 1 bài báo tiếng Anh", checked: true },
    ]);
    const [newGoal, setNewGoal] = useState("");

    const toggleGoal = (id: number) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, checked: !g.checked } : g));
    };

    const addGoal = () => {
        if (!newGoal.trim()) return;
        setGoals([...goals, { id: Date.now(), text: newGoal, checked: false }]);
        setNewGoal("");
    };

    const progress = Math.round((goals.filter(g => g.checked).length / goals.length) * 100) || 0;

    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mục tiêu hôm nay</h4>
                <span className="text-xs font-bold text-blue-400">{progress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                <div 
                    className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="space-y-2 mb-3">
                {goals.map(g => (
                    <div key={g.id} className="flex items-center gap-3 group">
                        <div 
                            onClick={() => toggleGoal(g.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${g.checked ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-white'}`}
                        >
                            {g.checked && <span className="material-symbols-outlined text-white text-sm">check</span>}
                        </div>
                        <span className={`text-sm transition-all ${g.checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{g.text}</span>
                        <button onClick={() => setGoals(goals.filter(x => x.id !== g.id))} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input 
                    className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                    placeholder="Thêm mục tiêu..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                />
                <button onClick={addGoal} className="text-blue-400 hover:text-white bg-blue-500/10 p-1 rounded hover:bg-blue-500/30">
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </div>
        </div>
    );
};
