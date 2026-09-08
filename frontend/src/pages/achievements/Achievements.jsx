import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Hand,
  Loader2,
  Medal,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { achievementService } from '../../services/achievementService';

const ICONS = {
  BookOpen,
  GraduationCap,
  Hand,
  Target,
  ClipboardCheck,
  Award,
  Star,
  Trophy,
  Medal,
};

export default function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const response =
          await achievementService.getAchievements();

        if (active) {
          setData(response.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.detail ||
              'Unable to load achievements.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const achievements =
    data?.achievements || [];

  const earned =
    achievements.filter(
      (item) => item.earned
    );

  const completion =
    achievements.length
      ? Math.round(
          (earned.length /
            achievements.length) *
            100
        )
      : 0;

  const earnedXp = useMemo(
    () =>
      earned.reduce(
        (total, item) =>
          total +
          Number(item.xp_reward || 0),
        0
      ),
    [earned]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2
          size={34}
          className="animate-spin text-[#20d8d3]"
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1250px] mx-auto space-y-6">

      <Breadcrumb
        items={[
          { label: 'Achievements' },
        ]}
      />

      <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#111827] via-[#12151f] to-[#211738] px-6 py-7 lg:px-8">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300">
              <Trophy size={14} />
              Learner Achievements
            </div>

            <h1 className="mt-4 text-3xl font-bold text-white">
              Your learning milestones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Achievements are automatically unlocked from your real course,
              assessment and practice activity.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total XP
            </p>

            <p className="mt-1 text-3xl font-bold text-[#20d8d3]">
              {data?.xp_points || 0}
            </p>
          </div>

        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">

        <Card>
          <p className="text-xs text-slate-500">
            Earned
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {earned.length}
            {' / '}
            {achievements.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Completion
          </p>

          <p className="mt-1 text-2xl font-bold text-[#20d8d3]">
            {completion}%
          </p>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Achievement XP
          </p>

          <p className="mt-1 text-2xl font-bold text-violet-400">
            +{earnedXp}
          </p>
        </Card>

      </div>

      <Card padding="large">

        <div className="flex items-center gap-3 mb-6">
          <Sparkles
            size={18}
            className="text-[#20d8d3]"
          />

          <div>
            <h2 className="font-bold text-white">
              Achievement Library
            </h2>

            <p className="text-xs text-slate-500">
              Complete learning milestones to unlock rewards.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {achievements.map((achievement) => {
            const Icon =
              ICONS[achievement.icon] ||
              Trophy;

            return (
              <div
                key={achievement.id}
                className={`rounded-2xl border p-5 transition ${
                  achievement.earned
                    ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
                    : 'border-slate-800 bg-[#10151e]'
                }`}
              >

                <div className="flex items-start gap-4">

                  <div
                    className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${
                      achievement.earned
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="font-bold text-white">
                          {achievement.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {achievement.description}
                        </p>
                      </div>

                      {achievement.earned && (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-emerald-400"
                        />
                      )}

                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      <span className="text-xs font-bold text-violet-400">
                        +{achievement.xp_reward} XP
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          achievement.earned
                            ? 'text-emerald-400'
                            : 'text-slate-600'
                        }`}
                      >
                        {achievement.earned
                          ? 'Unlocked'
                          : 'Locked'}
                      </span>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </Card>

    </div>
  );
}
