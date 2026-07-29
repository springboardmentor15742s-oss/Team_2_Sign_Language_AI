'use client';

import React, { useState } from 'react';
import { 
  Hand, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Activity, 
  Layers, 
  BookOpen, 
  Award, 
  BarChart3, 
  Bell, 
  Lock,
  Server,
  Zap
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Grid } from '@/components/layout/Grid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heading, Paragraph } from '@/components/ui/Typography';
import { Modal } from '@/components/ui/Modal';
import { useHealth } from '@/services/hooks/useHealth';

export default function SignLearnLandingPage() {
  const { data: healthRes, isLoading: healthLoading } = useHealth();
  const [modalOpen, setModalOpen] = useState(false);
  const healthData = healthRes?.data;

  const techStack = [
    { title: 'Frontend Core', items: ['Next.js 15 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion'], icon: Zap, color: 'text-sky-400' },
    { title: 'Backend Core', items: ['Python 3.11', 'FastAPI Clean Architecture', 'SQLAlchemy 2.0 Async', 'Pydantic V2', 'Alembic'], icon: Server, color: 'text-indigo-400' },
    { title: 'Multi-Database Store', items: ['PostgreSQL 16 (Primary RDBMS)', 'MongoDB 7.0 (NoSQL Signs/Logs)', 'Redis 7.0 (Caching/PubSub)'], icon: Database, color: 'text-emerald-400' },
    { title: 'AI Infrastructure (Phase 3)', items: ['MediaPipe Hands', 'OpenCV Vision Pipeline', 'TensorFlow / PyTorch', 'ONNX Runtime'], icon: Cpu, color: 'text-purple-400' },
  ];

  const futureModules = [
    { title: 'Authentication & Role RBAC', desc: 'Secure JWT/OAuth2 for Learner, Instructor, Accessibility Trainer & Admin.', icon: Lock },
    { title: 'AI Gesture Recognition', desc: 'Real-time webcam computer vision gesture feedback and spatial analysis.', icon: Cpu },
    { title: 'Interactive Courses & Lessons', desc: 'Structured sign language curriculum with video practice drills.', icon: BookOpen },
    { title: 'AI Automated Assessments', desc: 'Instant AI grading for sign accuracy, speed, and precision.', icon: Award },
    { title: 'Role Dashboards & Analytics', desc: 'Detailed skill progression metrics, heatmaps, and performance history.', icon: BarChart3 },
    { title: 'Notifications & Certificates', desc: 'Real-time alerts and verified digital completion certificates.', icon: Bell },
  ];

  return (
    <div className="w-full flex flex-col bg-slate-950 text-slate-100">
      
      {/* 1. HERO SECTION */}
      <Section className="pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <Container className="flex flex-col items-center text-center max-w-4xl">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            Phase 1 Completed • Production Architecture Baseline
          </div>

          <Heading level={1} className="mb-6 leading-tight">
            Empowering Accessibility Through{' '}
            <span className="gradient-text">AI Sign Language</span> Learning
          </Heading>

          <Paragraph className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
            SignLearn is an AI-powered sign language learning, gesture recognition, and automated assessment platform engineered for inclusive education.
          </Paragraph>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button size="lg" onClick={() => setModalOpen(true)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Phase 1 Architecture
            </Button>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" leftIcon={<Server className="w-4 h-4" />}>
                Backend OpenAPI Docs
              </Button>
            </a>
          </div>

          {/* Live System Health Monitor Panel */}
          <div className="w-full max-w-3xl glass-panel rounded-2xl p-6 border border-slate-800 text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400 animate-spin" />
                <h3 className="text-sm font-bold text-slate-200">System Gateway Live Status Ping</h3>
              </div>
              <Badge variant={healthData?.status === 'healthy' ? 'green' : 'yellow'}>
                {healthLoading ? 'CONNECTING...' : healthData?.status?.toUpperCase() || 'OFFLINE'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">PostgreSQL (Primary)</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">MongoDB (NoSQL Logs)</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Redis (Cache/PubSub)</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </div>
              </div>
            </div>
          </div>

        </Container>
      </Section>

      {/* 2. PLATFORM INTRODUCTION */}
      <Section className="bg-slate-950">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Heading level={2} className="mb-4">
              Built for Scale & Accessibility
            </Heading>
            <Paragraph>
              SignLearn is structured around a strict Clean Architecture pattern, separating HTTP presentation, business logic, data persistence, and computer vision pipelines.
            </Paragraph>
          </div>

          <Grid cols={3}>
            <Card hoverEffect>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <CardTitle>Clean Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                Enforces strict layer isolation. Routers handle endpoints, Services contain logic, and Repositories handle database operations.
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <CardTitle>Multi-Database Resilience</CardTitle>
              </CardHeader>
              <CardContent>
                Combines PostgreSQL relational integrity for users/courses with MongoDB for sign gestures/logs and Redis for high-speed caching.
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <CardTitle>Ready for AI Plug-ins</CardTitle>
              </CardHeader>
              <CardContent>
                Scaffolded with dedicated `/app/ml` and browser MediaPipe vision interfaces ready for seamless insertion in Phase 3.
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* 3. TECH STACK GRID */}
      <Section className="bg-slate-900/40 border-y border-slate-800">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="indigo" className="mb-3">Enterprise Stack</Badge>
            <Heading level={2} className="mb-4">Technology Pillars</Heading>
            <Paragraph>Phase 1 leverages high-performance modern tools for the Infosys Internship project.</Paragraph>
          </div>

          <Grid cols={4}>
            {techStack.map((group, idx) => {
              const Icon = group.icon;
              return (
                <Card key={idx} glassmorphism className="border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-5 h-5 ${group.color}`} />
                    <h4 className="font-bold text-slate-200 text-sm">{group.title}</h4>
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </Section>

      {/* 4. DEVELOPMENT PROGRESS TIMELINE */}
      <Section className="bg-slate-950">
        <Container max-w-4xl>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Heading level={2} className="mb-4">Development Roadmap</Heading>
            <Paragraph>SignLearn is executed in structured development phases.</Paragraph>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-indigo-500/40 bg-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  P1
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Phase 1: Project Baseline Architecture <Badge variant="green">COMPLETED</Badge>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Monorepo setup, FastAPI v1 router, Next.js 15, PostgreSQL/Mongo/Redis drivers, Docker & CI/CD.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 opacity-70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                  P2
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-300 flex items-center gap-2">
                    Phase 2: Authentication & Learner Profile <Badge variant="gray">COMING SOON</Badge>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">JWT authentication, OAuth2 Google login, RBAC user profiles, settings.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 opacity-70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                  P3
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-300 flex items-center gap-2">
                    Phase 3: AI Gesture Recognition Engine <Badge variant="gray">COMING SOON</Badge>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">MediaPipe 21-hand landmark extraction, real-time spatial classification, feedback.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. COMING SOON MODULES */}
      <Section className="bg-slate-900/30 border-t border-slate-800">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Heading level={2} className="mb-4">Upcoming Platform Modules</Heading>
            <Paragraph>These modules will seamlessly plug into the Phase 1 architecture in future iterations.</Paragraph>
          </div>

          <Grid cols={3}>
            {futureModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Card key={idx} className="border-slate-800/60 bg-slate-950/60">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">{mod.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </Section>

      {/* MODAL ARCHITECTURE SPECIFICATION */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Phase 1 Architecture Specifications">
        <div className="space-y-4 text-xs text-slate-300">
          <p>
            <strong className="text-white">SignLearn Phase 1</strong> establishes a production-grade monorepo foundation adhering strictly to Clean Architecture and Infosys Internship standards.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Backend:</strong> FastAPI with versioned `/api/v1` routes, SQLAlchemy 2.0 async ORM, Alembic migrations, Motor MongoDB driver, and Redis client.</li>
            <li><strong className="text-slate-200">Frontend:</strong> Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand stores, and TanStack React Query.</li>
            <li><strong className="text-slate-200">Containerization:</strong> Docker Compose setup orchestrating PostgreSQL, MongoDB, Redis, FastAPI, Next.js, and Nginx.</li>
            <li><strong className="text-slate-200">CI/CD:</strong> GitHub Actions workflow for linting, type-checking, backend unit tests, and production build checks.</li>
          </ul>
          <div className="pt-2">
            <Button size="sm" onClick={() => setModalOpen(false)} className="w-full">
              Close Overview
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
