'use client';

import React from 'react';
import { Home, Layers, Database, ShieldAlert, Cpu, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const items = [
    { label: 'Architecture Overview', icon: Layers, active: true },
    { label: 'Database Drivers', icon: Database, active: false },
    { label: 'Auth Scaffold', icon: ShieldAlert, active: false },
    { label: 'AI Model Integration', icon: Cpu, active: false },
    { label: 'Documentation', icon: BookOpen, active: false },
  ];

  return (
    <aside className="w-64 h-full bg-slate-950 border-r border-slate-800 p-4 hidden lg:block">
      <div className="space-y-1">
        <h4 className="px-3 text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Platform Foundation</h4>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                item.active
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
