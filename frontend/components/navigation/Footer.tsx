import React from 'react';
import { Container } from '../layout/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-8">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-xs text-slate-400 font-medium">
            SignLearn AI - Sign Language Learning & Assessment Platform
          </p>
          <p className="text-[11px] text-slate-500">
            Developed for <span className="text-indigo-400 font-semibold">Infosys Internship Program</span> (Phase 1 Baseline Architecture)
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>FastAPI</span>
          <span>Next.js 15</span>
          <span>PostgreSQL</span>
          <span>MongoDB</span>
          <span>Redis</span>
          <span>Docker</span>
        </div>
      </Container>
    </footer>
  );
};
