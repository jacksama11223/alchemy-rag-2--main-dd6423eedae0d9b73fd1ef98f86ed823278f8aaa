
import React, { useRef } from 'react';
import { TodoTask } from '../../types';

interface ExportImportToolProps {
    tasks: TodoTask[];
    onImport: (tasks: TodoTask[]) => void;
}

export const ExportImportTool: React.FC<ExportImportToolProps> = ({ tasks, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `tasks_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    onImport(parsed);
                    alert(`Đã nhập thành công ${parsed.length} công việc.`);
                } else {
                    alert("File không hợp lệ.");
                }
            } catch (err) {
                alert("Lỗi đọc file JSON.");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };

    return (
        <div className="p-4 bg-[#262626] rounded-xl border border-[#333]">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">database</span> 
                Dữ liệu
            </h3>
            <div className="flex gap-3">
                <button 
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#333] hover:bg-[#444] rounded-lg text-slate-200 text-sm font-bold transition-colors"
                >
                    <span className="material-symbols-outlined text-base">download</span> Backup
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#333] hover:bg-[#444] rounded-lg text-slate-200 text-sm font-bold transition-colors"
                >
                    <span className="material-symbols-outlined text-base">upload</span> Restore
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
            </div>
        </div>
    );
};
