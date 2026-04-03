
import React from 'react';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
    return (
        <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <span className="material-symbols-outlined text-lg">search</span>
            </span>
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Tìm kiếm công việc..."
                className="w-full bg-[#262626] text-white border border-[#333] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm placeholder-slate-500 transition-all"
            />
            {value && (
                <button 
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            )}
        </div>
    );
};
