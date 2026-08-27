import { Link, useLocation } from 'react-router-dom';

import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';


export default function AssessmentResults() {
  const location =
    useLocation();

  const result =
    location.state?.result;

  const assessment =
    location.state?.assessment;


  if (
    !result ||
    !assessment
  ) {
    return (
      <div className="max-w-4xl mx-auto">

        <Breadcrumb
          items={[
            {
              label:
                'Assessments',
              path:
                '/assessments',
            },
            {
              label:
                'Results',
            },
          ]}
        />

        <Card
          padding="large"
          className="mt-6"
        >

          <div className="py-10 text-center">

            <Award
              size={34}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-3 text-xl font-bold text-white">
              No assessment result selected
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete an assessment to view your detailed result.
            </p>

            <Link
              to="/assessments"
              className="mt-5 inline-flex"
            >
              <Button>
                View Assessments
                <ArrowRight
                  size={15}
                />
              </Button>
            </Link>

          </div>

        </Card>

      </div>
    );
  }


  const score =
    Number(
      result.score || 0
    );

  const passed =
    Boolean(
      result.passed
    );

  const earned =
    Number(
      result.earned_points ||
      0
    );

  const total =
    Number(
      result.total_points ||
      0
    );


  return (
    <div className="max-w-[1100px] mx-auto space-y-7">

      <Breadcrumb
        items={[
          {
            label:
              'Assessments',
            path:
              '/assessments',
          },
          {
            label:
              'Results',
          },
        ]}
      />


      {/* RESULT HERO */}

      <section
        className={`relative overflow-hidden rounded-[30px] border p-7 lg:p-9 ${
          passed
            ? 'border-emerald-500/20 bg-gradient-to-br from-[#101d1c] to-[#111827]'
            : 'border-amber-500/20 bg-gradient-to-br from-[#211a13] to-[#111827]'
        }`}
      >

        <div className="grid lg:grid-cols-[1fr_240px] gap-8 items-center">

          <div>

            <div
              className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] ${
                passed
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {passed ? (
                <CheckCircle2
                  size={14}
                />
              ) : (
                <XCircle
                  size={14}
                />
              )}

              Assessment Complete
            </div>


            <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-white">
              {passed
                ? 'Great work — you passed!'
                : 'Keep practicing — you can improve.'}
            </h1>


            <p className="mt-3 text-sm text-slate-400">
              {assessment.title}
            </p>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Your result has been securely scored and saved.
              Use your performance data to guide your next
              learning and practice session.
            </p>

          </div>


          <div className="text-center">

            <div
              className={`mx-auto h-44 w-44 rounded-full border-[12px] flex flex-col items-center justify-center ${
                passed
                  ? 'border-emerald-500/20'
                  : 'border-amber-500/20'
              }`}
            >

              <span
                className={`text-4xl font-bold ${
                  passed
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {score.toFixed(1)}%
              </span>

              <span className="mt-1 text-xs text-slate-500">
                Final Score
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* METRICS */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card>
          <p className="text-xs text-slate-500">
            Score
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {score.toFixed(1)}%
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Points Earned
          </p>

          <p className="mt-2 text-2xl font-bold text-[#20d8d3]">
            {earned}
            {' / '}
            {total}
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Pass Mark
          </p>

          <p className="mt-2 text-2xl font-bold text-violet-400">
            {
              assessment
                .passing_score
            }%
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Status
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              passed
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {passed
              ? 'Passed'
              : 'Retry'}
          </p>
        </Card>

      </div>


      {/* AI LEARNING RESPONSE */}

      <section className="rounded-[26px] border border-violet-500/20 bg-gradient-to-br from-[#151427] to-[#101820] p-6 lg:p-7">

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Sparkles
              size={19}
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-400">
              SignSpeak Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              What should you do next?
            </h2>
          </div>

        </div>


        <div className="mt-6 grid md:grid-cols-3 gap-4">

          <Link
            to="/practice"
            className="rounded-2xl border border-slate-800 bg-[#111827] p-5 hover:border-slate-700 transition"
          >
            <Target
              size={18}
              className="text-[#20d8d3]"
            />

            <h3 className="mt-3 text-sm font-bold text-white">
              AI Practice
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Practice signs with live recognition and personalized feedback.
            </p>
          </Link>


          <Link
            to="/reports"
            className="rounded-2xl border border-slate-800 bg-[#111827] p-5 hover:border-slate-700 transition"
          >
            <TrendingUp
              size={18}
              className="text-violet-400"
            />

            <h3 className="mt-3 text-sm font-bold text-white">
              Review Analytics
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Compare assessment performance with your practice activity.
            </p>
          </Link>


          <Link
            to="/courses"
            className="rounded-2xl border border-slate-800 bg-[#111827] p-5 hover:border-slate-700 transition"
          >
            <BookOpen
              size={18}
              className="text-amber-400"
            />

            <h3 className="mt-3 text-sm font-bold text-white">
              Continue Learning
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Continue structured lessons before your next assessment.
            </p>
          </Link>

        </div>

      </section>


      {/* ACTIONS */}

      <div className="flex flex-wrap justify-between gap-3">

        <Link to="/assessments">
          <Button variant="outline">
            <BarChart3 size={15} />
            All Assessments
          </Button>
        </Link>


        <Link
          to={`/assessment/${assessment.id}`}
        >
          <Button>
            <RotateCcw size={15} />
            Retake Assessment
          </Button>
        </Link>

      </div>

    </div>
  );
}