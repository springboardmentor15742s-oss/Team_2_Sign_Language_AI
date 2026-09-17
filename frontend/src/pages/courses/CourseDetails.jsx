import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { courseService } from '../../services/courseService';
import certificateService from '../../services/certificateService';
import { useToast } from '../../hooks/useToast';

export default function CourseDetails() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [certificateBusy, setCertificateBusy] = useState(false);

  const load = async () => {
    setLoading(true);

    const [courseResult, lessonsResult, enrollmentResult, certificateResult] =
      await Promise.allSettled([
        courseService.getCourse(id),
        courseService.getLessons(id),
        courseService.getEnrolled(),
        certificateService.getCertificates(),
      ]);

    if (courseResult.status === 'fulfilled') {
      setCourse(courseResult.value.data);
    }

    if (lessonsResult.status === 'fulfilled') {
      setLessons(lessonsResult.value.data || []);
    }

    if (enrollmentResult.status === 'fulfilled') {
      const enrolledCourses = enrollmentResult.value.data || [];

      const currentEnrollment = enrolledCourses.find(
        (item) => Number(item.course?.id) === Number(id)
      );

      setEnrollment(currentEnrollment || null);
    }

    if (certificateResult.status === 'fulfilled') {
      const data = certificateResult.value;
      setCertificates(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const certificate = useMemo(
    () =>
      certificates.find(
        (item) => Number(item.course_id) === Number(id)
      ) || null,
    [certificates, id]
  );

  const progress = Number(enrollment?.progress_percent || 0);
  const completed = progress >= 100;

  const enroll = async () => {
    setBusy(true);

    try {
      await courseService.enroll(id);

      addToast('Course enrolled successfully', 'success');
      await load();
    } catch (error) {
      addToast(
        error.response?.data?.detail || 'Enrollment failed',
        'error'
      );
    } finally {
      setBusy(false);
    }
  };

  const generateCertificate = async () => {
    if (!completed) {
      addToast(
        'Complete all lessons before generating your certificate.',
        'error'
      );
      return;
    }

    setCertificateBusy(true);

    try {
      await certificateService.generateCertificate(id);

      addToast('Certificate generated successfully 🎓', 'success');

      await load();
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          'Certificate could not be generated.',
        'error'
      );
    } finally {
      setCertificateBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2
          size={30}
          className="animate-spin mx-auto text-[#16d4d0]"
        />
        <p className="mt-4 text-sm text-slate-500">
          Loading course...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-slate-400">
        Course not found.
      </div>
    );
  }

  const image =
    course.thumbnail_url ||
    (course.level === 'advanced'
      ? '/course-art/advanced.svg'
      : course.level === 'intermediate'
      ? '/course-art/vocabulary.svg'
      : '/course-art/alphabet.svg');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <Breadcrumb
        items={[
          { label: 'Courses', path: '/courses' },
          { label: course.title },
        ]}
      />

      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition"
      >
        <ArrowLeft size={16} />
        Back to courses
      </Link>

      <section className="overflow-hidden rounded-[26px] border border-slate-800 bg-[#0d131e]">
        <div className="relative h-64 lg:h-[360px]">
          <img
            src={image}
            alt={course.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#090e16] via-[#090e16]/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
            <Badge variant="primary" className="mb-4">
              {course.level}
            </Badge>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap gap-5 mt-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <Clock size={15} />
                {course.duration_minutes || 0} min
              </span>

              <span className="flex items-center gap-2">
                <BookOpen size={15} />
                {lessons.length} lessons
              </span>

              {completed && (
                <span className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 size={15} />
                  Course completed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-7 md:p-9">
          <p className="max-w-3xl text-slate-400 leading-7">
            {course.description ||
              'A structured SignSpeak learning pathway.'}
          </p>

          {enrollment && (
            <div className="mt-7 rounded-2xl border border-slate-800 bg-[#090f18] p-5">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-bold">
                    Course Progress
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {completed
                      ? 'All required lessons completed'
                      : 'Continue your learning pathway'}
                  </p>
                </div>

                <strong
                  className={
                    completed
                      ? 'text-emerald-300 text-xl'
                      : 'text-[#20d8d3] text-xl'
                  }
                >
                  {progress}%
                </strong>
              </div>

              <div className="h-2.5 rounded-full bg-slate-800 mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completed
                      ? 'bg-emerald-400'
                      : 'bg-[#16c8c4]'
                  }`}
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-7">
            {!enrollment ? (
              <Button onClick={enroll} loading={busy}>
                Enroll in Course
              </Button>
            ) : !completed ? (
              <Link
                to={
                  lessons[0]
                    ? `/lesson/${course.id}/${lessons[0].id}`
                    : '/courses'
                }
              >
                <Button>
                  <BookOpen size={16} />
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <Link
                to={
                  lessons[0]
                    ? `/lesson/${course.id}/${lessons[0].id}`
                    : '/courses'
                }
              >
                <Button>
                  <BookOpen size={16} />
                  Review Course
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {enrollment && (
        <section
          className={`relative overflow-hidden rounded-[26px] border p-6 md:p-7 ${
            completed
              ? 'border-[#16d4d0]/25 bg-gradient-to-br from-[#0d1b20] to-[#0d131e]'
              : 'border-slate-800 bg-[#0d131e]'
          }`}
        >
          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#16d4d0]/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-13 h-13 p-3 rounded-2xl border ${
                  completed
                    ? 'bg-[#16d4d0]/10 border-[#16d4d0]/20'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <Award
                  size={25}
                  className={
                    completed
                      ? 'text-[#16d4d0]'
                      : 'text-slate-500'
                  }
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    Course Certificate
                  </h2>

                  {certificate && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                      <ShieldCheck size={13} />
                      Earned
                    </span>
                  )}
                </div>

                {!completed && (
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Complete all lessons in this course to unlock
                    your verified SignSpeak completion certificate.
                  </p>
                )}

                {completed && !certificate && (
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    You have completed this course. Your verified
                    completion certificate is ready to be generated.
                  </p>
                )}

                {certificate && (
                  <>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                      Your completion certificate has been issued
                      and added to your SignSpeak credentials.
                    </p>

                    <p className="mt-3 font-mono text-xs text-slate-500">
                      {certificate.certificate_number}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {!completed ? (
                <div className="rounded-xl border border-slate-800 bg-black/10 px-4 py-3 text-sm text-slate-500">
                  {progress}% / 100% complete
                </div>
              ) : certificate ? (
                <Link
                  to="/certificates"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16d4d0] px-5 py-3 text-sm font-bold text-[#071014] hover:brightness-110 transition"
                >
                  <Award size={17} />
                  View Certificate
                </Link>
              ) : (
                <button
                  onClick={generateCertificate}
                  disabled={certificateBusy}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16d4d0] px-5 py-3 text-sm font-bold text-[#071014] hover:brightness-110 disabled:opacity-60 transition"
                >
                  {certificateBusy ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Sparkles size={17} />
                  )}

                  {certificateBusy
                    ? 'Generating...'
                    : 'Generate Certificate'}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16d4d0]">
              Learning Path
            </p>

            <h3 className="mt-1 font-semibold text-white">
              Course Lessons
            </h3>
          </div>

          <span className="text-xs text-slate-500">
            {lessons.length} lessons
          </span>
        </div>

        <div className="space-y-3">
          {lessons.length ? (
            lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition"
              >
                <div className="h-10 w-10 shrink-0 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">
                    {lesson.title}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {lesson.duration_minutes || 0} min
                  </p>
                </div>

                {enrollment ? (
                  <Link
                    to={`/lesson/${course.id}/${lesson.id}`}
                    className="text-sm font-semibold text-[#20d8d3] hover:text-[#5cf1ec]"
                  >
                    Open
                  </Link>
                ) : (
                  <span className="text-xs text-slate-600">
                    Enroll to access
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No lessons have been published for this course yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
