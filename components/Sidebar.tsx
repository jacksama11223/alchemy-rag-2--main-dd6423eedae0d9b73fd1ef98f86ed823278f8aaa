import { useState } from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { useAppStore } from '../store/useAppStore';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Folder,
  Menu
} from 'lucide-react';

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();
  const { view, setView } = useAppStore();
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);

  const handleNavigation = (targetView: string) => {
    setView(targetView as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex items-center justify-between h-12 px-4 border-b border-gray-200 dark:border-gray-800">
        {isSidebarOpen && <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Menu</span>}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-2 space-y-1 mt-4">
        <button 
          onClick={() => handleNavigation('dashboard')}
          className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
            view === 'dashboard' 
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
        </button>

        {/* Collapsible Folder Example */}
        <div>
          <button 
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center">
              <Folder className="w-5 h-5 flex-shrink-0 text-gray-400" />
              {isSidebarOpen && <span className="ml-3 font-medium">My Notes</span>}
            </div>
            {isSidebarOpen && (
              isNotesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isSidebarOpen && isNotesExpanded && (
            <div className="mt-1 ml-6 space-y-1 border-l border-gray-200 dark:border-gray-800 pl-2">
              <button 
                onClick={() => handleNavigation('media')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                  view === 'media' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                All Notes
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => handleNavigation('explore-graph')}
          className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
            view === 'explore-graph' 
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-medium">Flashcards</span>}
        </button>
      </nav>
    </aside>
  );
}
