import { Outlet, Link } from 'react-router-dom';
import { Hand } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_25px_rgba(20,201,197,0.3)]">
              <Hand size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-gradient">SignSpeak</span>
          </Link>
        </div>
        <div className="w-full flex justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
