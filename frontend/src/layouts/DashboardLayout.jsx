import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <div className="min-h-screen bg-surface text-slate-100 flex">
      {!isMobile && <Sidebar />}

      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 h-full bg-[#090d15] shadow-2xl">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-7 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
