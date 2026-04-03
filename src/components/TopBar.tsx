import { useState, useEffect } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';
import { Bell, Search, LogOut } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export function TopBar() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time notifications
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    // In a real app, you would also call an API to update the backend
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <Breadcrumbs />
      </div>

      <div className="flex items-center space-x-4">
        <button 
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md transition-colors"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search className="w-4 h-4 mr-2" />
          Quick Search
          <kbd className="ml-2 px-1.5 py-0.5 text-xs font-sans bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
            ⌘K
          </kbd>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                      <span className="text-xs text-gray-500 mt-1 block">Just now</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />
        
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
