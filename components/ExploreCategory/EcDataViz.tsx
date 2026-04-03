
import React from 'react';

// 16. TimelineHorizon
export const TimelineHorizon: React.FC = () => (
    <div className="w-full overflow-x-auto py-4 bg-[#0f172a]/50 border-y border-white/5 scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex items-center min-w-[800px] px-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700"></div>
            {[1990, 2000, 2010, 2020, 2024].map((year, i) => (
                <div key={year} className="relative flex flex-col items-center flex-1 group cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-slate-500 group-hover:bg-cyan-400 group-hover:scale-125 transition-all z-10"></div>
                    <span className="mt-2 text-xs text-slate-500 font-mono group-hover:text-cyan-300">{year}</span>
                    {i === 2 && (
                        <div className="absolute bottom-8 bg-cyan-900/80 text-cyan-100 px-2 py-1 rounded text-[10px] border border-cyan-500/30 whitespace-nowrap">
                            Sự kiện quan trọng
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// 17. RadarChartSkill
export const RadarChartSkill: React.FC = () => (
    <div className="bg-[#1e293b] p-4 rounded-xl border border-white/10 w-full aspect-square flex items-center justify-center relative">
        <h4 className="absolute top-2 left-3 text-xs font-bold text-slate-400 uppercase">Skill Radar</h4>
        {/* Simplified visual representation using SVG */}
        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 overflow-visible">
            <polygon points="50,10 90,40 70,90 30,90 10,40" fill="none" stroke="#334155" strokeWidth="1" />
            <polygon points="50,20 80,45 65,80 35,80 20,45" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="2" />
            <text x="50" y="5" fontSize="6" textAnchor="middle" fill="#94a3b8">Code</text>
            <text x="95" y="40" fontSize="6" fill="#94a3b8">Design</text>
            <text x="75" y="98" fontSize="6" textAnchor="middle" fill="#94a3b8">Manage</text>
            <text x="25" y="98" fontSize="6" textAnchor="middle" fill="#94a3b8">Writing</text>
            <text x="0" y="40" fontSize="6" textAnchor="end" fill="#94a3b8">Logic</text>
        </svg>
    </div>
);

// 18. SankeyFlowDiagram
export const SankeyFlowDiagram: React.FC = () => (
    <div className="h-32 flex items-center justify-between px-4 bg-[#1e293b] rounded-xl border border-white/10 my-4">
        <div className="bg-blue-900/30 px-3 py-1 rounded text-xs text-blue-200 border border-blue-500/30">Nguồn A</div>
        <div className="flex-1 h-full mx-2 relative opacity-30">
            <svg className="w-full h-full" preserveAspectRatio="none">
                <path d="M0,50 C100,50 100,20 200,20" stroke="url(#grad1)" strokeWidth="20" fill="none" />
                <path d="M0,50 C100,50 100,80 200,80" stroke="url(#grad2)" strokeWidth="10" fill="none" />
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <div className="flex flex-col gap-4">
            <div className="bg-purple-900/30 px-3 py-1 rounded text-xs text-purple-200 border border-purple-500/30">Kết quả 1</div>
            <div className="bg-teal-900/30 px-3 py-1 rounded text-xs text-teal-200 border border-teal-500/30">Kết quả 2</div>
        </div>
    </div>
);

// 19. SnippetDiffViewer
export const SnippetDiffViewer: React.FC = () => (
    <div className="grid grid-cols-2 gap-0 border border-white/10 rounded-lg overflow-hidden font-mono text-[10px] bg-[#0d1117]">
        <div className="p-2 border-r border-white/5 bg-red-900/10">
            <div className="text-red-400">- const oldVal = 1;</div>
            <div className="text-slate-500">  console.log(oldVal);</div>
        </div>
        <div className="p-2 bg-green-900/10">
            <div className="text-green-400">+ const newVal = 2;</div>
            <div className="text-slate-500">  console.log(newVal);</div>
        </div>
    </div>
);

// 20. MapCoordinatePin
export const MapCoordinatePin: React.FC<{ location: string }> = ({ location }) => (
    <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-[10px] text-white hover:bg-white/20 cursor-pointer border border-white/10">
        <span className="material-symbols-outlined text-red-400 text-xs">pin_drop</span>
        {location}
    </div>
);
