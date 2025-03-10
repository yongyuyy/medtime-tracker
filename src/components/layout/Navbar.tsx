
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clock, History, BarChart3, Settings, User, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Define navigation links
  const navLinks = [
    { path: '/', label: 'Time', icon: <Clock className="w-5 h-5" /> },
    { path: '/history', label: 'History', icon: <History className="w-5 h-5" /> },
    { path: '/stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/teams', label: 'Teams', icon: <User className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight">MedTime</h1>
          </Link>

          {isAuthenticated ? (
            <>
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

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <span className="hidden sm:inline-block">{user?.name}</span>
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex items-center gap-1"
                onClick={() => navigate('/auth/login')}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => navigate('/auth/signup')}
              >
                <User className="w-4 h-4" />
                Sign Up
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => navigate('/auth/login')}
              >
                <LogIn className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
