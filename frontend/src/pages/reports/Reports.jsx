import { useState } from 'react';
import { BarChart3, TrendingUp, Target, Download, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';

const timeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Reports' }]} className="mb-6" />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Track your progress and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onChange={e => setTimeRange(e.target.value)} options={timeOptions} className="w-40" />
          <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Lessons Completed</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><BarChart3 size={20} className="text-primary" /></div></div></Card>
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Practice Sessions</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center"><Target size={20} className="text-success" /></div></div></Card>
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Avg. Accuracy</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center"><TrendingUp size={20} className="text-warning" /></div></div></Card>
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Learning Time</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Calendar size={20} className="text-primary" /></div></div></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Learning Activity</h3>
          <EmptyState icon={TrendingUp} title="No data yet" description="Your activity chart will appear once you start learning." />
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Accuracy by Category</h3>
          <EmptyState icon={Target} title="No data yet" description="Practice more to see accuracy breakdowns." />
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Detailed Report</h3>
        <EmptyState icon={BarChart3} title="No report data" description="Complete lessons and assessments to generate detailed reports." />
      </Card>
    </div>
  );
}
