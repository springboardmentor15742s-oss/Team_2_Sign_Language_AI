import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';

import { reportService } from '../../services/reportService';
import apiClient from '../../services/apiClient';


const timeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
];


function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'cyan',
}) {
  const tones = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-[#11161f]
        p-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div>
          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.14em]
              font-semibold
              text-slate-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              text-white
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-600
            "
          >
            {subtext}
          </p>
        </div>

        <div
          className={`
            h-10
            w-10
            rounded-xl
            flex
            items-center
            justify-center
            ${tones[tone]}
          `}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}


export default function Reports() {
  const [timeRange, setTimeRange] =
    useState('30d');

  const [loading, setLoading] =
    useState(true);

  const [data, setData] =
    useState({
      learning: null,
      assessment: null,
      accuracy: null,
      progress: null,
      signPerformance: null,
      practice: [],
    });


  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        setLoading(true);

        const results =
          await Promise.allSettled([
            reportService.getLearningReport(),
            reportService.getAssessmentReport(),
            reportService.getAccuracyReport(),
            reportService.getProgressReport(),
            reportService.getSignPerformance(),
            apiClient.get('/practice/sessions'),
          ]);

        if (!active) {
          return;
        }

        const value = (index) =>
          results[index].status ===
          'fulfilled'
            ? results[index].value.data
            : null;

        setData({
          learning: value(0),
          assessment: value(1),
          accuracy: value(2),
          progress: value(3),
          signPerformance: value(4),
          practice: value(5) || [],
        });

      } catch (error) {
        console.error(
          'Reports loading failed:',
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, [timeRange]);


  const accuracy =
    Number(
      data.accuracy
        ?.accuracy_percent ||
      data.signPerformance
        ?.overall_accuracy_percent ||
      0
    );


  const totalAttempts =
    Number(
      data.signPerformance
        ?.total_detection_attempts ||
      data.accuracy
        ?.attempts ||
      0
    );


  const successfulAttempts =
    Number(
      data.signPerformance
        ?.total_correct ||
      data.accuracy
        ?.successful_attempts ||
      0
    );


  const totalSessions =
    Number(
      data.accuracy
        ?.sessions ||
      data.signPerformance
        ?.total_sessions ||
      data.practice.length ||
      0
    );


  const avgConfidence =
    Number(
      data.accuracy
        ?.average_confidence ||
      0
    ) * 100;


  const assessmentAttempts =
    Number(
      data.assessment
        ?.attempts ||
      0
    );


  const assessmentAverage =
    Number(
      data.assessment
        ?.average_score ||
      0
    );


  const totalLearningMinutes =
    useMemo(() => {
      return (
        Array.isArray(
          data.practice
        )
          ? data.practice
          : []
      ).reduce(
        (total, session) =>
          total +
          Math.round(
            (
              session.duration_seconds ||
              0
            ) / 60
          ),
        0
      );
    }, [data.practice]);


  const weeklyActivity =
    useMemo(() => {
      const days = [
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun',
      ];

      const result =
        days.map((day) => ({
          name: day,
          minutes: 0,
        }));

      const now = new Date();

      (
        Array.isArray(data.practice)
          ? data.practice
          : []
      ).forEach((session) => {
        const raw =
          session.started_at ||
          session.created_at;

        if (!raw) {
          return;
        }

        const date =
          new Date(raw);

        const diff =
          Math.floor(
            (
              new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              ) -
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              )
            ) /
            86400000
          );

        if (
          diff >= 0 &&
          diff < 7
        ) {
          const index =
            (
              date.getDay() + 6
            ) % 7;

          result[index].minutes +=
            Math.max(
              1,
              Math.round(
                (
                  session.duration_seconds ||
                  0
                ) / 60
              )
            );
        }
      });

      return result;
    }, [data.practice]);


  const signChartData =
    useMemo(() => {
      const signs =
        data.signPerformance
          ?.signs || [];

      return signs
        .slice()
        .sort(
          (a, b) =>
            b.attempts -
            a.attempts
        )
        .slice(0, 12)
        .map((item) => ({
          name: item.sign,
          accuracy:
            item.accuracy_percent,
        }));
    }, [data.signPerformance]);


  const weakSigns =
    data.signPerformance
      ?.weak_signs || [];


  const strongSigns =
    data.signPerformance
      ?.strong_signs || [];


  const confusions =
    data.signPerformance
      ?.confusions || [];


  const signRows =
    data.signPerformance
      ?.signs || [];


  const handleExport = () => {
    const exportData = {
      generated_at:
        new Date().toISOString(),
      time_range:
        timeRange,
      accuracy:
        data.accuracy,
      assessment:
        data.assessment,
      sign_performance:
        data.signPerformance,
      progress:
        data.progress,
    };

    const blob =
      new Blob(
        [
          JSON.stringify(
            exportData,
            null,
            2
          ),
        ],
        {
          type:
            'application/json',
        }
      );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download =
      'signspeak-learning-report.json';

    anchor.click();

    URL.revokeObjectURL(url);
  };


  return (
    <div
      className="
        max-w-[1440px]
        mx-auto
        space-y-7
      "
    >

      <Breadcrumb
        items={[
          {
            label: 'Reports',
          },
        ]}
      />


      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-slate-800
          bg-gradient-to-br
          from-[#101923]
          via-[#101721]
          to-[#18152a]
          px-6
          py-7
          lg:px-8
        "
      >

        <div
          className="
            absolute
            right-[-90px]
            top-[-100px]
            h-[280px]
            w-[280px]
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#20d8d3]
              "
            >
              <BrainCircuit
                size={14}
              />
              Learner Intelligence
            </div>

            <h1
              className="
                mt-2
                text-3xl
                lg:text-4xl
                font-bold
                text-white
              "
            >
              Performance Analytics
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-400
              "
            >
              Explore your learning progress,
              practice accuracy, sign-level performance,
              confidence patterns and AI-detected
              confusion areas.
            </p>

          </div>


          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >

            <Select
              value={timeRange}
              onChange={(event) =>
                setTimeRange(
                  event.target.value
                )
              }
              options={timeOptions}
              className="w-44"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download size={14} />
              Export
            </Button>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div
        className="
          grid
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <MetricCard
          label="Overall Accuracy"
          value={`${accuracy.toFixed(1)}%`}
          subtext={`${successfulAttempts} correct / ${totalAttempts} attempts`}
          icon={Target}
          tone="cyan"
        />

        <MetricCard
          label="Practice Sessions"
          value={totalSessions}
          subtext={`${totalLearningMinutes} min total learning`}
          icon={Activity}
          tone="emerald"
        />

        <MetricCard
          label="Average Confidence"
          value={`${avgConfidence.toFixed(1)}%`}
          subtext="Across saved practice sessions"
          icon={Zap}
          tone="violet"
        />

        <MetricCard
          label="Assessment Average"
          value={`${assessmentAverage.toFixed(1)}%`}
          subtext={`${assessmentAttempts} assessment attempts`}
          icon={Award}
          tone="amber"
        />

      </div>


      {/* =================================================
          ACTIVITY + SIGN PERFORMANCE
      ================================================= */}

      <div
        className="
          grid
          xl:grid-cols-2
          gap-6
        "
      >

        <Card padding="large">

          <div
            className="
              flex
              items-start
              justify-between
              mb-6
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.14em]
                  font-bold
                  text-[#20d8d3]
                "
              >
                Practice Trend
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Weekly learning activity
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Practice duration recorded by session
              </p>
            </div>

            <CalendarDays
              size={18}
              className="text-slate-600"
            />
          </div>


          {weeklyActivity.some(
            (item) =>
              item.minutes > 0
          ) ? (
            <LineChart
              data={weeklyActivity}
              dataKey="minutes"
              xKey="name"
              color="#16c8c4"
            />
          ) : (
            <div
              className="
                h-[300px]
                rounded-2xl
                border
                border-dashed
                border-slate-800
                flex
                items-center
                justify-center
              "
            >
              <div className="text-center">
                <TrendingUp
                  size={28}
                  className="
                    mx-auto
                    text-slate-700
                  "
                />

                <p
                  className="
                    mt-3
                    text-sm
                    text-slate-500
                  "
                >
                  Practice sessions will build your trend.
                </p>
              </div>
            </div>
          )}

        </Card>


        <Card padding="large">

          <div
            className="
              flex
              items-start
              justify-between
              mb-6
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.14em]
                  font-bold
                  text-violet-400
                "
              >
                Sign Intelligence
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Accuracy by sign
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Performance derived from AI detections
              </p>
            </div>

            <BarChart3
              size={18}
              className="text-slate-600"
            />
          </div>


          {signChartData.length ? (
            <BarChart
              data={signChartData}
              dataKey="accuracy"
              xKey="name"
              color="#8b5cf6"
            />
          ) : (
            <div
              className="
                h-[300px]
                rounded-2xl
                border
                border-dashed
                border-slate-800
                flex
                items-center
                justify-center
              "
            >
              <div className="text-center">
                <Target
                  size={28}
                  className="
                    mx-auto
                    text-slate-700
                  "
                />

                <p
                  className="
                    mt-3
                    text-sm
                    text-slate-500
                  "
                >
                  Analyze signs in Practice to populate this chart.
                </p>
              </div>
            </div>
          )}

        </Card>

      </div>


      {/* =================================================
          AI INSIGHTS
      ================================================= */}

      <section
        className="
          rounded-[28px]
          border
          border-violet-500/20
          bg-gradient-to-br
          from-[#151427]
          to-[#101820]
          p-6
          lg:p-7
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-violet-400
              "
            >
              <BrainCircuit
                size={14}
              />
              AI Performance Insights
            </div>

            <h2
              className="
                mt-2
                text-2xl
                font-bold
                text-white
              "
            >
              Sign-level strengths and weaknesses
            </h2>
          </div>
        </div>


        <div
          className="
            mt-6
            grid
            lg:grid-cols-3
            gap-4
          "
        >

          {/* WEAK */}

          <div
            className="
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/[0.04]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <AlertTriangle
                size={16}
                className="text-amber-400"
              />

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-amber-400
                "
              >
                Priority Signs
              </p>
            </div>


            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {weakSigns.length ? (
                weakSigns.map(
                  (sign) => (
                    <span
                      key={sign}
                      className="
                        min-w-10
                        rounded-lg
                        border
                        border-amber-500/20
                        bg-amber-500/10
                        px-3
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-amber-300
                      "
                    >
                      {sign}
                    </span>
                  )
                )
              ) : (
                <p
                  className="
                    text-xs
                    text-slate-600
                  "
                >
                  No priority signs yet.
                </p>
              )}
            </div>

          </div>


          {/* STRONG */}

          <div
            className="
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/[0.04]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <CheckCircle2
                size={16}
                className="text-emerald-400"
              />

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-emerald-400
                "
              >
                Strong Signs
              </p>
            </div>


            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {strongSigns.length ? (
                strongSigns.map(
                  (sign) => (
                    <span
                      key={sign}
                      className="
                        min-w-10
                        rounded-lg
                        border
                        border-emerald-500/20
                        bg-emerald-500/10
                        px-3
                        py-2
                        text-center
                        text-sm
                        font-bold
                        text-emerald-300
                      "
                    >
                      {sign}
                    </span>
                  )
                )
              ) : (
                <p
                  className="
                    text-xs
                    text-slate-600
                  "
                >
                  No strong-sign history yet.
                </p>
              )}
            </div>

          </div>


          {/* CONFUSIONS */}

          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-white/[0.02]
              p-5
            "
          >

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-cyan-400
              "
            >
              Top Confusions
            </p>


            <div
              className="
                mt-4
                space-y-3
              "
            >

              {confusions.length ? (
                confusions
                  .slice(0, 4)
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.expected}-${item.predicted}-${index}`}
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          border
                          border-slate-800
                          bg-[#111827]
                          px-3
                          py-2.5
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-semibold
                            text-slate-300
                          "
                        >
                          {item.expected}
                          {' → '}
                          {item.predicted}
                        </span>

                        <span
                          className="
                            text-xs
                            font-bold
                            text-rose-400
                          "
                        >
                          {item.count}×
                        </span>
                      </div>
                    )
                  )
              ) : (
                <p
                  className="
                    text-xs
                    text-slate-600
                  "
                >
                  No confusion pairs recorded yet.
                </p>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          DETAILED SIGN TABLE
      ================================================= */}

      <Card padding="large">

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-3
          "
        >

          <div>
            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                font-bold
                text-[#20d8d3]
              "
            >
              Detailed Analysis
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-white
              "
            >
              Per-sign performance
            </h2>
          </div>

          <span
            className="
              text-xs
              text-slate-600
            "
          >
            {signRows.length}
            {' '}
            signs recorded
          </span>

        </div>


        {signRows.length ? (
          <div
            className="
              mt-6
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                text-left
                text-sm
              "
            >

              <thead>
                <tr
                  className="
                    border-b
                    border-slate-800
                    text-[11px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  <th className="pb-3">
                    Sign
                  </th>

                  <th className="pb-3">
                    Attempts
                  </th>

                  <th className="pb-3">
                    Correct
                  </th>

                  <th className="pb-3">
                    Accuracy
                  </th>

                  <th className="pb-3">
                    Avg. Confidence
                  </th>

                  <th className="pb-3">
                    Status
                  </th>
                </tr>
              </thead>


              <tbody>
                {signRows
                  .slice()
                  .sort(
                    (a, b) =>
                      b.attempts -
                      a.attempts
                  )
                  .map(
                    (item) => {

                      let status =
                        'Needs Practice';

                      let statusClass =
                        'text-rose-400 bg-rose-500/10 border-rose-500/20';

                      if (
                        item.accuracy_percent >=
                        85
                      ) {
                        status =
                          'Strong';

                        statusClass =
                          'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                      } else if (
                        item.accuracy_percent >=
                        65
                      ) {
                        status =
                          'Improving';

                        statusClass =
                          'text-amber-400 bg-amber-500/10 border-amber-500/20';
                      }

                      return (
                        <tr
                          key={item.sign}
                          className="
                            border-b
                            border-slate-800/70
                          "
                        >

                          <td
                            className="
                              py-4
                              font-bold
                              text-white
                            "
                          >
                            {item.sign}
                          </td>

                          <td
                            className="
                              py-4
                              text-slate-400
                            "
                          >
                            {item.attempts}
                          </td>

                          <td
                            className="
                              py-4
                              text-slate-400
                            "
                          >
                            {item.correct}
                          </td>

                          <td
                            className="
                              py-4
                              font-semibold
                              text-[#20d8d3]
                            "
                          >
                            {
                              Number(
                                item.accuracy_percent
                              ).toFixed(1)
                            }%
                          </td>

                          <td
                            className="
                              py-4
                              text-slate-400
                            "
                          >
                            {
                              Number(
                                item.average_confidence
                              ).toFixed(1)
                            }%
                          </td>

                          <td className="py-4">
                            <span
                              className={`
                                inline-flex
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                ${statusClass}
                              `}
                            >
                              {status}
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )}
              </tbody>

            </table>

          </div>
        ) : (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-dashed
              border-slate-800
              p-10
              text-center
            "
          >

            <BarChart3
              size={30}
              className="
                mx-auto
                text-slate-700
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-slate-400
              "
            >
              Complete AI practice sessions to generate sign-level analytics.
            </p>

          </div>
        )}

      </Card>


      {/* =================================================
          ASSESSMENT SUMMARY
      ================================================= */}

      <div
        className="
          grid
          md:grid-cols-3
          gap-4
        "
      >

        <Card>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-10
                w-10
                rounded-xl
                bg-violet-500/10
                text-violet-400
                flex
                items-center
                justify-center
              "
            >
              <Award size={18} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Assessment Attempts
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                {assessmentAttempts}
              </p>
            </div>
          </div>
        </Card>


        <Card>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-10
                w-10
                rounded-xl
                bg-cyan-500/10
                text-cyan-400
                flex
                items-center
                justify-center
              "
            >
              <TrendingUp size={18} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Assessment Average
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                {assessmentAverage.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>


        <Card>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-10
                w-10
                rounded-xl
                bg-emerald-500/10
                text-emerald-400
                flex
                items-center
                justify-center
              "
            >
              <Clock3 size={18} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Total Practice Time
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                {totalLearningMinutes} min
              </p>
            </div>
          </div>
        </Card>

      </div>


      <div
        className="
          flex
          items-center
          justify-between
          pb-2
          text-[11px]
          text-slate-700
        "
      >
        <span>
          SignSpeak learner analytics
        </span>

        <span>
          Data generated from connected learner APIs
        </span>
      </div>

    </div>
  );
}