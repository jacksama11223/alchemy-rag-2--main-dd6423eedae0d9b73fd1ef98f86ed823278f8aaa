import React, { useState, useEffect } from 'react';

export const AdminContent: React.FC = () => {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s]">
            <div>
                <h2 className="text-2xl font-bold text-white">Quản Lý Nội Dung</h2>
                <p className="text-slate-400 text-xs">Quản lý các bài học, nodes, và files của người dùng.</p>
            </div>
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-30">inventory_2</span>
                <h3 className="text-lg font-bold text-white mb-2">Tính năng đang được phát triển</h3>
                <p>Module quản lý nội dung sẽ sớm ra mắt trong phiên bản tiếp theo.</p>
            </div>
        </div>
    );
};
