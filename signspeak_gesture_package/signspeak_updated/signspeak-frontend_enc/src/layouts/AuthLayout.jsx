import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Hand } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Hand size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-gradient">SignSpeak</span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
