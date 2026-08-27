import { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { CourseCard } from '../../components/cards/CourseCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { courseService } from '../../services/courseService';
import { useToast } from '../../hooks/useToast';
import { COURSE_CATEGORIES, DIFFICULTY_LEVELS } from '../../constants/navigation';

export default function Courses() {
  const [tab, setTab] = useState('catalogue');
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    const [all, mine] = await Promise.allSettled([courseService.getCourses(), courseService.getEnrolled()]);
    if (all.status === 'fulfilled') setCourses(all.value.data || []);
    if (mine.status === 'fulfilled') setEnrolled(mine.value.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const enrolledMap = useMemo(() => new Map(enrolled.map(e => [e.course.id, e])), [enrolled]);
  const filtered = courses.filter(c => {
    const hay = `${c.title} ${c.description || ''}`.toLowerCase();
    const matchesSearch = hay.includes(search.toLowerCase());
    const matchesCategory = category === 'all' || String(c.category_id || '') === category;
    const matchesDifficulty = difficulty === 'all' || c.level === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleEnroll = async (id) => {
    setEnrollingId(id);
    try { await courseService.enroll(id); addToast('Course enrolled successfully', 'success'); await load(); setTab('enrolled'); }
    catch (e) { addToast(e.response?.data?.detail || 'Unable to enroll in this course', 'error'); }
    finally { setEnrollingId(null); }
  };

  return <div className="max-w-[1400px] mx-auto space-y-6">
    <Breadcrumb items={[{ label: 'Courses' }]} />
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-[#20d8d3]">Learning Path</p><h1 className="text-3xl font-bold text-white mt-1">Sign Language Courses</h1><p className="text-sm text-slate-400 mt-2">Enroll in structured pathways and track your progress.</p></div>
      <div className="flex rounded-xl border border-slate-800 bg-[#11161f] p-1"><button onClick={()=>setTab('catalogue')} className={`px-4 py-2 text-sm rounded-lg ${tab==='catalogue'?'bg-[#16c8c4] text-slate-950 font-bold':'text-slate-400'}`}>All Courses</button><button onClick={()=>setTab('enrolled')} className={`px-4 py-2 text-sm rounded-lg ${tab==='enrolled'?'bg-[#16c8c4] text-slate-950 font-bold':'text-slate-400'}`}>My Enrolled Courses ({enrolled.length})</button></div>
    </div>
    {tab==='catalogue' && <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-[#11161f] text-sm text-white placeholder:text-slate-600 focus:border-[#16c8c4] focus:outline-none"/></div><Select value={category} onChange={e=>setCategory(e.target.value)} options={COURSE_CATEGORIES} className="sm:w-48"/><Select value={difficulty} onChange={e=>setDifficulty(e.target.value)} options={DIFFICULTY_LEVELS} className="sm:w-40"/></div>}
    {loading ? <div className="py-20 text-center text-slate-500"><Loader2 className="animate-spin mx-auto"/> <p className="mt-3 text-sm">Loading your learning data…</p></div> : tab==='enrolled' ? (enrolled.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{enrolled.map(e=><CourseCard key={e.enrollment_id} course={e.course} enrolled progress={e.progress_percent}/>)}</div> : <EmptyState icon={GraduationCap} title="No enrolled courses yet" description="Explore the catalogue and enroll in your first structured learning path." action={<button onClick={()=>setTab('catalogue')} className="px-4 py-2 rounded-xl bg-[#16c8c4] text-slate-950 font-semibold">Browse Courses</button>}/>) : (filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(c=><CourseCard key={c.id} course={c} enrolled={enrolledMap.has(c.id)} progress={enrolledMap.get(c.id)?.progress_percent || 0} onEnroll={()=>handleEnroll(c.id)} enrolling={enrollingId===c.id}/>)}</div> : <EmptyState icon={Search} title="No courses found" description="Try adjusting your search or filters."/>)}
  </div>;
}
