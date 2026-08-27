import { Link } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const difficultyColors = { beginner: 'success', intermediate: 'warning', advanced: 'danger' };
const fallbackImages = { beginner: '/course-art/alphabet.svg', intermediate: '/course-art/vocabulary.svg', advanced: '/course-art/advanced.svg' };

export function CourseCard({ course, enrolled = false, progress = 0, onEnroll, enrolling = false }) {
  const image = course.thumbnail_url || fallbackImages[course.level] || fallbackImages.beginner;
  const level = course.level || 'beginner';
  return (
    <Card hover className="h-full flex flex-col overflow-hidden !bg-[#151a24] !border-slate-800">
      <div className="relative h-44 -mx-5 -mt-5 mb-5 overflow-hidden">
        <img src={image} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1018]/80 to-transparent" />
        <div className="absolute top-3 left-3"><Badge variant={difficultyColors[level] || 'gray'}>{level[0].toUpperCase()+level.slice(1)}</Badge></div>
        {enrolled && <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white"><CheckCircle2 size={13}/> Enrolled</div>}
      </div>
      <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
      <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{course.description || 'Build practical sign language skills through structured lessons.'}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4"><span className="flex items-center gap-1"><Clock size={14}/> {course.duration_minutes || 0} min</span><span className="flex items-center gap-1"><BookOpen size={14}/> Course lessons</span></div>
      {enrolled && <div className="mb-4"><div className="flex justify-between text-xs mb-1.5"><span className="text-slate-500">Progress</span><span className="font-bold text-slate-300">{progress}%</span></div><div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-[#16c8c4]" style={{width:`${progress}%`}}/></div></div>}
      {enrolled ? <Link to={`/course/${course.id}`} className="block w-full text-center py-2.5 text-sm font-semibold text-[#071316] bg-[#16c8c4] rounded-xl hover:bg-[#20d8d3] transition-colors">Continue Learning</Link> : <button onClick={onEnroll} disabled={enrolling} className="w-full py-2.5 text-sm font-semibold text-[#071316] bg-[#16c8c4] rounded-xl hover:bg-[#20d8d3] disabled:opacity-50 transition-colors">{enrolling ? 'Enrolling…' : 'Enroll in Course'}</button>}
    </Card>
  );
}
