import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are at the root, don't show breadcrumbs
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
      <Link to="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        // Format the name (e.g., "flashcards" -> "Flashcards")
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return (
          <div key={name} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 dark:text-gray-100" aria-current="page">
                {formattedName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-gray-900 dark:hover:text-gray-100">
                {formattedName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
