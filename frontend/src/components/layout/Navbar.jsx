import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hand } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Hand size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold font-display text-gradient">SignSpeak</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={classNames(
                  'text-sm font-medium transition-colors',
                  location.pathname === link.path ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-600 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-600 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2 space-y-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-center text-sm font-medium text-white bg-primary rounded-xl"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-xl">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-center text-sm font-medium text-white bg-primary rounded-xl">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
