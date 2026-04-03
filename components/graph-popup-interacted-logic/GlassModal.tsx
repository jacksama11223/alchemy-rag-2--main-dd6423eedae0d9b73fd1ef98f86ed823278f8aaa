import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: string;
    color: string;
    children: React.ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({ isOpen, onClose, title, icon, color, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[45] flex items-center justify-center pointer-events-auto"
                >
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-11/12 max-w-5xl h-[80vh] bg-[#0f172a]/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className={`material-symbols-outlined text-3xl ${color}`}>
                                    {icon}
                                </span>
                                {title}
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
