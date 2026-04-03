
import React from 'react';
import { RecurrenceType } from '../../types';

interface RecurringTaskConfigProps {
    recurrence: RecurrenceType;
    onChange: (type: RecurrenceType) => void;
}

export const RecurringTaskConfig: React.FC<RecurringTaskConfigProps> = ({ recurrence, onChange }) => {
    return (
        <div className="flex items-center gap-2 bg-[#262626] p-2 rounded-lg border border-[#333]">
            <span className="material-symbols-outlined text-slate-400 text-sm">repeat</span>
            <select 
                value={recurrence || 'none'}
                onChange={(e) => onChange(e.target.value as RecurrenceType)}
                className="bg-transparent text-xs text-slate-200 border-none outline-none focus:ring-0 cursor-pointer w-full"
            >
                <option value="none">Không lặp lại</option>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
            </select>
        </div>
    );
};
