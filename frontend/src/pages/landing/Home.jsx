import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hand, BookOpen, Camera, Award, Users, ChevronRight, Sparkles,
  Shield, Zap, BrainCircuit, BarChart3, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const features = [
  { icon: BookOpen, title: 'Structured learning paths', description: 'Move from beginner fundamentals to intermediate, advanced, everyday, educational, and professional communication.' },
  { icon: Camera, title: 'Real-time gesture practice', description: 'Practice with your camera and prepare the interface for hand landmarks, pose tracking, and gesture recognition.' },
  { icon: BrainCircuit, title: 'AI feedback & correction', description: 'Surface hand-shape, motion, position, timing, and missing-component feedback in one focused practice flow.' },
  { icon: BarChart3, title: 'Progress intelligence', description: 'Track mastery, assessment performance, lesson completion, consistency, and improvement over time.' },
];

const metrics = [
  ['Gesture accuracy', '40%'],
  ['Assessment performance', '25%'],
  ['Lesson completion', '15%'],
  ['Practice consistency', '10%'],
  ['Skill improvement', '10%'],
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative bg-slate-950 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-70" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="container-page relative pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-semibold">
                <Sparkles size={14} /> AI-powered Sign Language Learning & Assessment
              </div>
              <h1 className="mt-6 text-4xl lg:text-6xl font-bold font-display leading-[1.05] tracking-tight">
                Learn. Practice. <span className="text-gradient">Improve.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base lg:text-lg text-slate-300 leading-8">
                A professional learning workspace for structured lessons, gesture practice,
                accuracy assessment, personalized feedback, and measurable skill progression.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register"><Button size="lg"><Sparkles size={17} /> Start learning <ArrowUpRight size={17} /></Button></Link>
                <Link to="/about"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Explore platform</Button></Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-400">
                {['Interactive lessons', 'AI-ready practice', 'Performance analytics'].map(item => (
                  <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" />{item}</span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .12 }} className="relative">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                <div className="rounded-[22px] bg-slate-900 border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-400" /> AI Practice</div>
                    <span className="text-[10px] text-slate-500">LIVE ANALYSIS</span>
                  </div>
                  <div className="p-5">
                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950 border border-white/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center"><Hand size={38} className="text-blue-200" /></div>
                        <p className="mt-4 text-sm font-bold">Gesture capture area</p>
                        <p className="mt-1 text-xs text-slate-500">Hand & pose tracking interface</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {['Hand shape', 'Motion', 'Position'].map((item, i) => (
                        <div key={item} className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <p className="text-[10px] text-slate-500">{item}</p><p className="mt-1 text-sm font-bold text-slate-200">—</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="container-page py-9 grid grid-cols-2 lg:grid-cols-4 gap-7">
          {[
            ['4', 'Learning levels', 'Beginner → Professional'],
            ['5', 'Core AI feedback signals', 'Shape, motion, position, timing + more'],
            ['5', 'Performance dimensions', 'Accuracy, assessments, completion, consistency, improvement'],
            ['3', 'Primary dashboard roles', 'Learner, instructor, accessibility trainer'],
          ].map(([value, title, sub]) => (
            <div key={title}><p className="text-3xl font-bold text-primary">{value}</p><p className="mt-1 text-sm font-bold text-slate-900">{title}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></div>
          ))}
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container-page">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Platform capabilities</p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-950">Everything needed for an end-to-end learning workflow.</h2>
            <p className="mt-4 text-slate-500 leading-7">The interface is organized around the project specification: learning, gesture recognition, assessment, AI correction, analytics, and certification.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06 }}>
                <Card hover className="h-full">
                  <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center"><feature.icon size={22} /></div>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="container-page grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Assessment intelligence</p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-950">Turn every practice attempt into useful feedback.</h2>
            <p className="mt-4 text-slate-500 leading-7">The assessment experience is structured around the specification's measurable dimensions, making learner progress easier to understand and improve.</p>
            <div className="mt-7 space-y-3">
              {['Hand shape accuracy', 'Motion accuracy', 'Gesture timing', 'Position accuracy', 'Overall sign accuracy'].map((item, i) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold text-primary">0{i+1}</div><span className="text-sm font-semibold text-slate-700">{item}</span><CheckCircle2 size={16} className="ml-auto text-emerald-500" /></div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-slate-950 p-6 lg:p-8 text-white shadow-soft">
            <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><BarChart3 size={19} /></div><div><p className="font-bold">Learning performance score</p><p className="text-xs text-slate-500">Weighted scoring model</p></div></div>
            <div className="mt-7 space-y-5">
              {metrics.map(([label, weight]) => <div key={label}><div className="flex justify-between text-xs mb-2"><span className="text-slate-300">{label}</span><span className="font-bold text-white">{weight}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: weight }} /></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="rounded-[30px] bg-primary p-8 lg:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold font-display">Start building your signing confidence.</h2>
              <p className="mt-3 text-blue-100 max-w-xl mx-auto">Learn through guided content, practice deliberately, and use assessment insights to decide what to improve next.</p>
              <Link to="/register" className="inline-block mt-7"><Button size="lg" className="bg-white text-primary hover:bg-slate-100">Create your account <ArrowUpRight size={17} /></Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
