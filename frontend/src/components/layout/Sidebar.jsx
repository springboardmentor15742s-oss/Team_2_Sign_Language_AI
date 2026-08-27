import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, PlayCircle, Video, ClipboardCheck, BarChart3,
  FileText, Award, Trophy, User, Settings, Bell, LogOut, Hand, Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { classNames } from '../../utils/helpers';

const learnLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/courses', icon: BookOpen },
  { name: 'Lessons', path: '/courses', icon: PlayCircle },
  { name: 'Practice', path: '/practice', icon: Video },
  { name: 'Assessment', path: '/assessments', icon: ClipboardCheck },
];

const insightLinks = [
  { name: 'Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Certificates', path: '/certificates', icon: Award, disabled: true },
  { name: 'Achievements', path: '/achievements', icon: Trophy, disabled: true },
];

const accountLinks = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

function NavSection({ title, links, location }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">{title}</p>
      <div className="space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.path || (!link.disabled && location.pathname.startsWith(link.path + '/'));
          const content = (
            <span className={classNames(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              active ? 'bg-[#1b2230] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
              link.disabled && 'opacity-50 cursor-not-allowed'
            )}>
              {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#16d4d0]" />}
              <link.icon size={18} className={active ? 'text-[#16d4d0]' : 'text-slate-500'} />
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
  const { logout } = useAuth();

  return (
    <aside className="w-[282px] h-screen sticky top-0 bg-[#090d15] text-white flex flex-col border-r border-slate-800/80">
      <div className="px-5 py-5 border-b border-slate-800/70">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#13c7c4] flex items-center justify-center shadow-[0_0_28px_rgba(19,199,196,0.25)]">
            <Hand size={21} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">SignSpeak</span>
            <span className="block text-[10px] text-[#16d4d0] font-semibold tracking-wide">AI Platform</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        <NavSection title="Learn" links={learnLinks} location={location} />
        <NavSection title="Insights" links={insightLinks} location={location} />
        <NavSection title="Account" links={accountLinks} location={location} />
      </nav>

      <div className="p-4 border-t border-slate-800/70">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
