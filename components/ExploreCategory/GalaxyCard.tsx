
import React from 'react';
import { EstimatedTimeBadge, RetentionForecastChart } from './EcAnalytics';
import { KnowledgeNode } from '../../types';

interface GalaxyCardProps {
    title: string;
    icon: string;
    color: string;
    onClick?: () => void;
    desc: string;
    count?: number;
    mastery?: number;
    node?: KnowledgeNode; // Need full node for analytics
}

export const GalaxyCard: React.FC<GalaxyCardProps> = ({ title, icon, color, onClick, desc, count, mastery, node }) => (
    <div 
        onClick={onClick}
        className="group relative h-64 w-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] border border-white/5 hover:border-white/20 shadow-2xl"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
        <div className="absolute inset-0 backdrop-blur-xl bg-[#0f172a]/40"></div>
        
        {/* NEW: Estimated Time Badge (Top Left) */}
        {node && (
            <div className="absolute top-4 left-4 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                <EstimatedTimeBadge node={node} />
            </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white/5 shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 relative`}>
                <span className={`material-symbols-outlined text-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}>{icon}</span>
                {/* Mastery Indicator Ring */}
                {mastery !== undefined && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke={mastery > 70 ? '#22c55e' : mastery > 30 ? '#eab308' : '#ef4444'} strokeWidth="4" strokeDasharray={`${mastery * 3}, 300`} strokeOpacity="0.8" />
                    </svg>
                )}
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase truncate w-full drop-shadow-md">{title}</h3>
            <p className="text-sm text-sky-100/80 font-medium line-clamp-1">{desc}</p>
            {count !== undefined && (
                <div className="flex gap-2 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs bg-black/30 border border-white/10 px-3 py-1 rounded-full text-sky-300 font-bold">{count} bài</span>
                    {mastery !== undefined && <span className={`text-xs px-3 py-1 rounded-full font-bold border border-white/10 ${mastery > 70 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{mastery}% Mastered</span>}
                </div>
            )}
        </div>

        {/* Hover Overlay Action with Retention Chart */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-20 pointer-events-none group-hover:pointer-events-auto p-6">
            <span className="text-white font-bold text-lg text-center px-4 line-clamp-1">{title}</span>
            
            <button 
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transform hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
                onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
            >
                <span className="material-symbols-outlined text-lg">school</span>
                Học Ngay
            </button>
            
            {/* NEW: Retention Forecast Chart (Motivation) */}
            {node && (
                <div className="w-full animate-[fadeInUp_0.3s]">
                    <RetentionForecastChart node={node} />
                </div>
            )}
        </div>
    </div>
);
