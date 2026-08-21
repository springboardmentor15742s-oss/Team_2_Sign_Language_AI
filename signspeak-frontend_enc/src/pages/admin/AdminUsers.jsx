import { useEffect, useState } from 'react';
import { Users, Search, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { adminService } from '../../services/adminService';

const ROLE_BADGES = {
  admin: 'bg-violet-950/70 border-violet-800 text-violet-300',
  instructor: 'bg-blue-950/70 border-blue-800 text-blue-300',
  accessibility_trainer: 'bg-cyan-950/70 border-cyan-800 text-cyan-300',
  student: 'bg-slate-800 border-slate-700 text-slate-300',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsersActivity()
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Failed to load user activity:', err);
        addToast(err.response?.data?.detail || 'Failed to load users.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatus = async (u) => {
    setBusyId(u.id);
    try {
      await adminService.updateUserStatus(u.id, !u.is_active);
      addToast(`${u.full_name} ${u.is_active ? 'deactivated' : 'activated'}.`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to update status.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = users.filter(u =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Admin', path: '/admin' }, { label: 'Users & Activity' }]} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users size={22} className="text-primary" /> Users & Activity</h1>
          <p className="text-sm text-slate-400 mt-1">Who's on the platform, their role, last login, and real assessment activity.</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-400"><Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" /> Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4">Assessments</th>
                  <th className="py-3 px-4">Sign Attempts</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">XP / Streak</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-white">{u.full_name}</p>
                      <p className="text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${ROLE_BADGES[u.role] || ROLE_BADGES.student}`}>{u.role}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</td>
                    <td className="py-2.5 px-4">{u.assessments_completed}</td>
                    <td className="py-2.5 px-4">{u.sign_attempts}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">{u.accuracy}%</td>
                    <td className="py-2.5 px-4">{u.xp_points} XP &middot; {u.current_streak}d</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${u.is_active ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {u.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant={u.is_active ? 'danger' : 'outline'}
                          disabled={busyId === u.id}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.is_active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-500 py-8">No users match your search.</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
