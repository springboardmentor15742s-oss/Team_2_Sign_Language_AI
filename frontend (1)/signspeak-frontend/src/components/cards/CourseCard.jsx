import { Link } from 'react-router-dom';
import { Clock, BookOpen, BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export function CourseCard({ course }) {
  return (
    <Card hover className="h-full flex flex-col overflow-hidden">
      <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={difficultyColors[course.difficulty] || 'gray'}>
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </Badge>
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{course.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
        <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessonsCount} lessons</span>
      </div>
      <Link
        to={`/course/${course.id}`}
        className="block w-full text-center py-2.5 text-sm font-semibold text-primary bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
      >
        View Course
      </Link>
    </Card>
  );
}
