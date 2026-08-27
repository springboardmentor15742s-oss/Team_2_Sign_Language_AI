import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Admin' }]} className="mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Users size={20} className="text-primary" /></div></div></Card>
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Active Courses</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center"><BookOpen size={20} className="text-success" /></div></div></Card>
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Assessments</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center"><ClipboardCheck size={20} className="text-warning" /></div></div></Card>
        <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Growth</p><p className="text-2xl font-bold text-gray-900 mt-1">—</p></div><div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><TrendingUp size={20} className="text-primary" /></div></div></Card>
      </div>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <EmptyState icon={TrendingUp} title="No activity yet" description="Platform analytics will appear here." />
      </Card>
    </div>
  );
}
