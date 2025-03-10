
import { Link, useLocation } from 'react-router-dom';
import { Clock, History, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  
  // Define navigation links
  const navLinks = [
    { path: '/', label: 'Time', icon: <Clock className="w-5 h-5" /> },
    { path: '/history', label: 'History', icon: <History className="w-5 h-5" /> },
    { path: '/stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight">MedTime</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "nav-link",
                  location.pathname === link.path && "active"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <nav className="flex md:hidden items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-all",
                  location.pathname === link.path
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                aria-label={link.label}
              >
                {link.icon}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
