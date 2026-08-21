import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, PlayCircle, Video, ClipboardCheck, BarChart3,
  FileText, Award, Trophy, User, Settings, Bell, LogOut, Hand, Cpu, Users, ShieldCheck, Compass
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

// Learner Navigation Links
const learnerLearnLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/courses', icon: BookOpen },
  { name: 'Practice', path: '/practice', icon: Video },
  { name: 'Assessments', path: '/assessments', icon: ClipboardCheck },
];

const learnerInsightLinks = [
  { name: 'Analytics & Reports', path: '/reports', icon: BarChart3 },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
];

const learnerAccountLinks = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

// Administrator Navigation Links
const adminManagementLinks = [
  { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Users & Learners', path: '/admin/users', icon: Users },
  { name: 'Model Evaluation', path: '/admin/model-evaluation', icon: Cpu },
];

const adminPlatformLinks = [
  { name: 'Platform Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Switch to Learner View', path: '/dashboard', icon: Compass },
];

const adminAccountLinks = [
  { name: 'Admin Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

function NavSection({ title, links, location, isAdmin = false }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">{title}</p>
      <div className="space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.path || (!link.disabled && link.path !== '/' && link.path !== '/admin' && location.pathname.startsWith(link.path + '/')) || (link.path === '/admin' && location.pathname === '/admin');
          const accentColor = isAdmin ? 'bg-[#7c6cf2]' : 'bg-[#16d4d0]';
          const iconColor = isAdmin ? (active ? 'text-[#a78bfa]' : 'text-slate-500') : (active ? 'text-[#16d4d0]' : 'text-slate-500');

          const content = (
            <span className={classNames(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              active ? 'bg-[#1b2230] text-white font-semibold' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
              link.disabled && 'opacity-50 cursor-not-allowed'
            )}>
              {active && <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${accentColor}`} />}
              <link.icon size={18} className={iconColor} />
              <span>{link.name}</span>
              {link.disabled && <span className="ml-auto text-[9px] uppercase tracking-wider text-slate-600">Soon</span>}
            </span>
          );
          return link.disabled ? <div key={link.name}>{content}</div> : <Link key={link.name} to={link.path}>{content}</Link>;
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isStaffOrAdmin = ['admin', 'instructor', 'accessibility_trainer'].includes(user?.role);

  return (
    <aside className="w-[282px] h-screen sticky top-0 bg-[#090d15] text-white flex flex-col border-r border-slate-800/80 shrink-0">
      <div className="px-5 py-5 border-b border-slate-800/70">
        <Link to={isStaffOrAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isStaffOrAdmin
              ? 'bg-violet-600 shadow-[0_0_28px_rgba(124,108,242,0.35)]'
              : 'bg-[#13c7c4] shadow-[0_0_28px_rgba(19,199,196,0.25)]'
          }`}>
            {isStaffOrAdmin ? <ShieldCheck size={22} className="text-white" /> : <Hand size={21} className="text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight">SignSpeak</span>
              {isStaffOrAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <span className={`block text-[10px] font-semibold tracking-wide ${
              isStaffOrAdmin ? 'text-violet-400' : 'text-[#16d4d0]'
            }`}>
              {isStaffOrAdmin ? 'Administration Console' : 'AI Learning Platform'}
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        {isStaffOrAdmin ? (
          <>
            <NavSection title="Management" links={adminManagementLinks} location={location} isAdmin={true} />
            <NavSection title="Platform" links={adminPlatformLinks} location={location} isAdmin={true} />
            <NavSection title="Account" links={adminAccountLinks} location={location} isAdmin={true} />
          </>
        ) : (
          <>
            <NavSection title="Learn" links={learnerLearnLinks} location={location} />
            <NavSection title="Insights" links={learnerInsightLinks} location={location} />
            <NavSection title="Account" links={learnerAccountLinks} location={location} />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800/70">
        <div className="flex items-center justify-between px-2 mb-3 text-xs text-slate-400">
          <span className="truncate max-w-[140px] font-medium text-slate-300">{user?.full_name || 'User'}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 capitalize">
            {user?.role === 'student' ? 'Learner' : user?.role || 'Guest'}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
