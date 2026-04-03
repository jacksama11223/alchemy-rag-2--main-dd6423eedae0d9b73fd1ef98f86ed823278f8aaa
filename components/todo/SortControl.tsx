
import React from 'react';

export type SortOption = 'date' | 'priority' | 'alpha';

interface SortControlProps {
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
}

export const SortControl: React.FC<SortControlProps> = ({ sortOption, onSortChange }) => {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp xếp:</span>
            <select 
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-[#262626] text-slate-300 text-xs border border-[#333] rounded px-2 py-1 focus:outline-none cursor-pointer hover:bg-[#333]"
            >
                <option value="date">Ngày hết hạn</option>
                <option value="priority">Độ ưu tiên</option>
                <option value="alpha">Tên (A-Z)</option>
            </select>
        </div>
    );
};
