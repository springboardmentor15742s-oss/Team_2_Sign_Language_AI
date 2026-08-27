import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Layers3,
  Search,
  ShieldCheck,
  UserCog,
  Loader2,
  Plus,
  Activity,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'instructor',
  });

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);

    const [dashboardResult, usersResult] = await Promise.allSettled([
      adminService.getDashboard(),
      adminService.getUsers(),
    ]);

    if (dashboardResult.status === 'fulfilled') {
      setStats(dashboardResult.value.data);
    }

    if (usersResult.status === 'fulfilled') {
      setUsers(usersResult.value.data || []);
    }

    if (
      dashboardResult.status === 'rejected' ||
      usersResult.status === 'rejected'
    ) {
      addToast('Unable to load some admin data', 'error');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const haystack = `
        ${user.full_name || ''}
        ${user.email || ''}
        ${user.role || ''}
      `.toLowerCase();

      return haystack.includes(query);
    });
  }, [users, search]);

  const handleRoleChange = async (userId, role) => {
    setBusyUserId(userId);

    try {
      await adminService.updateRole(userId, role);
      addToast('User role updated', 'success');
      await loadData();
    } catch (error) {
      addToast(
        error.response?.data?.detail || 'Unable to update role',
        'error'
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleStatusChange = async (user) => {
    setBusyUserId(user.id);

    try {
      await adminService.updateStatus(user.id, !user.is_active);

      addToast(
        user.is_active
          ? 'User account deactivated'
          : 'User account activated',
        'success'
      );

      await loadData();
    } catch (error) {
      addToast(
        error.response?.data?.detail || 'Unable to update account status',
        'error'
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      addToast('Please complete all required fields', 'error');
      return;
    }

    setCreating(true);

    try {
      await adminService.createUser(form);

      addToast('Staff account created successfully', 'success');

      setForm({
        full_name: '',
        email: '',
        password: '',
        role: 'instructor',
      });

      setShowCreateForm(false);

      await loadData();
    } catch (error) {
      addToast(
        error.response?.data?.detail || 'Unable to create staff account',
        'error'
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <Loader2 className="mx-auto animate-spin" size={28} />
        <p className="mt-3 text-sm">Loading administration data…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <Breadcrumb items={[{ label: 'Administration' }]} />

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#101923] via-[#10151f] to-[#121120] p-7 lg:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-[#20d8d3]">
              <ShieldCheck size={14} />
              Platform Administration
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">
              SignSpeak Control Center
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Manage users, learning resources and platform access from one
              centralized administrative workspace.
            </p>
          </div>

          <Button onClick={() => setShowCreateForm((value) => !value)}>
            <Plus size={16} />
            Create Staff Account
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.total_users ?? 0}
          helper={`${stats?.active_users ?? 0} active accounts`}
        />

        <StatCard
          icon={GraduationCap}
          label="Learners"
          value={stats?.learners ?? 0}
          helper="Registered students"
        />

        <StatCard
          icon={BookOpen}
          label="Courses"
          value={stats?.courses ?? 0}
          helper={`${stats?.lessons ?? 0} lessons available`}
        />

        <StatCard
          icon={ClipboardCheck}
          label="Assessments"
          value={stats?.assessments ?? 0}
          helper="Published and managed tests"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MiniCard
          icon={UserCheck}
          label="Active Users"
          value={stats?.active_users ?? 0}
        />

        <MiniCard
          icon={UserCog}
          label="Instructors"
          value={stats?.instructors ?? 0}
        />

        <MiniCard
          icon={ShieldCheck}
          label="Accessibility Trainers"
          value={stats?.accessibility_trainers ?? 0}
        />
      </section>

      {showCreateForm && (
        <Card padding="large">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#20d8d3]">
                Staff Management
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Create Staff Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create an instructor, trainer or administrator account.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateUser}
            className="grid gap-4 md:grid-cols-2"
          >
            <Field label="Full Name">
              <input
                value={form.full_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-800 bg-[#0d131d] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                placeholder="Enter full name"
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-800 bg-[#0d131d] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                placeholder="staff@example.com"
              />
            </Field>

            <Field label="Temporary Password">
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-800 bg-[#0d131d] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                placeholder="Enter temporary password"
              />
            </Field>

            <Field label="Role">
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-800 bg-[#0d131d] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="instructor">Instructor</option>
                <option value="accessibility_trainer">
                  Accessibility Trainer
                </option>
                <option value="admin">Administrator</option>
              </select>
            </Field>

            <div className="flex gap-3 md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Account
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-slate-600 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card padding="large">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#20d8d3]">
              <Activity size={14} />
              User Administration
            </div>

            <h2 className="mt-2 text-xl font-bold text-white">
              Platform Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage roles and account access for registered users.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl border border-slate-800 bg-[#0d131d] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>

        {filteredUsers.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Joined</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/70"
                  >
                    <td className="px-3 py-4">
                      <div>
                        <p className="font-semibold text-slate-200">
                          {user.full_name || 'Unnamed user'}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-600">
                          {user.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <select
                        value={user.role}
                        disabled={busyUserId === user.id}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value)
                        }
                        className="rounded-lg border border-slate-800 bg-[#111827] px-2.5 py-2 text-xs font-semibold text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="accessibility_trainer">
                          Accessibility Trainer
                        </option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className="px-3 py-4 text-right">
                      <button
                        onClick={() => handleStatusChange(user)}
                        disabled={busyUserId === user.id}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                          user.is_active
                            ? 'border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10'
                            : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {busyUserId === user.id
                          ? 'Saving...'
                          : user.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No users found"
            description="No users match the current search."
          />
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-600">{helper}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-[#20d8d3]">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function MiniCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#151a24] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}