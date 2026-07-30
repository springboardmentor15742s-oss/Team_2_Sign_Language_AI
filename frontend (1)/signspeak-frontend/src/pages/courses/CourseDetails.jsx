import { useParams, Link } from 'react-router-dom';
import { Clock, BookOpen, BarChart3, Play, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LessonCard } from '../../components/cards/LessonCard';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { MOCK_COURSES, MOCK_LESSONS } from '../../constants/mockData';

export default function CourseDetails() {
  const { id } = useParams();
  const course = MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Courses', path: '/courses' }, { label: course.title }]} className="mb-6" />
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to courses
      </Link>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-8">
        <div className="relative h-56 lg:h-72">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge variant="primary" className="mb-3">{course.difficulty}</Badge>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessonsCount} lessons</span>
              <span className="flex items-center gap-1"><BarChart3 size={14} /> {course.difficulty}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link to={`/lesson/${course.id}/l1`}><Button><Play size={16} /> Start Course</Button></Link>
            <Button variant="outline"><BookOpen size={16} /> View Syllabus</Button>
          </div>
        </div>
      </div>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Lessons</h3>
        <div className="space-y-3">
          {MOCK_LESSONS.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} isLocked={i > 0} onClick={() => {}} />
          ))}
        </div>
      </Card>
    </div>
  );
}
