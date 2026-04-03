
import React from 'react';
import { TodoTask } from '../../types';

interface ProductivityStatsProps {
    tasks: TodoTask[];
}

export const ProductivityStats: React.FC<ProductivityStatsProps> = ({ tasks }) => {
    const completedTasks = tasks.filter(t => t.isCompleted);
    const completedCount = completedTasks.length;
    
    // Calculate simple streak (mock logic for demonstration, ideally needs date tracking)
    const today = new Date().toDateString();
    const completedToday = completedTasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length;
    
    const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">monitoring</span>
                Thống Kê Năng Suất
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#262626] rounded-lg">
                    <div className="text-2xl font-black text-white">{completedCount}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Đã xong</div>
                </div>
                <div className="p-3 bg-[#262626] rounded-lg">
                    <div className="text-2xl font-black text-green-400">{completedToday}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Hôm nay</div>
                </div>
                <div className="p-3 bg-[#262626] rounded-lg">
                    <div className="text-2xl font-black text-blue-400">{completionRate}%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Tỷ lệ</div>
                </div>
            </div>
            
            <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Mục tiêu ngày</span>
                    <span>{completedToday}/5</span>
                </div>
                <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (completedToday / 5) * 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
