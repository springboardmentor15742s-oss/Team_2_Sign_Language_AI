'use client';

import React from 'react';
import Link from 'next/link';
import { Hand, Terminal, Activity } from 'lucide-react';
import { Container } from '../layout/Container';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../common/ThemeToggle';
import { useHealth } from '@/services/hooks/useHealth';

export const Navbar: React.FC = () => {
  const { data: healthRes } = useHealth();
  const healthData = healthRes?.data;
  const isHealthy = healthData?.status === 'healthy';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Hand className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              SignLearn <span className="text-indigo-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide">Phase 1 Monorepo</span>
          </div>
        </Link>

        {/* Status Indicator & Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-slate-300">API Gateway:</span>
            <Badge variant={isHealthy ? 'green' : 'yellow'}>
              {isHealthy ? 'ONLINE' : 'DEGRADED'}
            </Badge>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            Swagger OpenAPI
          </a>

          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
};
