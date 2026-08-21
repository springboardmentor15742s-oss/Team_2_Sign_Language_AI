import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hand, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/#features' },
  { name: 'Courses', path: '/courses' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isStaffOrAdmin = ['admin', 'instructor', 'accessibility_trainer'].includes(user?.role);

  return (
    <nav className="sticky top-0 z-50 bg-[#070913]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="container-page">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20d8d3] to-[#06b6d4] flex items-center justify-center shadow-[0_0_25px_rgba(32,216,211,0.45)] group-hover:scale-105 transition-transform">
              <Hand size={22} className="text-[#070913] stroke-[2.5]" />
            </div>
            <span className="text-2xl font-bold font-display text-white tracking-tight">
              SignSpeak
            </span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {publicLinks.map(link => {
              const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={classNames(
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[#20d8d3] font-semibold drop-shadow-[0_0_8px_rgba(32,216,211,0.4)]'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              isStaffOrAdmin ? (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/admin"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-violet-600 rounded-full hover:bg-violet-500 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(124,108,242,0.35)]"
                  >
                    <ShieldCheck size={15} /> Admin Console
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/70 rounded-full hover:bg-slate-800 transition-all"
                  >
                    Learner View
                  </Link>
                </div>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-[#20d8d3] rounded-full hover:bg-[#1bbdb8] transition-all shadow-[0_0_25px_rgba(32,216,211,0.35)] flex items-center gap-1.5"
                >
                  <LayoutDashboard size={16} /> Learner Dashboard
                </Link>
              )
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-200 text-sm font-medium hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#20d8d3] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:opacity-95 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070913]">
          <div className="px-4 py-4 space-y-2">
            {publicLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-800 mt-2 space-y-2.5">
              {isAuthenticated ? (
                isStaffOrAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 text-center text-sm font-semibold text-white bg-violet-600 rounded-xl"
                    >
                      Admin Console
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 text-center text-sm font-medium text-slate-300 border border-slate-800 rounded-xl"
                    >
                      Learner View
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-center text-sm font-bold text-slate-950 bg-[#20d8d3] rounded-xl"
                  >
                    Learner Dashboard
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-center text-sm font-medium text-slate-300 border border-slate-700 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#20d8d3] to-[#8b5cf6] rounded-xl"
                  >
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
