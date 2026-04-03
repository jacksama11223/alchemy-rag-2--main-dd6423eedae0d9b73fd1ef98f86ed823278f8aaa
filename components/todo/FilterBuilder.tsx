
import React, { useState } from 'react';

interface FilterBuilderProps {
    onApplyFilter: (filters: FilterCriteria[]) => void;
    onClose: () => void;
}

export interface FilterCriteria {
    id: string;
    field: 'priority' | 'content' | 'tag';
    operator: 'contains' | 'equals' | 'gte' | 'lte';
    value: string;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({ onApplyFilter, onClose }) => {
    const [filters, setFilters] = useState<FilterCriteria[]>([
        { id: '1', field: 'content', operator: 'contains', value: '' }
    ]);

    const addRule = () => {
        setFilters([...filters, { id: Math.random().toString(), field: 'content', operator: 'contains', value: '' }]);
    };

    const removeRule = (id: string) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    const updateRule = (id: string, key: keyof FilterCriteria, val: string) => {
        setFilters(filters.map(f => f.id === id ? { ...f, [key]: val } : f));
    };

    const handleApply = () => {
        onApplyFilter(filters);
        onClose();
    };

    return (
        <div className="absolute top-14 right-0 z-50 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl p-4 w-96 animate-[fadeIn_0.2s]">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">filter_list</span>
                Bộ lọc nâng cao
            </h3>
            
            <div className="space-y-3 mb-4">
                {filters.map((filter) => (
                    <div key={filter.id} className="flex gap-2 items-center">
                        <select 
                            value={filter.field}
                            onChange={(e) => updateRule(filter.id, 'field', e.target.value)}
                            className="bg-[#262626] text-xs text-white border border-[#333] rounded p-2 focus:outline-none"
                        >
                            <option value="content">Tên</option>
                            <option value="priority">Độ ưu tiên</option>
                            <option value="tag">Thẻ (Tag)</option>
                        </select>
                        
                        <select 
                            value={filter.operator}
                            onChange={(e) => updateRule(filter.id, 'operator', e.target.value)}
                            className="bg-[#262626] text-xs text-white border border-[#333] rounded p-2 focus:outline-none w-24"
                        >
                            <option value="contains">Chứa</option>
                            <option value="equals">Bằng</option>
                        </select>

                        <input 
                            type="text" 
                            value={filter.value}
                            onChange={(e) => updateRule(filter.id, 'value', e.target.value)}
                            className="bg-[#262626] text-xs text-white border border-[#333] rounded p-2 focus:outline-none flex-1 w-20"
                            placeholder="Giá trị..."
                        />

                        <button onClick={() => removeRule(filter.id)} className="text-slate-500 hover:text-red-400">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <button onClick={addRule} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span> Thêm điều kiện
                </button>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Hủy</button>
                    <button onClick={handleApply} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">Áp dụng</button>
                </div>
            </div>
        </div>
    );
};
