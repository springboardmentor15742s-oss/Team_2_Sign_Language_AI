import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  Zap,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { useAuth } from '../../hooks/useAuth';

import { profileService } from '../../services/profileService';
import { reportService } from '../../services/reportService';
import { courseService } from '../../services/courseService';
import { notificationService } from '../../services/notificationService';
import { mlService } from '../../services/mlService';

import apiClient from '../../services/apiClient';


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'cyan',
}) {
  const toneMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
    },
    violet: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
    },
  };

  const toneStyle =
    toneMap[tone] || toneMap.cyan;

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
              tracking-[0.15em]
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
              tracking-tight
              text-white
            "
          >
            {value}
          </p>

          {subtext && (
            <p
              className="
                mt-1
                text-xs
                text-slate-600
              "
            >
              {subtext}
            </p>
          )}
        </div>

        <div
          className={`
            h-10
            w-10
            rounded-xl
            flex
            items-center
            justify-center
            ${toneStyle.bg}
            ${toneStyle.text}
          `}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}


function MiniProgress({
  label,
  value,
  suffix = '%',
}) {
  const safeValue =
    Math.max(
      0,
      Math.min(
        100,
        Number(value || 0)
      )
    );

  return (
    <div>
      <div
        className="
          flex
          items-center
          justify-between
          text-xs
          mb-2
        "
      >
        <span className="text-slate-500">
          {label}
        </span>

        <span className="font-bold text-slate-200">
          {safeValue}
          {suffix}
        </span>
      </div>

      <div
        className="
          h-1.5
          rounded-full
          bg-slate-800
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-[#16c8c4]
          "
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState({
  learning: null,
  assessment: null,
  accuracy: null,
  progress: null,
  practice: [],
  courses: [],
  enrolled: [],
  notifications: [],
  signPerformance: null,
});

  const [
    learningPlan,
    setLearningPlan,
  ] = useState(null);

  const [
    planLoading,
    setPlanLoading,
  ] = useState(true);


  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    let active = true;

    Promise.allSettled([
  profileService.getProfile(),
  reportService.getLearningReport(),
  reportService.getAssessmentReport(),
  reportService.getAccuracyReport(),
  reportService.getProgressReport(),
  apiClient.get('/practice/sessions'),
  courseService.getCourses({
    limit: 6,
  }),
  courseService.getEnrolled(),
  notificationService.getNotifications(),
  reportService.getSignPerformance(),
]).then((results) => {
      if (!active) {
        return;
      }

      const value = (index) =>
        results[index].status === 'fulfilled'
          ? results[index].value.data
          : null;

      setData({
  learning: value(1),
  assessment: value(2),
  accuracy: value(3),
  progress: value(4),
  practice: value(5) || [],
  courses: value(6) || [],
  enrolled: value(7) || [],
  notifications: value(8) || [],
  signPerformance: value(9) || null,
});
    });

    return () => {
      active = false;
    };
  }, []);


  /* =======================================================
     PERSONALIZED LEARNING PLAN
  ======================================================= */

  useEffect(() => {
    let active = true;

    const loadPlan = async () => {
      try {
        setPlanLoading(true);

        const currentAccuracy =
          Number(
            data.accuracy
              ?.accuracy_percent || 0
          );

        const totalAttempts =
  Number(
    data.signPerformance
      ?.total_detection_attempts ||
    data.accuracy
      ?.attempts ||
    0
  );

        /*
         * Temporary prototype sign groups.
         * Later these should be derived from
         * real per-sign learner performance.
         */
        const weakSigns =
  data.signPerformance
    ?.weak_signs || [];

const strongSigns =
  data.signPerformance
    ?.strong_signs || [];

        const response =
          await mlService
            .generateLearningPlan({
              accuracy:
                currentAccuracy,
              weakSigns,
              strongSigns,
              totalAttempts,
            });

        if (active) {
          setLearningPlan(
            response.data
              .learning_plan
          );
        }
      } catch (error) {
        console.error(
          'Learning plan error:',
          error
        );

        if (active) {
          setLearningPlan(null);
        }
      } finally {
        if (active) {
          setPlanLoading(false);
        }
      }
    };

    loadPlan();

    return () => {
      active = false;
    };
  }, [
    data.accuracy,
    data.practice,
    data.signPerformance,
  ]);


  /* =======================================================
     WEEKLY ACTIVITY
  ======================================================= */

  const weekly = useMemo(() => {
    const labels = [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ];

    const counts =
      labels.map((day) => ({
        day,
        minutes: 0,
      }));

    const now = new Date();

    (
      Array.isArray(
        data.practice
      )
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
          ) / 86400000
        );

      if (
        diff >= 0 &&
        diff < 7
      ) {
        const index =
          (
            date.getDay() + 6
          ) % 7;

        counts[
          index
        ].minutes +=
          Math.max(
            1,
            Math.round(
              (
                session
                  .duration_seconds ||
                0
              ) / 60
            )
          );
      }
    });

    return counts;
  }, [data.practice]);


  /* =======================================================
     COMPUTED VALUES
  ======================================================= */

  const name =
    user?.full_name ||
    user?.name ||
    'Learner';

  const firstName =
    name.split(' ')[0];

  const accuracy =
    Math.round(
      Number(
        data.accuracy
          ?.accuracy_percent ||
        0
      )
    );

  const attempts =
    Number(
      data.accuracy
        ?.attempts ||
      0
    );

  const sessions =
    Number(
      data.accuracy
        ?.sessions ||
      data.practice.length ||
      0
    );

  const assessmentAttempts =
    Number(
      data.assessment
        ?.attempts ||
      0
    );

  const averageAssessment =
    Number(
      data.assessment
        ?.average_score ||
      0
    );

  const courseProgress =
    data.learning
      ?.courses
      ?.length
      ? Math.round(
          data.learning
            .courses
            .reduce(
              (
                total,
                course
              ) =>
                total +
                Number(
                  course
                    .progress_percent ||
                  0
                ),
              0
            ) /
          data.learning
            .courses
            .length
        )
      : 0;

  const totalPracticeMinutes =
    (
      Array.isArray(
        data.practice
      )
        ? data.practice
        : []
    ).reduce(
      (
        total,
        session
      ) =>
        total +
        Math.round(
          (
            session
              .duration_seconds ||
            0
          ) / 60
        ),
      0
    );

  const maxMinutes =
    Math.max(
      4,
      ...weekly.map(
        (item) =>
          item.minutes
      )
    );


  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  const recentActivity =
  (
    Array.isArray(
      data.practice
    )
      ? data.practice
      : []
  )
    .filter(
      (session) =>
        Number(session.attempts || 0) > 0
    )
    .slice(0, 4)
    .map((session) => ({
        id:
          `practice-${session.id}`,
        title:
          session.target_gesture
            ? `Practiced sign ${session.target_gesture}`
            : 'AI practice session',
        meta:
          `${session.attempts || 0} attempts · ${
            Math.round(
              Number(
                session.average_confidence ||
                0
              ) * 100
            )
          }% confidence`,
        icon: Video,
      }));


  /* =======================================================
     UI
  ======================================================= */

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
            label: 'Dashboard',
          },
        ]}
      />


      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-slate-800
          bg-gradient-to-br
          from-[#101923]
          via-[#101721]
          to-[#17152a]
          px-6
          py-7
          lg:px-9
          lg:py-9
        "
      >

        <div
          className="
            absolute
            right-[-80px]
            top-[-110px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-[45%]
            bottom-[-170px]
            h-[300px]
            w-[300px]
            rounded-full
            bg-violet-500/10
            blur-3xl
          "
        />


        <div
          className="
            relative
            grid
            lg:grid-cols-[1.4fr_0.6fr]
            gap-8
            items-center
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/10
                px-3
                py-1.5
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#20d8d3]
              "
            >
              <BrainCircuit size={13} />
              SignSpeak Intelligence Active
            </div>


            <h1
              className="
                mt-5
                text-3xl
                lg:text-[42px]
                leading-tight
                font-bold
                tracking-tight
                text-white
              "
            >
              Good to see you,
              {' '}
              <span className="text-[#20d8d3]">
                {firstName}
              </span>
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                lg:text-base
                leading-7
                text-slate-400
              "
            >
              Continue building your signing accuracy with
              personalized practice, performance insights,
              and AI-guided learning recommendations.
            </p>


            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-3
              "
            >

              <Link
                to="/practice"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#16c8c4]
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-slate-950
                  hover:bg-[#20d8d3]
                  transition
                "
              >
                <Play size={16} />
                Start AI Practice
              </Link>


              <Link
                to="/courses"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-700
                  bg-white/[0.03]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-300
                  hover:bg-white/[0.06]
                  transition
                "
              >
                Explore Courses
                <ArrowRight size={15} />
              </Link>

            </div>

          </div>


          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-6
              backdrop-blur
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
                <p
                  className="
                    text-[11px]
                    uppercase
                    tracking-[0.14em]
                    font-semibold
                    text-slate-500
                  "
                >
                  Current Performance
                </p>

                <p
                  className="
                    mt-2
                    text-5xl
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  {accuracy}%
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Overall practice accuracy
                </p>
              </div>


              <div
                className="
                  h-16
                  w-16
                  rounded-2xl
                  bg-cyan-500/10
                  text-[#20d8d3]
                  flex
                  items-center
                  justify-center
                "
              >
                <TrendingUp size={27} />
              </div>
            </div>


            <div
              className="
                mt-6
                space-y-4
              "
            >
              <MiniProgress
                label="Course progress"
                value={courseProgress}
              />

              <MiniProgress
                label="Assessment average"
                value={averageAssessment}
              />
            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          PERFORMANCE METRICS
      =================================================== */}

      <div
        className="
          grid
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <MetricCard
          label="Practice Accuracy"
          value={`${accuracy}%`}
          subtext={`${attempts} total attempts`}
          icon={Target}
          tone="cyan"
        />

        <MetricCard
          label="Practice Sessions"
          value={sessions}
          subtext={`${totalPracticeMinutes} min total practice`}
          icon={Activity}
          tone="emerald"
        />

        <MetricCard
          label="Assessments"
          value={assessmentAttempts}
          subtext={`${Math.round(
            averageAssessment
          )}% average score`}
          icon={Award}
          tone="violet"
        />

        <MetricCard
          label="Course Progress"
          value={`${courseProgress}%`}
          subtext={`${data.enrolled.length} enrolled courses`}
          icon={BookOpen}
          tone="amber"
        />

      </div>


      {/* ===================================================
          PERFORMANCE + DAILY TARGET
      =================================================== */}

      <div
        className="
          grid
          xl:grid-cols-[1.45fr_0.55fr]
          gap-6
        "
      >

        {/* WEEKLY PERFORMANCE */}

        <Card padding="large">

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#20d8d3]
                "
              >
                Weekly Activity
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Practice consistency
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Minutes practiced during the current week
              </p>
            </div>

            <CalendarDays
              size={19}
              className="text-slate-600"
            />
          </div>


          <div
            className="
              mt-8
              h-[230px]
              flex
              items-end
              gap-3
            "
          >
            {weekly.map((item) => {
              const height =
                Math.max(
                  7,
                  (
                    item.minutes /
                    maxMinutes
                  ) * 100
                );

              return (
                <div
                  key={item.day}
                  className="
                    flex-1
                    h-full
                    flex
                    flex-col
                    justify-end
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-slate-500
                    "
                  >
                    {item.minutes}m
                  </span>

                  <div
                    className="
                      w-full
                      max-w-[58px]
                      h-[170px]
                      rounded-xl
                      bg-slate-900
                      overflow-hidden
                      flex
                      items-end
                    "
                  >
                    <div
                      className="
                        w-full
                        rounded-xl
                        bg-gradient-to-t
                        from-[#16c8c4]
                        to-cyan-300
                      "
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />
                  </div>

                  <span
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

        </Card>


        {/* DAILY GOAL */}

        <Card
          padding="large"
          className="
            bg-gradient-to-br
            from-[#141728]
            to-[#11161f]
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-11
                w-11
                rounded-xl
                bg-violet-500/10
                text-violet-400
                flex
                items-center
                justify-center
              "
            >
              <Flame size={20} />
            </div>

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
                Today's Goal
              </p>

              <h3
                className="
                  mt-1
                  font-bold
                  text-white
                "
              >
                Build consistency
              </h3>
            </div>
          </div>


          <div
            className="
              mt-7
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                h-36
                w-36
                rounded-full
                border-[10px]
                border-slate-800
                flex
                flex-col
                items-center
                justify-center
              "
            >
              <span
                className="
                  text-3xl
                  font-bold
                  text-white
                "
              >
                {Math.min(
                  totalPracticeMinutes,
                  20
                )}
              </span>

              <span
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                / 20 min
              </span>
            </div>
          </div>


          <p
            className="
              mt-5
              text-center
              text-xs
              leading-5
              text-slate-500
            "
          >
            Complete your daily practice goal to improve
            recognition consistency.
          </p>


          <Link
            to="/practice"
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-violet-500/10
              border
              border-violet-500/20
              px-4
              py-2.5
              text-xs
              font-bold
              text-violet-300
              hover:bg-violet-500/15
              transition
            "
          >
            Continue Practice
            <ArrowRight size={14} />
          </Link>

        </Card>

      </div>


      {/* ===================================================
          SIGNSPEAK INTELLIGENCE
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-violet-500/20
          bg-gradient-to-br
          from-[#151427]
          via-[#121622]
          to-[#0f171d]
          p-6
          lg:p-8
        "
      >

        <div
          className="
            absolute
            right-[-90px]
            top-[-120px]
            h-[260px]
            w-[260px]
            rounded-full
            bg-violet-500/10
            blur-3xl
          "
        />


        <div
          className="
            relative
          "
        >

          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-start
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
                  tracking-[0.15em]
                  text-violet-400
                "
              >
                <Sparkles size={14} />
                SignSpeak Intelligence
              </div>

              <h2
                className="
                  mt-2
                  text-2xl
                  lg:text-3xl
                  font-bold
                  text-white
                "
              >
                Your personalized learning direction
              </h2>

              <p
                className="
                  mt-2
                  max-w-3xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                AI recommendations generated from learner
                performance and practice behavior.
              </p>
            </div>


            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-3
                py-1.5
                text-[11px]
                font-bold
                text-emerald-400
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-400
                "
              />
              AI Engine Active
            </div>

          </div>


          {planLoading ? (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-slate-800
                p-8
                text-center
                text-sm
                text-slate-500
              "
            >
              Generating your learning intelligence...
            </div>
          ) : learningPlan ? (
            <>
              <div
                className="
                  mt-7
                  rounded-2xl
                  border
                  border-violet-500/15
                  bg-violet-500/[0.04]
                  p-5
                "
              >
                <p
                  className="
                    text-[11px]
                    uppercase
                    tracking-[0.14em]
                    font-bold
                    text-violet-400
                  "
                >
                  AI Recommended Focus
                </p>

                <p
                  className="
                    mt-2
                    text-lg
                    font-semibold
                    text-slate-200
                  "
                >
                  {
                    learningPlan.focus
                  }
                </p>

                <p
                  className="
                    mt-2
                    max-w-4xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {
                    learningPlan
                      .recommendation
                  }
                </p>
              </div>


              <div
                className="
                  mt-6
                  grid
                  lg:grid-cols-3
                  gap-4
                "
              >

                <div
                  className="
                    rounded-2xl
                    border
                    border-amber-500/15
                    bg-amber-500/[0.03]
                    p-5
                  "
                >
                  <p
                    className="
                      text-[11px]
                      uppercase
                      tracking-[0.14em]
                      font-bold
                      text-amber-400
                    "
                  >
                    Priority Signs
                  </p>

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {learningPlan
                      .priority_signs
                      ?.map((sign) => (
                        <span
                          key={sign}
                          className="
                            min-w-9
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
                      ))}
                  </div>
                </div>


                <div
                  className="
                    rounded-2xl
                    border
                    border-cyan-500/15
                    bg-cyan-500/[0.03]
                    p-5
                  "
                >
                  <p
                    className="
                      text-[11px]
                      uppercase
                      tracking-[0.14em]
                      font-bold
                      text-cyan-400
                    "
                  >
                    Strong Signs
                  </p>

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {learningPlan
                      .strong_signs
                      ?.map((sign) => (
                        <span
                          key={sign}
                          className="
                            min-w-9
                            rounded-lg
                            border
                            border-cyan-500/20
                            bg-cyan-500/10
                            px-3
                            py-2
                            text-center
                            text-sm
                            font-bold
                            text-cyan-300
                          "
                        >
                          {sign}
                        </span>
                      ))}
                  </div>
                </div>


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
                      uppercase
                      tracking-[0.14em]
                      font-bold
                      text-slate-500
                    "
                  >
                    Next Target
                  </p>

                  <p
                    className="
                      mt-3
                      text-4xl
                      font-bold
                      text-white
                    "
                  >
                    {
                      learningPlan
                        .target_accuracy
                    }%
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-600
                    "
                  >
                    AI recommended target accuracy
                  </p>
                </div>

              </div>


              {learningPlan
                .session_plan
                ?.length > 0 && (
                <div
                  className="
                    mt-6
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
                      <p
                        className="
                          text-[11px]
                          uppercase
                          tracking-[0.14em]
                          font-bold
                          text-[#20d8d3]
                        "
                      >
                        Today's Practice Flow
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-600
                        "
                      >
                        Your AI-generated session plan
                      </p>
                    </div>

                    <Clock3
                      size={17}
                      className="text-slate-600"
                    />
                  </div>


                  <div
                    className="
                      mt-4
                      grid
                      md:grid-cols-3
                      gap-3
                    "
                  >
                    {learningPlan
                      .session_plan
                      .map(
                        (
                          activity,
                          index
                        ) => (
                          <div
                            key={
                              activity
                                .activity
                            }
                            className="
                              relative
                              rounded-2xl
                              border
                              border-slate-800
                              bg-[#111827]
                              p-5
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                justify-between
                              "
                            >
                              <div
                                className="
                                  h-8
                                  w-8
                                  rounded-lg
                                  bg-[#0d3b3c]
                                  text-[#20d8d3]
                                  flex
                                  items-center
                                  justify-center
                                  text-xs
                                  font-bold
                                "
                              >
                                {index + 1}
                              </div>

                              <span
                                className="
                                  text-xs
                                  font-bold
                                  text-[#20d8d3]
                                "
                              >
                                {
                                  activity
                                    .duration_minutes
                                } min
                              </span>
                            </div>

                            <p
                              className="
                                mt-4
                                text-sm
                                font-bold
                                text-slate-200
                              "
                            >
                              {
                                activity
                                  .activity
                              }
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                leading-5
                                text-slate-500
                              "
                            >
                              {
                                activity
                                  .task
                              }
                            </p>
                          </div>
                        )
                      )}
                  </div>


                  <div
                    className="
                      mt-5
                      flex
                      justify-end
                    "
                  >
                    <Link
                      to="/practice"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-[#16c8c4]
                        px-5
                        py-2.5
                        text-xs
                        font-bold
                        text-slate-950
                        hover:bg-[#20d8d3]
                        transition
                      "
                    >
                      Start Personalized Session
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>
              )}
            </>
          ) : (
            <div
              className="
                mt-7
                rounded-2xl
                border
                border-dashed
                border-slate-800
                p-8
                text-center
              "
            >
              <Sparkles
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
                  text-slate-400
                "
              >
                Complete practice sessions to unlock
                personalized AI recommendations.
              </p>
            </div>
          )}

        </div>

      </section>


      {/* ===================================================
          LEARNING + ACTIVITY
      =================================================== */}

      <div
        className="
          grid
          xl:grid-cols-[1.35fr_0.65fr]
          gap-6
        "
      >

        {/* ENROLLED COURSES */}

        <Card padding="large">

          <div
            className="
              flex
              items-center
              justify-between
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
                Learning Progress
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Continue learning
              </h2>
            </div>

            <Link
              to="/courses"
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-[#20d8d3]
              "
            >
              View all
              <ChevronRight size={14} />
            </Link>
          </div>


          {data.enrolled.length ? (
            <div
              className="
                mt-6
                space-y-3
              "
            >
              {data.enrolled
                .slice(0, 3)
                .map((entry) => {
                  const course =
                    entry.course;

                  return (
                    <Link
                      key={
                        entry
                          .enrollment_id
                      }
                      to={`/course/${course.id}`}
                      className="
                        group
                        block
                        rounded-2xl
                        border
                        border-slate-800
                        bg-[#111827]
                        p-4
                        hover:border-slate-700
                        transition
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >
                        <div
                          className="
                            h-12
                            w-12
                            rounded-xl
                            bg-cyan-500/10
                            text-cyan-400
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <BookOpen size={20} />
                        </div>

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-4
                            "
                          >
                            <div>
                              <p
                                className="
                                  text-sm
                                  font-bold
                                  text-slate-200
                                  truncate
                                "
                              >
                                {
                                  course.title
                                }
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-xs
                                  text-slate-600
                                "
                              >
                                {
                                  course.level ||
                                  'Beginner'
                                }
                              </p>
                            </div>

                            <span
                              className="
                                text-xs
                                font-bold
                                text-[#20d8d3]
                              "
                            >
                              {
                                entry
                                  .progress_percent
                              }%
                            </span>
                          </div>

                          <div
                            className="
                              mt-3
                              h-1.5
                              rounded-full
                              bg-slate-800
                              overflow-hidden
                            "
                          >
                            <div
                              className="
                                h-full
                                rounded-full
                                bg-[#16c8c4]
                              "
                              style={{
                                width:
                                  `${
                                    entry
                                      .progress_percent
                                  }%`,
                              }}
                            />
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className="
                            text-slate-700
                            group-hover:text-slate-500
                          "
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-dashed
                border-slate-800
                p-8
                text-center
              "
            >
              <BookOpen
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
                  text-slate-400
                "
              >
                You haven't enrolled in a course yet.
              </p>

              <Link
                to="/courses"
                className="
                  mt-3
                  inline-flex
                  text-xs
                  font-semibold
                  text-[#20d8d3]
                "
              >
                Explore courses
              </Link>
            </div>
          )}

        </Card>


        {/* RECENT ACTIVITY */}

        <Card padding="large">

          <div
            className="
              flex
              items-center
              justify-between
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
                Recent Activity
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Learning timeline
              </h2>
            </div>

            <Activity
              size={18}
              className="text-slate-600"
            />
          </div>


          {recentActivity.length ? (
            <div
              className="
                mt-6
                space-y-4
              "
            >
              {recentActivity.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      key={item.id}
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <div
                        className="
                          h-8
                          w-8
                          rounded-lg
                          bg-emerald-500/10
                          text-emerald-400
                          flex
                          items-center
                          justify-center
                          shrink-0
                        "
                      >
                        <Icon size={14} />
                      </div>

                      <div>
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-300
                          "
                        >
                          {item.title}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-xs
                            leading-5
                            text-slate-600
                          "
                        >
                          {item.meta}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-dashed
                border-slate-800
                p-7
                text-center
              "
            >
              <Activity
                size={26}
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
                Your recent practice activity will appear here.
              </p>
            </div>
          )}

        </Card>

      </div>


      {/* ===================================================
          NEXT STEPS
      =================================================== */}

      <Card padding="large">

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
            Continue Your Journey
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-bold
              text-white
            "
          >
            Recommended next actions
          </h2>
        </div>


        <div
          className="
            mt-6
            grid
            sm:grid-cols-2
            xl:grid-cols-4
            gap-3
          "
        >

          {[
            {
              title:
                'AI Practice',
              text:
                'Practice target signs with real-time ML feedback.',
              path:
                '/practice',
              icon:
                Video,
            },
            {
              title:
                'Continue Course',
              text:
                'Progress through your structured learning path.',
              path:
                '/courses',
              icon:
                BookOpen,
            },
            {
              title:
                'Assessment',
              text:
                'Measure your current recognition performance.',
              path:
                '/assessments',
              icon:
                Target,
            },
            {
              title:
                'Review Progress',
              text:
                'Explore analytics and improvement insights.',
              path:
                '/reports',
              icon:
                TrendingUp,
            },
          ].map(
            ({
              title,
              text,
              path,
              icon: Icon,
            }) => (
              <Link
                key={title}
                to={path}
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-800
                  bg-[#111827]
                  p-5
                  hover:border-slate-700
                  transition
                "
              >
                <div
                  className="
                    h-10
                    w-10
                    rounded-xl
                    bg-[#0d3b3c]
                    text-[#20d8d3]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon size={18} />
                </div>

                <h3
                  className="
                    mt-4
                    text-sm
                    font-bold
                    text-slate-200
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  {text}
                </p>

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-1
                    text-xs
                    font-semibold
                    text-[#20d8d3]
                  "
                >
                  Open
                  <ArrowRight
                    size={13}
                    className="
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </div>
              </Link>
            )
          )}

        </div>

      </Card>


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
          SignSpeak AI learner intelligence
        </span>

        <span>
          Performance data from connected learner APIs
        </span>
      </div>

    </div>
  );
}