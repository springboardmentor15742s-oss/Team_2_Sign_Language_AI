import { useState } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

const initialNotifications = [
  { id: 1, title: 'Welcome to SignSpeak!', message: 'Get started by exploring our beginner courses.', type: 'info', read: false, time: '2 hours ago' },
  { id: 2, title: 'New Course Available', message: 'Advanced Conversation is now live. Check it out!', type: 'course', read: false, time: '1 day ago' },
  { id: 3, title: 'Practice Reminder', message: 'You have not practiced today. Keep your streak going!', type: 'reminder', read: true, time: '2 days ago' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter(n => filter === 'all' ? true : filter === 'unread' ? !n.read : n.read);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ label: 'Notifications' }]} className="mb-6" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your learning journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={markAllRead}><Check size={14} /> Mark all read</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(n => (
            <Card key={n.id} className={`transition-all ${!n.read ? 'border-primary-200 bg-primary-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'course' ? 'bg-primary-50' : n.type === 'reminder' ? 'bg-warning-50' : 'bg-gray-100'}`}>
                  <Bell size={18} className={n.type === 'course' ? 'text-primary' : n.type === 'reminder' ? 'text-warning' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{n.time}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors" title="Mark as read">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-danger transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Bell} title="No notifications" description="You have no notifications in this filter." />
      )}
    </div>
  );
}
