import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { assessmentService } from '../../services/assessmentService';


export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    let active = true;

    const loadAssessments = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await assessmentService.getAssessments();

        const list =
          Array.isArray(response.data)
            ? response.data
            : [];

        if (!active) {
          return;
        }

        setAssessments(list);

        const resultResponses =
          await Promise.allSettled(
            list.map((assessment) =>
              assessmentService.getResults(
                assessment.id
              )
            )
          );

        if (!active) {
          return;
        }

        const resultMap = {};

        resultResponses.forEach(
          (result, index) => {
            const assessmentId =
              list[index].id;

            resultMap[assessmentId] =
              result.status === 'fulfilled'
                ? result.value.data || []
                : [];
          }
        );

        setResults(resultMap);

      } catch (err) {
        console.error(
          'Assessment loading failed:',
          err
        );

        if (active) {
          setError(
            err?.response?.data?.detail ||
              'Unable to load assessments.'
          );
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAssessments();

    return () => {
      active = false;
    };
  }, []);


  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#20d8d3]"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading assessments...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-[1280px] mx-auto space-y-7">

      <Breadcrumb
        items={[
          { label: 'Assessments' },
        ]}
      />


      {/* HERO */}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#101923] via-[#111721] to-[#18152a] p-7 lg:p-9">

        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">

          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-400">
            <ShieldCheck size={14} />
            Skill Verification
          </div>

          <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-white">
            Assess your signing progress
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Complete structured assessments to measure
            knowledge, track improvement and generate
            personalized learning insights.
          </p>

        </div>

      </section>


      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}


      {/* SUMMARY */}

      <div className="grid sm:grid-cols-3 gap-4">

        <Card>
          <p className="text-xs text-slate-500">
            Available Assessments
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {assessments.length}
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Total Attempts
          </p>

          <p className="mt-2 text-3xl font-bold text-[#20d8d3]">
            {Object.values(results)
              .flat()
              .length}
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Passed
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {Object.values(results)
              .flat()
              .filter(
                (result) =>
                  Boolean(result.passed)
              ).length}
          </p>
        </Card>

      </div>


      {/* ASSESSMENTS */}

      <div className="space-y-4">

        {assessments.length ? (
          assessments.map(
            (assessment) => {

              const history =
                results[
                  assessment.id
                ] || [];

              const latest =
                history[0];

              const bestScore =
                history.length
                  ? Math.max(
                      ...history.map(
                        (item) =>
                          Number(
                            item.score || 0
                          )
                      )
                    )
                  : null;

              return (
                <Card
                  key={assessment.id}
                  padding="large"
                >

                  <div className="flex flex-col xl:flex-row xl:items-center gap-5">

                    <div className="h-14 w-14 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                      <ClipboardCheck
                        size={24}
                      />
                    </div>


                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-lg font-bold text-white">
                          {assessment.title}
                        </h2>

                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-400">
                          Published
                        </span>

                      </div>


                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {assessment.description ||
                          'Complete this assessment to measure your current understanding and signing performance.'}
                      </p>


                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                        <span className="flex items-center gap-1.5">
                          <Clock3 size={13} />
                          {
                            assessment
                              .time_limit_minutes
                          } min
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Target size={13} />
                          Pass:
                          {' '}
                          {
                            assessment
                              .passing_score
                          }%
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Award size={13} />
                          {
                            history.length
                          }
                          {' '}
                          attempts
                        </span>

                      </div>

                    </div>


                    <div className="xl:w-[280px]">

                      {latest && (
                        <div className="mb-3 grid grid-cols-2 gap-2">

                          <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                            <p className="text-[10px] uppercase text-slate-600">
                              Latest
                            </p>

                            <p className="mt-1 text-lg font-bold text-white">
                              {
                                Number(
                                  latest.score
                                ).toFixed(1)
                              }%
                            </p>
                          </div>


                          <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                            <p className="text-[10px] uppercase text-slate-600">
                              Best
                            </p>

                            <p className="mt-1 text-lg font-bold text-[#20d8d3]">
                              {
                                Number(
                                  bestScore
                                ).toFixed(1)
                              }%
                            </p>
                          </div>

                        </div>
                      )}


                      <Link
                        to={`/assessment/${assessment.id}`}
                      >
                        <Button className="w-full">

                          <Sparkles size={15} />

                          {history.length
                            ? 'Retake Assessment'
                            : 'Start Assessment'}

                          <ArrowRight size={14} />

                        </Button>
                      </Link>

                    </div>

                  </div>

                </Card>
              );
            }
          )
        ) : (
          <Card padding="large">

            <div className="py-10 text-center">

              <BarChart3
                size={30}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-3 font-bold text-white">
                No assessments available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Published assessments will appear here.
              </p>

            </div>

          </Card>
        )}

      </div>


      {/* INFORMATION */}

      <Card padding="large">

        <div className="grid md:grid-cols-3 gap-5">

          {[
            [
              CheckCircle2,
              'Secure Scoring',
              'Answers are evaluated by the backend and correct answers are never exposed during the assessment.',
            ],
            [
              Clock3,
              'Timed Assessment',
              'Each assessment uses its configured time limit for a realistic evaluation experience.',
            ],
            [
              BrainIcon,
              'Learning Intelligence',
              'Assessment performance contributes to learner analytics and recommendations.',
            ],
          ].map(
            ([Icon, title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-800 p-5"
              >
                <Icon
                  size={18}
                  className="text-[#20d8d3]"
                />

                <h3 className="mt-3 text-sm font-bold text-white">
                  {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {text}
                </p>
              </div>
            )
          )}

        </div>

      </Card>

    </div>
  );
}


function BrainIcon(props) {
  return (
    <Sparkles {...props} />
  );
}