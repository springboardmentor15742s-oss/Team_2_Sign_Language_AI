import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flame,
  Hand,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/EmptyState';

import { profileService } from '../../services/profileService';
import { courseService } from '../../services/courseService';
import { reportService } from '../../services/reportService';

import { useAuth } from '../../hooks/useAuth';


/* =========================================================
   HELPERS
========================================================= */

const safeNumber = (value, fallback = 0) => {

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;

};


const formatDate = (value) => {

  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

};


const roleLabel = (role) => {

  if (!role) {
    return 'Learner';
  }

  if (role === 'student') {
    return 'Learner';
  }

  if (role === 'accessibility_trainer') {
    return 'Accessibility Trainer';
  }

  return role
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

};


/* =========================================================
   PROFILE PAGE
========================================================= */

export default function Profile() {

  const { updateUser } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [enrolled, setEnrolled] =
    useState([]);

  const [stats, setStats] =
    useState({
      progress: null,
      assessment: null,
      accuracy: null,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* =======================================================
     LOAD REAL PROFILE DATA
  ======================================================= */

  useEffect(() => {

    let active = true;

    const loadProfile = async () => {

      try {

        setLoading(true);
        setError('');

        const results =
          await Promise.allSettled([
            profileService.getProfile(),
            courseService.getEnrolled(),
            reportService.getProgressReport(),
            reportService.getAssessmentReport(),
            reportService.getAccuracyReport(),
          ]);

        if (!active) {
          return;
        }


        /* PROFILE */

        if (
          results[0].status ===
          'fulfilled'
        ) {

          const profileData =
            results[0].value.data;

          setProfile(profileData);

          updateUser(profileData);

        } else {

          setError(
            'Unable to load your profile.'
          );

        }


        /* ENROLLED COURSES */

        if (
          results[1].status ===
          'fulfilled'
        ) {

          setEnrolled(
            Array.isArray(
              results[1].value.data
            )
              ? results[1].value.data
              : []
          );

        }


        /* ANALYTICS */

        setStats({

          progress:
            results[2].status ===
            'fulfilled'
              ? results[2].value.data
              : null,

          assessment:
            results[3].status ===
            'fulfilled'
              ? results[3].value.data
              : null,

          accuracy:
            results[4].status ===
            'fulfilled'
              ? results[4].value.data
              : null,

        });

      } catch (err) {

        console.error(
          'Profile loading failed:',
          err
        );

        if (active) {

          setError(
            'Unable to load your profile.'
          );

        }

      } finally {

        if (active) {
          setLoading(false);
        }

      }

    };


    loadProfile();


    return () => {
      active = false;
    };

  }, [updateUser]);


  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const goals =
    Array.isArray(
      profile?.learning_goals
    )
      ? profile.learning_goals
      : [];


  const learningLevel =
    profile?.learning_level ||
    'Beginner';


  const preferredLanguage =
    profile?.preferred_language ||
    'ASL';


  const lessonsCompleted =
    safeNumber(
      stats?.progress
        ?.lessons_completed
    );


  const practiceSessions =
    safeNumber(
      stats?.progress
        ?.practice_sessions
    );


  const accuracy =
    safeNumber(
      stats?.accuracy
        ?.accuracy_percent
    );


  const assessmentAttempts =
    safeNumber(
      stats?.assessment
        ?.attempts
    );


  const assessmentAverage =
    safeNumber(
      stats?.assessment
        ?.average_score
    );


  const assessmentsPassed =
    safeNumber(
      stats?.assessment
        ?.passed
    );


  const xp =
    safeNumber(
      profile?.xp_points
    );


  const streak =
    safeNumber(
      profile?.current_streak
    );


  const overallCourseProgress =
    useMemo(() => {

      if (!enrolled.length) {
        return 0;
      }

      const total =
        enrolled.reduce(
          (sum, enrollment) =>
            sum +
            safeNumber(
              enrollment
                ?.progress_percent
            ),
          0
        );

      return Math.round(
        total / enrolled.length
      );

    }, [enrolled]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div
        className="
          min-h-[65vh]
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <Loader2
            size={36}
            className="
              mx-auto
              animate-spin
              text-[#20d8d3]
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-slate-500
            "
          >
            Loading your learning profile...
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !profile
  ) {

    return (

      <div
        className="
          max-w-3xl
          mx-auto
          py-10
        "
      >

        <Breadcrumb
          items={[
            {
              label: 'Profile',
            },
          ]}
        />

        <Card
          padding="large"
          className="mt-6"
        >

          <div className="text-center">

            <User
              size={38}
              className="
                mx-auto
                text-slate-600
              "
            />

            <h2
              className="
                mt-4
                text-xl
                font-bold
                text-white
              "
            >
              Profile unavailable
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              {
                error ||
                'Your profile could not be loaded.'
              }
            </p>

          </div>

        </Card>

      </div>

    );

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div
      className="
        max-w-[1280px]
        mx-auto
        space-y-6
      "
    >

      <Breadcrumb
        items={[
          {
            label: 'Account',
          },
          {
            label: 'Profile',
          },
        ]}
      />


      {/* ===================================================
          PROFILE HERO
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-[#0c1820]
          via-[#111827]
          to-[#1c1633]
        "
      >

        <div
          className="
            absolute
            -right-20
            -top-20
            h-72
            w-72
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-1/3
            top-0
            h-56
            w-56
            rounded-full
            bg-violet-500/10
            blur-3xl
          "
        />


        <div
          className="
            relative
            h-32
            sm:h-40
            border-b
            border-white/[0.04]
            bg-gradient-to-r
            from-cyan-500/[0.08]
            via-transparent
            to-violet-500/[0.08]
          "
        />


        <div
          className="
            relative
            px-5
            pb-6
            sm:px-7
            lg:px-8
          "
        >

          <div
            className="
              -mt-14
              flex
              flex-col
              lg:flex-row
              lg:items-end
              lg:justify-between
              gap-5
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-end
                gap-5
              "
            >

              {/* AVATAR */}

              <div
                className="
                  h-28
                  w-28
                  shrink-0
                  rounded-3xl
                  border-4
                  border-[#111827]
                  bg-[#111827]
                  shadow-xl
                  overflow-hidden
                "
              >

                <div
                  className="
                    h-full
                    w-full
                    rounded-[20px]
                    bg-gradient-to-br
                    from-cyan-500/15
                    to-violet-500/10
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                  "
                >

                  {
                    profile.avatar_url ? (

                      <img
                        src={
                          profile.avatar_url
                        }
                        alt={
                          profile.full_name ||
                          'Profile'
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    ) : (

                      <User
                        size={42}
                        className="
                          text-[#20d8d3]
                        "
                      />

                    )
                  }

                </div>

              </div>


              {/* IDENTITY */}

              <div className="pb-1">

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  <h1
                    className="
                      text-2xl
                      sm:text-3xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    {
                      profile.full_name ||
                      'SignSpeak Learner'
                    }
                  </h1>


                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      border
                      border-cyan-500/20
                      bg-cyan-500/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#20d8d3]
                    "
                  >

                    <Sparkles size={11} />

                    {
                      roleLabel(
                        profile.role
                      )
                    }

                  </span>

                </div>


                <p
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-x-2
                    gap-y-1
                    text-sm
                    text-slate-400
                  "
                >

                  <span>
                    {learningLevel}
                  </span>

                  <span
                    className="
                      text-slate-700
                    "
                  >
                    •
                  </span>

                  <span>
                    {preferredLanguage}
                  </span>

                  <span
                    className="
                      text-slate-700
                    "
                  >
                    •
                  </span>

                  <span>
                    {
                      enrolled.length
                    }{' '}
                    {
                      enrolled.length === 1
                        ? 'course'
                        : 'courses'
                    }
                  </span>

                </p>

              </div>

            </div>


            {/* EDIT BUTTON */}

            <Link
              to="/profile/edit"
              className="shrink-0"
            >

              <Button
                variant="outline"
              >

                <Pencil size={15} />

                Edit Profile

              </Button>

            </Link>

          </div>


          {/* QUICK ACCOUNT METRICS */}

          <div
            className="
              mt-7
              grid
              grid-cols-2
              lg:grid-cols-4
              gap-3
            "
          >

            <HeroMetric
              icon={Zap}
              value={xp}
              label="XP Points"
            />

            <HeroMetric
              icon={Flame}
              value={streak}
              label="Day Streak"
            />

            <HeroMetric
              icon={BookOpen}
              value={lessonsCompleted}
              label="Lessons Completed"
            />

            <HeroMetric
              icon={Hand}
              value={practiceSessions}
              label="Practice Sessions"
            />

          </div>

        </div>

      </section>


      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div
        className="
          grid
          xl:grid-cols-[0.75fr_1.6fr]
          gap-6
          items-start
        "
      >


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="space-y-6">


          {/* ABOUT */}

          <Card padding="large">

            <SectionHeading
              icon={User}
              title="About"
              subtitle="Account information"
            />


            <div
              className="
                mt-5
                space-y-4
              "
            >

              <InfoRow
                icon={Mail}
                label="Email"
                value={
                  profile.email ||
                  'Not available'
                }
              />

              <InfoRow
                icon={MapPin}
                label="Location"
                value={
                  profile.location ||
                  'Not set'
                }
              />

              <InfoRow
                icon={CalendarDays}
                label="Member since"
                value={
                  formatDate(
                    profile.created_at
                  )
                }
              />

              <InfoRow
                icon={Languages}
                label="Sign language"
                value={
                  preferredLanguage
                }
              />

            </div>


            {
              profile.bio && (

                <div
                  className="
                    mt-5
                    border-t
                    border-slate-800
                    pt-5
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-slate-600
                    "
                  >
                    Bio
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    {profile.bio}
                  </p>

                </div>

              )
            }

          </Card>


          {/* LEARNING PROFILE */}

          <Card padding="large">

            <SectionHeading
              icon={Target}
              title="Learning Profile"
              subtitle="Your current learning setup"
            />


            <div
              className="
                mt-5
                space-y-5
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-600
                  "
                >
                  Current Level
                </p>

                <div className="mt-2">

                  <Badge variant="success">
                    {learningLevel}
                  </Badge>

                </div>

              </div>


              <div>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-600
                  "
                >
                  Preferred Sign Language
                </p>

                <div className="mt-2">

                  <Badge>
                    {preferredLanguage}
                  </Badge>

                </div>

              </div>


              <div>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-600
                  "
                >
                  Learning Goals
                </p>


                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {
                    goals.length ? (

                      goals.map(
                        (goal) => (

                          <Badge
                            key={goal}
                            variant="gray"
                          >
                            {goal}
                          </Badge>

                        )
                      )

                    ) : (

                      <span
                        className="
                          text-sm
                          text-slate-500
                        "
                      >
                        No goals selected yet.
                      </span>

                    )
                  }

                </div>

              </div>

            </div>

          </Card>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div className="space-y-6">


          {/* PERFORMANCE */}

          <Card padding="large">

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

              <SectionHeading
                icon={TrendingUp}
                title="Learning Performance"
                subtitle="Live progress from your SignSpeak activity"
              />


              <Link
                to="/reports"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-[#20d8d3]
                  hover:text-cyan-300
                "
              >
                Full analytics

                <ChevronRight
                  size={14}
                />
              </Link>

            </div>


            <div
              className="
                mt-6
                grid
                sm:grid-cols-2
                lg:grid-cols-4
                gap-3
              "
            >

              <PerformanceMetric
                icon={Target}
                value={`${accuracy}%`}
                label="Gesture Accuracy"
              />

              <PerformanceMetric
                icon={Trophy}
                value={`${assessmentAverage}%`}
                label="Assessment Average"
              />

              <PerformanceMetric
                icon={Award}
                value={assessmentsPassed}
                label="Assessments Passed"
              />

              <PerformanceMetric
                icon={BookOpen}
                value={`${overallCourseProgress}%`}
                label="Course Progress"
              />

            </div>


            {/* PERFORMANCE BARS */}

            <div
              className="
                mt-6
                grid
                md:grid-cols-2
                gap-4
              "
            >

              <ProgressPanel
                title="Gesture Recognition"
                value={accuracy}
                description="Accuracy recorded from your practice history."
              />

              <ProgressPanel
                title="Assessment Performance"
                value={assessmentAverage}
                description={
                  assessmentAttempts
                    ? `${assessmentAttempts} assessment attempt${
                        assessmentAttempts === 1
                          ? ''
                          : 's'
                      } recorded.`
                    : 'Complete an assessment to establish your score.'
                }
              />

            </div>

          </Card>


          {/* COURSES */}

          <Card padding="large">

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                mb-5
              "
            >

              <SectionHeading
                icon={BookOpen}
                title="Enrolled Courses"
                subtitle="Continue your active learning paths"
              />


              <Link
                to="/courses"
                className="
                  text-xs
                  font-semibold
                  text-[#20d8d3]
                  hover:text-cyan-300
                "
              >
                Browse courses
              </Link>

            </div>


            {
              enrolled.length ? (

                <div className="space-y-3">

                  {
                    enrolled.map(
                      (enrollment) => {

                        const course =
                          enrollment.course ||
                          {};

                        const progress =
                          Math.min(
                            100,
                            Math.max(
                              0,
                              safeNumber(
                                enrollment
                                  .progress_percent
                              )
                            )
                          );


                        return (

                          <Link
                            key={
                              enrollment
                                .enrollment_id ||
                              course.id
                            }
                            to={
                              `/course/${course.id}`
                            }
                            className="
                              group
                              block
                              rounded-2xl
                              border
                              border-slate-800
                              bg-[#11161f]
                              p-4
                              hover:border-cyan-500/20
                              hover:bg-cyan-500/[0.025]
                              transition-all
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

                              <div
                                className="
                                  min-w-0
                                "
                              >

                                <p
                                  className="
                                    truncate
                                    font-semibold
                                    text-slate-200
                                    group-hover:text-white
                                  "
                                >
                                  {
                                    course.title ||
                                    'Course'
                                  }
                                </p>


                                <div
                                  className="
                                    mt-1.5
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                    text-xs
                                    text-slate-600
                                  "
                                >

                                  <span>
                                    {
                                      course.level ||
                                      'Learning Path'
                                    }
                                  </span>

                                  <span>•</span>

                                  <span>
                                    {
                                      progress
                                    }% complete
                                  </span>

                                </div>

                              </div>


                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  shrink-0
                                "
                              >

                                <strong
                                  className="
                                    text-sm
                                    text-[#20d8d3]
                                  "
                                >
                                  {progress}%
                                </strong>

                                <ChevronRight
                                  size={15}
                                  className="
                                    text-slate-600
                                    group-hover:text-[#20d8d3]
                                  "
                                />

                              </div>

                            </div>


                            <div
                              className="
                                mt-4
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-slate-800
                              "
                            >

                              <div
                                className="
                                  h-full
                                  rounded-full
                                  bg-[#16c8c4]
                                  transition-all
                                "
                                style={{
                                  width:
                                    `${progress}%`,
                                }}
                              />

                            </div>

                          </Link>

                        );

                      }
                    )
                  }

                </div>

              ) : (

                <EmptyState
                  icon={BookOpen}
                  title="No enrolled courses"
                  description="Enroll in a course to start building your learning history."
                  action={

                    <Link to="/courses">

                      <Button size="sm">
                        Explore Courses
                      </Button>

                    </Link>

                  }
                />

              )
            }

          </Card>


          {/* ASSESSMENT */}

          <Card padding="large">

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                mb-5
              "
            >

              <SectionHeading
                icon={Award}
                title="Assessment Summary"
                subtitle="Your recorded assessment performance"
              />


              <Link
                to="/assessments"
                className="
                  text-xs
                  font-semibold
                  text-[#20d8d3]
                  hover:text-cyan-300
                "
              >
                Assessments
              </Link>

            </div>


            {
              assessmentAttempts ? (

                <div
                  className="
                    grid
                    sm:grid-cols-3
                    gap-3
                  "
                >

                  <PerformanceMetric
                    icon={Award}
                    value={
                      assessmentAttempts
                    }
                    label="Attempts"
                  />

                  <PerformanceMetric
                    icon={Target}
                    value={
                      `${assessmentAverage}%`
                    }
                    label="Average Score"
                  />

                  <PerformanceMetric
                    icon={Trophy}
                    value={
                      assessmentsPassed
                    }
                    label="Passed"
                  />

                </div>

              ) : (

                <EmptyState
                  icon={Award}
                  title="No assessments yet"
                  description="Complete an assessment to start measuring your proficiency."
                  action={

                    <Link
                      to="/assessments"
                    >

                      <Button size="sm">
                        View Assessments
                      </Button>

                    </Link>

                  }
                />

              )
            }

          </Card>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   COMPONENTS
========================================================= */

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}) {

  return (

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
          shrink-0
          rounded-xl
          border
          border-cyan-500/10
          bg-cyan-500/10
          text-[#20d8d3]
          flex
          items-center
          justify-center
        "
      >

        <Icon size={18} />

      </div>


      <div>

        <h2
          className="
            text-sm
            font-bold
            text-white
          "
        >
          {title}
        </h2>

        {
          subtitle && (

            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >
              {subtitle}
            </p>

          )
        }

      </div>

    </div>

  );

}


function HeroMetric({
  icon: Icon,
  value,
  label,
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-black/10
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        <Icon
          size={15}
          className="
            text-[#20d8d3]
          "
        />

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          {label}
        </p>

      </div>

      <p
        className="
          mt-2
          text-xl
          font-bold
          text-white
        "
      >
        {value}
      </p>

    </div>

  );

}


function PerformanceMetric({
  icon: Icon,
  value,
  label,
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-[#11161f]
        p-4
      "
    >

      <div
        className="
          h-8
          w-8
          rounded-lg
          bg-cyan-500/10
          text-[#20d8d3]
          flex
          items-center
          justify-center
        "
      >

        <Icon size={15} />

      </div>

      <p
        className="
          mt-4
          text-xl
          font-bold
          text-white
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          text-slate-500
        "
      >
        {label}
      </p>

    </div>

  );

}


function InfoRow({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div
      className="
        flex
        items-start
        gap-3
      "
    >

      <div
        className="
          mt-0.5
          h-8
          w-8
          shrink-0
          rounded-lg
          bg-slate-800/70
          text-slate-400
          flex
          items-center
          justify-center
        "
      >

        <Icon size={14} />

      </div>


      <div
        className="
          min-w-0
        "
      >

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-slate-600
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            break-words
            text-sm
            text-slate-300
          "
        >
          {value}
        </p>

      </div>

    </div>

  );

}


function ProgressPanel({
  title,
  value,
  description,
}) {

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        safeNumber(value)
      )
    );


  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-[#11161f]
        p-4
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

        <p
          className="
            text-sm
            font-semibold
            text-slate-300
          "
        >
          {title}
        </p>

        <span
          className="
            text-sm
            font-bold
            text-[#20d8d3]
          "
        >
          {progress}%
        </span>

      </div>


      <div
        className="
          mt-3
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
            bg-[#16c8c4]
            transition-all
          "
          style={{
            width: `${progress}%`,
          }}
        />

      </div>


      <p
        className="
          mt-3
          text-xs
          leading-5
          text-slate-600
        "
      >
        {description}
      </p>

    </div>

  );

}