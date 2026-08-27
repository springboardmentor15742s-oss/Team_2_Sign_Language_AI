import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Search, Menu, Command, ChevronDown, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { notificationService } from '../../services/notificationService';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    let active = true;
    if (!user) return undefined;
    notificationService.getNotifications()
      .then(({ data }) => {
        if (active) setUnread(Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user]);

  return (
    <header className="h-[72px] bg-[#0b1018]/95 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-7 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1">
        {isMobile && <button onClick={onMenuClick} className="p-2 rounded-xl hover:bg-white/5 text-slate-400"><Menu size={20} /></button>}
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#141a24] px-3 py-2 shadow-sm">
            <Search size={16} className="text-slate-500" />
            <input autoFocus type="text" placeholder="Search courses, lessons, signs..." className="w-48 lg:w-96 bg-transparent text-sm outline-none text-slate-200 placeholder:text-slate-500" onBlur={() => setSearchOpen(false)} />
            <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5"><Command size={10} /> K</kbd>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-3 w-full max-w-[480px] rounded-xl border border-slate-800 bg-[#141a22] px-3 py-2.5 text-sm text-slate-500 hover:border-slate-700 transition-colors">
            <Search size={17} /><span className="flex-1 text-left">Search courses, lessons, signs...</span><Command size={13} className="hidden sm:block" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button className="hidden sm:flex items-center gap-2 rounded-xl bg-[#073b3c]/70 border border-[#0b6d6b]/60 text-[#42e1dc] px-4 py-2 text-sm font-semibold"><Sparkles size={16} /> AI Assistant</button>
        <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400"><Sun size={18} /></button>
        <Link to="/notifications" className="relative p-2.5 rounded-xl hover:bg-white/5 text-slate-400">
          <Bell size={18} />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#14c9c5] text-[9px] text-slate-950 font-bold flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
        </Link>
        <Link to="/profile" className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-xl hover:bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">{(user?.full_name || user?.name || 'AI').slice(0, 2).toUpperCase()}</div>
          <span className="hidden sm:block text-sm font-semibold text-slate-200">{user?.full_name || user?.name || 'Learner'}</span>
          <ChevronDown size={14} className="hidden sm:block text-slate-500" />
        </Link>
      </div>
    </header>
  );
}
