import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Hand, ClipboardCheck, BarChart3,
  Bell, Settings, HelpCircle, Hand as HandIcon, LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

const mainLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/courses', icon: BookOpen },
  { name: 'Practice', path: '/practice', icon: Hand },
  { name: 'Assessments', path: '/assessments', icon: ClipboardCheck },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

const secondaryLinks = [
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help', path: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <HandIcon size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold font-display text-gradient">SignSpeak</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="pb-2">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          {mainLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(link.path)
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Support</p>
          {secondaryLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(link.path)
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-danger-50 hover:text-danger transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
