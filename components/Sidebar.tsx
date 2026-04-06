import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '../store/useLayoutStore';
import { useAppStore } from '../store/useAppStore';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Menu,
  X,
  ChevronRight,
  Folder,
  ArrowRight
} from 'lucide-react';

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();
  const { view, setView } = useAppStore();
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);

  const handleNavigation = (targetView: string) => {
    setView(targetView as any);
    toggleSidebar(); // Close menu on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, color: 'text-sky-400' },
    { id: 'adaptive-learning', label: 'Lộ trình Thích ứng', icon: LayoutDashboard, color: 'text-rose-400' },
    { id: 'digest', label: 'Lộ trình & Tiến độ', icon: LayoutDashboard, color: 'text-teal-400' },
    { id: 'media', label: 'Ghi chú tri thức', icon: FileText, color: 'text-amber-400' },
    { id: 'explore-graph', label: 'Sơ đồ Flashcard', icon: BookOpen, color: 'text-emerald-400' },
  ];

  return (
    <>
      {/* 1. FLOATING HAMBURGER TRIGGER (The "Faded" icon) */}
      <div className="fixed top-6 left-6 z-[400]">
        <motion.button
          whileHover={{ scale: 1.1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className={`p-3 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white transition-all shadow-2xl ${
            isSidebarOpen ? 'opacity-0' : 'opacity-40 hover:opacity-100 hover:border-white/30'
          }`}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </div>

      {/* 2. OVERLAY MENU */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Blur Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[500]"
            />

            {/* Sliding Sidebar Panel */}
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-[#0f172a]/95 backdrop-blur-2xl border-r border-white/10 z-[550] shadow-[10px_0_40px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">navigation</span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tighter uppercase">Menu</h2>
                </div>
                <button 
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-6 space-y-4 pt-10">
                <div className="px-3 mb-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hệ thống chính</p>
                </div>
                
                {menuItems.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full group flex items-center justify-between px-4 py-4 rounded-3xl transition-all duration-300 ${
                      view === item.id 
                        ? 'bg-gradient-to-r from-white/10 to-transparent border border-white/10 shadow-lg' 
                        : 'hover:bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-all ${view === item.id ? 'bg-cyan-500/20 ' + item.color : 'bg-white/5'}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className={`font-bold text-sm tracking-tight ${view === item.id ? 'text-white' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                    {view === item.id && (
                      <motion.div layoutId="active-indicator">
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                      </motion.div>
                    )}
                  </button>
                ))}

                <div className="h-px bg-white/5 my-8"></div>

                {/* Sub Features / Folders */}
                <div className="px-3 space-y-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tiện ích mở rộng</p>
                   <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white transition-colors group">
                      <Folder className="w-4 h-4" />
                      <span className="text-xs font-bold tracking-tight">Thư viện Alchemy</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-8 border-t border-white/5 opacity-50">
                 <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
                    LearnAI Global Navigation
                 </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
