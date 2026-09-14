import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Flame,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Play,
  Sparkles,
  Video,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

import { reportService } from '../../services/reportService';
import { courseService } from '../../services/courseService';
import { notificationService } from '../../services/notificationService';
import certificateService from '../../services/certificateService';

import apiClient from '../../services/apiClient';


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'cyan',
}) {
  const tones = {
    cyan: {
      bg: 'bg-cyan-400/[0.08]',
      icon: 'text-cyan-300',
    },

    blue: {
      bg: 'bg-blue-500/[0.08]',
      icon: 'text-blue-300',
    },

    violet: {
      bg: 'bg-violet-500/[0.08]',
      icon: 'text-violet-300',
    },

    amber: {
      bg: 'bg-amber-500/[0.08]',
      icon: 'text-amber-300',
    },
  };

  const selected =
    tones[tone] || tones.cyan;

  return (
    <div
      className="
        rounded-[22px]
        border
        border-[var(--ss-border)]
        bg-[var(--ss-card)]
        p-5
        transition
        duration-200
        hover:border-white/[0.1]
      "
    >
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
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--ss-text-muted)]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-[30px]
              font-bold
              tracking-tight
              text-[var(--ss-text)]
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-[var(--ss-text-muted)]
            "
          >
            {detail}
          </p>

        </div>

        <div
          className={`
            h-11
            w-11
            shrink-0
            rounded-xl
            flex
            items-center
            justify-center
            ${selected.bg}
            ${selected.icon}
          `}
        >
          <Icon size={19} />
        </div>

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
    certificates: [],
  });


  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    let active = true;

    Promise.allSettled([
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
      certificateService.getCertificates(),
    ]).then((results) => {
      if (!active) {
        return;
      }

      const value = (index) =>
        results[index]?.status === 'fulfilled'
          ? results[index].value?.data
          : null;

      const certificateResult =
        results[8]?.status === 'fulfilled'
          ? results[8].value
          : [];

      setData({
        learning: value(0),
        assessment: value(1),
        accuracy: value(2),
        progress: value(3),
        practice: value(4) || [],
        courses: value(5) || [],
        enrolled: value(6) || [],
        notifications: value(7) || [],

        certificates:
          Array.isArray(certificateResult)
            ? certificateResult
            : Array.isArray(
                certificateResult?.data
              )
            ? certificateResult.data
            : [],
      });
    });

    return () => {
      active = false;
    };
  }, []);


  /* =======================================================
     USER
  ======================================================= */

  const name =
    user?.full_name ||
    user?.name ||
    'Learner';

  const firstName =
    name.split(' ')[0];


  /* =======================================================
     METRICS
  ======================================================= */

  const assessmentAttempts =
    Number(
      data.assessment?.attempts || 0
    );

  const assessmentAverage =
    Math.round(
      Number(
        data.assessment?.average_score || 0
      )
    );

  const practiceSessions =
    Number(
      data.accuracy?.sessions ||
      data.practice.length ||
      0
    );


  /* =======================================================
     PRACTICE STREAK
  ======================================================= */

  const streakData = useMemo(() => {
    const sessions =
      Array.isArray(data.practice)
        ? data.practice
        : [];

    const dayKeys = [
      ...new Set(
        sessions
          .map((session) => {
            const raw =
              session.started_at ||
              session.created_at;

            if (!raw) return null;

            const date = new Date(raw);

            return [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, '0'),
              String(date.getDate()).padStart(2, '0'),
            ].join('-');
          })
          .filter(Boolean)
      ),
    ].sort();

    const toDate = (key) => {
      const [year, month, day] =
        key.split('-').map(Number);

      return new Date(
        year,
        month - 1,
        day
      );
    };

    const diffDays = (a, b) =>
      Math.round(
        (
          toDate(b) -
          toDate(a)
        ) / 86400000
      );

    let best = 0;
    let running = 0;
    let previous = null;

    dayKeys.forEach((key) => {
      if (
        previous &&
        diffDays(previous, key) === 1
      ) {
        running += 1;
      } else {
        running = 1;
      }

      best = Math.max(
        best,
        running
      );

      previous = key;
    });

    const now = new Date();

    const todayKey = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    const yesterday = new Date(now);
    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const yesterdayKey = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, '0'),
      String(yesterday.getDate()).padStart(2, '0'),
    ].join('-');

    let current = 0;

    if (dayKeys.length) {
      const last =
        dayKeys[
          dayKeys.length - 1
        ];

      if (
        last === todayKey ||
        last === yesterdayKey
      ) {
        current = 1;

        for (
          let i = dayKeys.length - 1;
          i > 0;
          i -= 1
        ) {
          if (
            diffDays(
              dayKeys[i - 1],
              dayKeys[i]
            ) === 1
          ) {
            current += 1;
          } else {
            break;
          }
        }
      }
    }

    const lastSevenDays =
      Array.from(
        { length: 7 },
        (_, index) => {
          const date =
            new Date();

          date.setDate(
            date.getDate() -
            (6 - index)
          );

          const key = [
            date.getFullYear(),
            String(
              date.getMonth() + 1
            ).padStart(2, '0'),
            String(
              date.getDate()
            ).padStart(2, '0'),
          ].join('-');

          return {
            key,
            label:
              date.toLocaleDateString(
                'en-US',
                {
                  weekday: 'short',
                }
              ).slice(0, 1),

            active:
              dayKeys.includes(key),
          };
        }
      );

    return {
      current,
      best,
      lastSevenDays,
    };
  }, [data.practice]);


  const totalPracticeMinutes =
    (
      Array.isArray(data.practice)
        ? data.practice
        : []
    ).reduce(
      (total, session) =>
        total +
        Math.round(
          Number(
            session.duration_seconds || 0
          ) / 60
        ),
      0
    );


  const courseProgress =
    data.learning?.courses?.length
      ? Math.round(
          data.learning.courses.reduce(
            (total, course) =>
              total +
              Number(
                course.progress_percent || 0
              ),
            0
          ) /
            data.learning.courses.length
        )
      : data.enrolled.length
      ? Math.round(
          data.enrolled.reduce(
            (total, item) =>
              total +
              Number(
                item.progress_percent || 0
              ),
            0
          ) /
            data.enrolled.length
        )
      : 0;


  const certificateCount =
    Array.isArray(data.certificates)
      ? data.certificates.length
      : 0;


  /* =======================================================
     CONTINUE LEARNING
  ======================================================= */

  const currentEnrollment =
    Array.isArray(data.enrolled)
      ? data.enrolled.find(
          (item) =>
            Number(
              item.progress_percent || 0
            ) < 100
        ) || data.enrolled[0]
      : null;

  const currentCourse =
    currentEnrollment?.course || null;

  const currentCourseProgress =
    Number(
      currentEnrollment?.progress_percent ||
      0
    );


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

      const date = new Date(raw);

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
          (date.getDay() + 6) % 7;

        counts[index].minutes +=
          Math.max(
            1,
            Math.round(
              Number(
                session.duration_seconds ||
                0
              ) / 60
            )
          );
      }
    });

    return counts;
  }, [data.practice]);


  const maxMinutes =
    Math.max(
      5,
      ...weekly.map(
        (item) => item.minutes
      )
    );


  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  const recentActivity =
    (
      Array.isArray(data.practice)
        ? data.practice
        : []
    )
      .filter(
        (session) =>
          Number(
            session.attempts || 0
          ) > 0
      )
      .slice(0, 4);


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        max-w-[1320px]
        mx-auto
        px-1
        pb-12
        space-y-6
      "
    >

      {/* ===================================================
          WELCOME
      =================================================== */}

      <section
        className="
          ss-dashboard-hero
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-[var(--ss-border)]
          bg-gradient-to-br
          from-[var(--ss-hero-start)]
          via-[var(--ss-hero-middle)]
          to-[var(--ss-hero-end)]
          px-7
          py-8
          lg:px-9
          lg:py-9
        "
      >

        <div
          className="
            absolute
            -right-16
            -top-20
            h-64
            w-64
            rounded-full
            bg-cyan-400/[0.08]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            right-[20%]
            -bottom-24
            h-52
            w-52
            rounded-full
            bg-blue-500/[0.09]
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
            gap-7
          "
        >

          <div
            className="
              max-w-2xl
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/10
                bg-cyan-400/[0.07]
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[#45ded8]
              "
            >
              <Sparkles size={13} />
              SignSpeak Learning Hub
            </div>


            <h1
              className="
                mt-5
                text-3xl
                lg:text-[38px]
                font-bold
                leading-tight
                tracking-tight
                text-[var(--ss-text)]
              "
            >
              Welcome back,
              {' '}
              <span
                className="
                  bg-gradient-to-r
                  from-[#42ddd8]
                  to-[#52a4ff]
                  bg-clip-text
                  text-transparent
                "
              >
                {firstName}
              </span>
            </h1>


            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-[var(--ss-text-soft)]
              "
            >
              Continue your learning journey,
              practice consistently, and track
              your progress in one place.
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
                to="/courses"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#238cf7]
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-[var(--ss-text)]
                  transition
                  hover:bg-[#3298ff]
                "
              >
                <BookOpen size={16} />
                Continue Learning
              </Link>


              <Link
                to="/practice"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--ss-border)]
                  bg-white/[0.04]
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-[var(--ss-text-soft)]
                  transition
                  hover:bg-white/[0.07]
                "
              >
                <Play size={16} />
                Start Practice
              </Link>

            </div>

          </div>


          <div
            className="
              hidden
              lg:flex
              h-36
              w-36
              shrink-0
              items-center
              justify-center
              rounded-[32px]
              border
              border-[var(--ss-border)]
              bg-white/[0.04]
              shadow-[0_25px_70px_rgba(0,0,0,0.18)]
            "
          >
            <div
              className="
                h-20
                w-20
                rounded-[24px]
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-[#2bd5d0]
                to-[#2c82f5]
                shadow-[0_15px_45px_rgba(43,213,208,0.2)]
              "
            >
              <BookOpen
                size={34}
                className="text-[var(--ss-text)]"
              />
            </div>
          </div>

        </div>

      </section>


      {/* ===================================================
          KEY METRICS
      =================================================== */}

      <section
        className="
          grid
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <MetricCard
          label="Course Progress"
          value={`${courseProgress}%`}
          detail={`${data.enrolled.length} enrolled courses`}
          icon={BookOpen}
          tone="blue"
        />

        <MetricCard
          label="Practice Sessions"
          value={practiceSessions}
          detail={`${totalPracticeMinutes} min practiced`}
          icon={Activity}
          tone="cyan"
        />

        <MetricCard
          label="Current Streak"
          value={`${streakData.current} day${streakData.current === 1 ? '' : 's'}`}
          detail={`Best streak: ${streakData.best} day${streakData.best === 1 ? '' : 's'}`}
          icon={Flame}
          tone="amber"
        />


        <MetricCard
          label="Assessments"
          value={
            assessmentAttempts
              ? `${assessmentAverage}%`
              : '0'
          }
          detail={
            assessmentAttempts
              ? `${assessmentAttempts} attempts`
              : 'No attempts yet'
          }
          icon={ClipboardCheck}
          tone="violet"
        />

        <MetricCard
          label="Certificates"
          value={certificateCount}
          detail={
            certificateCount
              ? 'Certificates earned'
              : 'Complete a course to unlock'
          }
          icon={Award}
          tone="amber"
        />

      </section>


      {/* ===================================================
          CONTINUE LEARNING + PRACTICE
      =================================================== */}

      <section
        className="
          grid
          lg:grid-cols-[1.35fr_0.65fr]
          gap-5
        "
      >

        {/* CONTINUE LEARNING */}

        <div
          className="
            rounded-[24px]
            border
            border-[var(--ss-border)]
            bg-[var(--ss-card)]
            p-6
          "
        >

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
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#38d8d2]
                "
              >
                Continue Learning
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-[var(--ss-text)]
                "
              >
                Pick up where you left off
              </h2>
            </div>

            <BookOpen
              size={19}
              className="text-[var(--ss-text-muted)]"
            />

          </div>


          {currentCourse ? (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-[var(--ss-border)]
                bg-[var(--ss-surface-2)]
                p-5
              "
            >

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >

                <div>

                  <span
                    className="
                      inline-flex
                      rounded-lg
                      bg-blue-500/[0.08]
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-blue-300
                    "
                  >
                    {currentCourse.level ||
                      'Learning'}
                  </span>

                  <h3
                    className="
                      mt-3
                      text-lg
                      font-bold
                      text-[var(--ss-text)]
                    "
                  >
                    {currentCourse.title}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--ss-text-muted)]
                    "
                  >
                    Continue your current
                    learning path.
                  </p>

                </div>


                <Link
                  to={`/courses/${currentCourse.id}`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#238cf7]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-[var(--ss-text)]
                    transition
                    hover:bg-[#3298ff]
                  "
                >
                  Continue
                  <ArrowRight size={14} />
                </Link>

              </div>


              <div
                className="
                  mt-5
                "
              >

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                    text-xs
                  "
                >
                  <span className="text-[var(--ss-text-muted)]">
                    Course progress
                  </span>

                  <span
                    className="
                      font-bold
                      text-[var(--ss-text-soft)]
                    "
                  >
                    {Math.round(
                      currentCourseProgress
                    )}%
                  </span>
                </div>

                <div
                  className="
                    h-2
                    overflow-hidden
                    rounded-full
                    bg-slate-800
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-[#26d3cd]
                      to-[#268cf7]
                    "
                    style={{
                      width: `${Math.min(
                        100,
                        currentCourseProgress
                      )}%`,
                    }}
                  />
                </div>

              </div>

            </div>
          ) : (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-dashed
                border-[var(--ss-border)]
                bg-white/[0.02]
                p-7
                text-center
              "
            >
              <BookOpen
                size={25}
                className="
                  mx-auto
                  text-[var(--ss-text-muted)]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-[var(--ss-text-soft)]
                "
              >
                No active course yet
              </p>

              <Link
                to="/courses"
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-[#42ddd8]
                "
              >
                Explore courses
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

        </div>


        {/* PRACTICE */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-cyan-400/10
            bg-gradient-to-br
            from-[var(--ss-practice-start)]
            to-[var(--ss-practice-end)]
            p-6
          "
        >

          <div
            className="
              absolute
              -right-12
              -top-12
              h-36
              w-36
              rounded-full
              bg-cyan-400/[0.08]
              blur-2xl
            "
          />

          <div className="relative">

            <div
              className="
                h-11
                w-11
                rounded-xl
                flex
                items-center
                justify-center
                bg-cyan-400/[0.09]
                text-[#40ded8]
              "
            >
              <Video size={20} />
            </div>


            <p
              className="
                mt-5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[#40ded8]
              "
            >
              Practice
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-[var(--ss-text)]
              "
            >
              Improve through practice
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[var(--ss-text-muted)]
              "
            >
              Open the practice workspace
              and continue improving your
              signing skills.
            </p>


            <Link
              to="/practice"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#2bd3ce]
                px-4
                py-2.5
                text-xs
                font-bold
                text-[#06131a]
                transition
                hover:bg-[#3ce0db]
              "
            >
              Start Practice
              <ArrowRight size={14} />
            </Link>

          </div>

        </div>

      </section>



      {/* ===================================================
          PRACTICE STREAK
      =================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-[var(--ss-border)]
          bg-[var(--ss-card)]
          p-5
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Flame
                size={18}
                className="text-[var(--ss-copper)]"
              />

              <h2
                className="
                  text-base
                  font-semibold
                  text-[var(--ss-text)]
                "
              >
                Practice Streak
              </h2>
            </div>

            <p
              className="
                mt-1
                text-xs
                text-[var(--ss-text-soft)]
              "
            >
              Practice each day to keep your streak going.
            </p>
          </div>


          <div
            className="
              text-left
              sm:text-right
            "
          >
            <p
              className="
                text-2xl
                font-bold
                text-[var(--ss-text)]
              "
            >
              {streakData.current}
            </p>

            <p
              className="
                text-[10px]
                uppercase
                tracking-wide
                text-[var(--ss-text-muted)]
              "
            >
              Current streak
            </p>
          </div>
        </div>


        <div
          className="
            mt-5
            grid
            grid-cols-7
            gap-2
          "
        >
          {streakData.lastSevenDays.map(
            (day) => (
              <div
                key={day.key}
                className="
                  flex
                  flex-col
                  items-center
                  gap-2
                "
              >
                <div
                  className={`
                    h-9
                    w-9
                    rounded-full
                    flex
                    items-center
                    justify-center
                    border
                    text-xs
                    font-semibold
                    ${
                      day.active
                        ? 'bg-[var(--ss-primary)] text-[var(--ss-primary-contrast)] border-[var(--ss-primary)]'
                        : 'bg-[var(--ss-surface-2)] text-[var(--ss-text-muted)] border-[var(--ss-border)]'
                    }
                  `}
                >
                  {day.active ? (
                    <Flame size={14} />
                  ) : (
                    day.label
                  )}
                </div>

                <span
                  className="
                    text-[10px]
                    text-[var(--ss-text-muted)]
                  "
                >
                  {day.label}
                </span>
              </div>
            )
          )}
        </div>


        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            rounded-xl
            bg-[var(--ss-surface-2)]
            px-4
            py-3
          "
        >
          <span
            className="
              text-xs
              text-[var(--ss-text-soft)]
            "
          >
            Best streak
          </span>

          <span
            className="
              text-sm
              font-semibold
              text-[var(--ss-copper)]
            "
          >
            {streakData.best}
            {' '}
            day{streakData.best === 1 ? '' : 's'}
          </span>
        </div>
      </section>


      {/* ===================================================
          WEEKLY ACTIVITY + RECENT ACTIVITY
      =================================================== */}

      <section
        className="
          grid
          lg:grid-cols-[1.3fr_0.7fr]
          gap-5
        "
      >

        {/* WEEKLY ACTIVITY */}

        <div
          className="
            rounded-[24px]
            border
            border-[var(--ss-border)]
            bg-[var(--ss-card)]
            p-6
          "
        >

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
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#38d8d2]
                "
              >
                Weekly Activity
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-[var(--ss-text)]
                "
              >
                Practice consistency
              </h2>

            </div>

            <CalendarDays
              size={18}
              className="text-[var(--ss-text-muted)]"
            />

          </div>


          <div
            className="
              mt-7
              h-[190px]
              flex
              items-end
              gap-3
            "
          >

            {weekly.map((item) => {
              const height =
                Math.max(
                  5,
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
                    items-center
                    justify-end
                    gap-2
                  "
                >

                  <span
                    className="
                      text-[9px]
                      font-medium
                      text-[var(--ss-text-muted)]
                    "
                  >
                    {item.minutes}m
                  </span>

                  <div
                    className="
                      w-full
                      max-w-[46px]
                      h-[135px]
                      rounded-xl
                      bg-[var(--ss-surface-2)]
                      flex
                      items-end
                      overflow-hidden
                    "
                  >
                    <div
                      className="
                        w-full
                        rounded-xl
                        bg-gradient-to-t
                        from-[#278df6]
                        to-[#2dd5cf]
                      "
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />
                  </div>

                  <span
                    className="
                      text-[10px]
                      text-[var(--ss-text-muted)]
                    "
                  >
                    {item.day}
                  </span>

                </div>
              );
            })}

          </div>

        </div>


        {/* RECENT ACTIVITY */}

        <div
          className="
            rounded-[24px]
            border
            border-[var(--ss-border)]
            bg-[var(--ss-card)]
            p-6
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#38d8d2]
                "
              >
                Recent Activity
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-[var(--ss-text)]
                "
              >
                Your latest sessions
              </h2>

            </div>

            <Clock3
              size={18}
              className="text-[var(--ss-text-muted)]"
            />

          </div>


          <div
            className="
              mt-6
              space-y-3
            "
          >

            {recentActivity.length ? (
              recentActivity.map(
                (session) => (
                  <div
                    key={session.id}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-[var(--ss-border)]
                      bg-[var(--ss-surface-2)]
                      p-3.5
                    "
                  >

                    <div
                      className="
                        h-9
                        w-9
                        shrink-0
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        bg-cyan-400/[0.07]
                        text-[#3bd8d2]
                      "
                    >
                      <Video size={16} />
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          text-xs
                          font-semibold
                          text-[var(--ss-text-soft)]
                        "
                      >
                        {session.target_gesture
                          ? `Practiced ${session.target_gesture}`
                          : 'Practice session'}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-[var(--ss-text-muted)]
                        "
                      >
                        {Number(
                          session.attempts ||
                          0
                        )}{' '}
                        attempts
                      </p>
                    </div>

                    <CheckCircle2
                      size={15}
                      className="text-[var(--ss-text-muted)]"
                    />

                  </div>
                )
              )
            ) : (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-[var(--ss-border)]
                  p-6
                  text-center
                "
              >

                <Activity
                  size={21}
                  className="
                    mx-auto
                    text-[var(--ss-text-muted)]
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-[var(--ss-text-muted)]
                  "
                >
                  Your recent practice
                  sessions will appear here.
                </p>

              </div>
            )}

          </div>

        </div>

      </section>

    </div>
  );
}
