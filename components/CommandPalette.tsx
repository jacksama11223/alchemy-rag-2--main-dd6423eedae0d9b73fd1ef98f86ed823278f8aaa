import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, LayoutDashboard, Settings, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setView } = useAppStore();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <Command
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
            <Search className="w-5 h-5 text-gray-500" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="w-full px-4 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-500"
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-medium text-gray-500 px-2 py-1">
              <Command.Item
                onSelect={() => {
                  setView('dashboard');
                  setOpen(false);
                }}
                className="flex items-center px-2 py-2 mt-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
              >
                <LayoutDashboard className="w-4 h-4 mr-2 text-gray-500" />
                Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setView('media');
                  setOpen(false);
                }}
                className="flex items-center px-2 py-2 mt-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
              >
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Notes
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setView('explore-graph');
                  setOpen(false);
                }}
                className="flex items-center px-2 py-2 mt-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
              >
                <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                Flashcards
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Settings" className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  setView('account');
                  setOpen(false);
                }}
                className="flex items-center px-2 py-2 mt-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800"
              >
                <Settings className="w-4 h-4 mr-2 text-gray-500" />
                Settings
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
