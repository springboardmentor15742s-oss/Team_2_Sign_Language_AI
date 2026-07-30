import { useState } from 'react';
import { Search } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { CourseCard } from '../../components/cards/CourseCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { MOCK_COURSES } from '../../constants/mockData';
import { COURSE_CATEGORIES, DIFFICULTY_LEVELS } from '../../constants/navigation';

export default function Courses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const filtered = MOCK_COURSES.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || c.category === category;
    const matchesDifficulty = difficulty === 'all' || c.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Courses' }]} className="mb-6" />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Catalogue</h1>
          <p className="text-sm text-gray-500 mt-1">Explore our sign language courses</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none" />
        </div>
        <Select value={category} onChange={e => setCategory(e.target.value)} options={COURSE_CATEGORIES} className="sm:w-48" />
        <Select value={difficulty} onChange={e => setDifficulty(e.target.value)} options={DIFFICULTY_LEVELS} className="sm:w-40" />
      </div>
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      ) : (
        <EmptyState icon={Search} title="No courses found" description="Try adjusting your search or filters." />
      )}
    </div>
  );
}
