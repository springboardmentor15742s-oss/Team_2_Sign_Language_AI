import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
        )}
        {searchOpen ? (
          <div className="flex items-center">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Search size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </Link>
        <Link to="/profile" className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {user?.name || 'Learner'}
          </span>
        </Link>
      </div>
    </header>
  );
}
