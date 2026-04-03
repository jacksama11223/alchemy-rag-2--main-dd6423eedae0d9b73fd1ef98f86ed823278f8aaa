import React from 'react';

// 1. Survival Probability
export const SurvivalProbability: React.FC<{ weakNodes: number }> = ({ weakNodes }) => {
    const prob = Math.max(0, 100 - weakNodes * 2);
    const color = prob > 80 ? 'text-green-400' : prob > 50 ? 'text-yellow-400' : 'text-red-400';
    
    return (
        <div className="bg-black/30 p-3 rounded-lg border border-white/10 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Khả năng qua môn</p>
            <p className={`text-2xl font-black ${color}`}>{prob}%</p>
        </div>
    );
};

// 2. Learning Velocity
export const LearningVelocity: React.FC = () => (
    <div className="bg-black/30 p-3 rounded-lg border border-white/10 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tốc độ nạp</p>
        <p className="text-xl font-bold text-blue-400">12 <span className="text-xs font-normal text-slate-500">node/phút</span></p>
    </div>
);

// 3. Topic Heatmap (Simplified)
export const TopicHeatmapWidget: React.FC = () => (
    <div className="flex gap-1 h-2 w-full rounded overflow-hidden mt-2">
        <div className="bg-red-500 w-[40%]" title="Rất yếu"></div>
        <div className="bg-yellow-500 w-[30%]" title="Trung bình"></div>
        <div className="bg-green-500 w-[30%]" title="Tốt"></div>
    </div>
);
