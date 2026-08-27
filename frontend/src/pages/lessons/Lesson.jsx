import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { MOCK_COURSES, MOCK_LESSONS } from '../../constants/mockData';

export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const course = MOCK_COURSES.find(c => c.id === courseId) || MOCK_COURSES[0];
  const lesson = MOCK_LESSONS.find(l => l.id === lessonId) || MOCK_LESSONS[0];
  const lessonIndex = MOCK_LESSONS.findIndex(l => l.id === lessonId);
  const nextLesson = MOCK_LESSONS[lessonIndex + 1];
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Courses', path: '/courses' }, { label: course.title, path: `/course/${course.id}` }, { label: lesson.title }]} className="mb-6" />
      <Link to={`/course/${course.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to course
      </Link>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                  <Play size={28} className="text-white ml-1" />
                </div>
                <p className="text-sm font-medium text-gray-700">Lesson Video</p>
                <p className="text-xs text-gray-400 mt-1">{lesson.duration}</p>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{lesson.title}</h1>
            <p className="text-gray-600 leading-relaxed text-sm">In this lesson, you will learn the fundamental hand shapes and movements. Follow along with the video, then practice using the camera workspace.</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Practice This Lesson</h3>
            <p className="text-sm text-gray-500 mb-4">Use your camera to practice the signs from this lesson and get AI feedback.</p>
            <Link to="/practice"><Button><Play size={16} /> Open Practice Workspace</Button></Link>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Course Progress</h3>
            <div className="space-y-2">
              {MOCK_LESSONS.map((l, i) => (
                <div key={l.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${l.id === lesson.id ? 'bg-primary-50 text-primary font-medium' : 'text-gray-600'}`}>
                  {i < lessonIndex ? <CheckCircle size={14} className="text-success shrink-0" /> : i === lessonIndex ? <Play size={14} className="shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />}
                  <span className="truncate">{l.title}</span>
                </div>
              ))}
            </div>
          </Card>
          {nextLesson && (
            <Card className="bg-primary-50 border-primary-100">
              <h3 className="font-semibold text-primary mb-2">Up Next</h3>
              <p className="text-sm text-gray-600 mb-3">{nextLesson.title}</p>
              <Link to={`/lesson/${course.id}/${nextLesson.id}`}><Button size="sm" className="w-full"><ChevronRight size={14} /> Continue</Button></Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
