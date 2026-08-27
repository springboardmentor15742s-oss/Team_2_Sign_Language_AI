import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  Play,
  Sparkles,
  Target,
  Video,
} from 'lucide-react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';


export default function Lesson() {

  const {
    courseId,
    lessonId,
  } = useParams();

  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [course, setCourse] = useState(null);

  const [lesson, setLesson] = useState(null);

  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [completing, setCompleting] = useState(false);

  const [completed, setCompleted] = useState(false);


  /* =========================================================
     LOAD REAL COURSE + LESSON DATA
  ========================================================= */

  useEffect(() => {

    let active = true;

    const loadLessonData = async () => {

      try {

        setLoading(true);
        setError('');

        const [
          courseResponse,
          lessonsResponse,
          lessonResponse,
        ] = await Promise.all([
          courseService.getCourse(courseId),
          courseService.getLessons(courseId),
          courseService.getLesson(
            courseId,
            lessonId
          ),
        ]);

        if (!active) {
          return;
        }

        setCourse(courseResponse.data);

        setLessons(
          Array.isArray(lessonsResponse.data)
            ? lessonsResponse.data
            : []
        );

        setLesson(lessonResponse.data);

        setCompleted(false);

      } catch (err) {

        console.error(
          'Lesson loading failed:',
          err
        );

        if (!active) {
          return;
        }

        const detail =
          err?.response?.data?.detail;

        setError(
          typeof detail === 'string'
            ? detail
            : 'Unable to load this lesson.'
        );

      } finally {

        if (active) {
          setLoading(false);
        }

      }

    };

    loadLessonData();

    return () => {
      active = false;
    };

  }, [
    courseId,
    lessonId,
  ]);


  /* =========================================================
     CURRENT LESSON POSITION
  ========================================================= */

  const lessonIndex = useMemo(() => {

    return lessons.findIndex(
      (item) =>
        String(item.id) ===
        String(lessonId)
    );

  }, [
    lessons,
    lessonId,
  ]);


  const nextLesson =
    lessonIndex >= 0
      ? lessons[lessonIndex + 1]
      : null;


  const previousLesson =
    lessonIndex > 0
      ? lessons[lessonIndex - 1]
      : null;


  const lessonNumber =
    lessonIndex >= 0
      ? lessonIndex + 1
      : 1;


  /* =========================================================
     LESSON DURATION
  ========================================================= */

  const duration = useMemo(() => {

    if (!lesson) {
      return 'Self-paced';
    }

    const minutes =
      lesson.duration_minutes ||
      lesson.duration;

    return minutes
      ? `${minutes} min`
      : 'Self-paced';

  }, [lesson]);


  /* =========================================================
     VIDEO
  ========================================================= */

  const videoUrl =
    lesson?.video_url ||
    lesson?.videoUrl ||
    null;


  const getYouTubeEmbedUrl = (url) => {

    if (!url) {
      return null;
    }

    try {

      const parsedUrl = new URL(url);

      /*
       * Standard YouTube URL
       * https://www.youtube.com/watch?v=VIDEO_ID
       */
      if (
        parsedUrl.hostname.includes('youtube.com') &&
        parsedUrl.pathname === '/watch'
      ) {

        const videoId =
          parsedUrl.searchParams.get('v');

        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : null;
      }


      /*
       * Short YouTube URL
       * https://youtu.be/VIDEO_ID
       */
      if (
        parsedUrl.hostname === 'youtu.be' ||
        parsedUrl.hostname === 'www.youtu.be'
      ) {

        const videoId =
          parsedUrl.pathname
            .split('/')
            .filter(Boolean)[0];

        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : null;
      }


      /*
       * YouTube Shorts
       * https://youtube.com/shorts/VIDEO_ID
       */
      if (
        parsedUrl.hostname.includes('youtube.com') &&
        parsedUrl.pathname.startsWith('/shorts/')
      ) {

        const parts =
          parsedUrl.pathname
            .split('/')
            .filter(Boolean);

        const videoId = parts[1];

        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : null;
      }


      /*
       * Already an embed URL
       */
      if (
        parsedUrl.hostname.includes('youtube.com') &&
        parsedUrl.pathname.startsWith('/embed/')
      ) {
        return url;
      }


      return null;

    } catch {

      return null;

    }

  };


  const youtubeEmbedUrl =
    getYouTubeEmbedUrl(videoUrl);


  const isDirectVideo =
    Boolean(
      videoUrl &&
      !youtubeEmbedUrl
    );


  /* =========================================================
     MARK LESSON COMPLETE
  ========================================================= */

  const completeLesson = async () => {

    try {

      setCompleting(true);

      await lessonService.completeLesson(
        lessonId
      );

      setCompleted(true);

    } catch (err) {

      console.error(
        'Lesson completion failed:',
        err
      );

      const detail =
        err?.response?.data?.detail;

      alert(
        typeof detail === 'string'
          ? detail
          : 'Unable to mark lesson complete.'
      );

    } finally {

      setCompleting(false);

    }

  };


  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {

    return (

      <div
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <Loader2
            size={34}
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
            Loading your lesson...
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (
    error ||
    !course ||
    !lesson
  ) {

    return (

      <div
        className="
          max-w-3xl
          mx-auto
          py-10
        "
      >

        <Card padding="large">

          <div className="text-center">

            <BookOpen
              size={34}
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
              Lesson unavailable
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
                'This lesson could not be loaded.'
              }
            </p>

            <Link
              to="/courses"
              className="
                mt-5
                inline-flex
              "
            >

              <Button>

                <ArrowLeft size={15} />

                Back to courses

              </Button>

            </Link>

          </div>

        </Card>

      </div>

    );

  }


  /* =========================================================
     CONTENT
  ========================================================= */

  const lessonDescription =
    lesson.description ||
    lesson.content ||
    lesson.summary ||
    'Follow the lesson carefully, study the demonstrated sign language concepts, and use the AI practice workspace afterward to reinforce your learning.';


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div
      className="
        max-w-[1280px]
        mx-auto
        space-y-6
      "
    >


      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <Breadcrumb
        items={[
          {
            label: 'Courses',
            path: '/courses',
          },
          {
            label:
              course.title ||
              'Course',
            path:
              `/course/${course.id}`,
          },
          {
            label:
              lesson.title ||
              'Lesson',
          },
        ]}
      />


      {/* =====================================================
          BACK + PROGRESS
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
        "
      >

        <Link
          to={`/course/${course.id}`}
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-500
            hover:text-[#20d8d3]
            transition-colors
          "
        >

          <ArrowLeft size={16} />

          Back to course

        </Link>


        <div
          className="
            text-xs
            text-slate-500
          "
        >
          Lesson {lessonNumber}
          {' of '}
          {lessons.length || 1}
        </div>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-[#101923]
          via-[#111827]
          to-[#17152b]
          px-6
          py-7
          lg:px-8
          lg:py-8
        "
      >

        <div
          className="
            absolute
            right-0
            top-0
            h-48
            w-48
            rounded-full
            bg-[#16c8c4]/10
            blur-3xl
          "
        />


        <div className="relative">

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              text-xs
            "
          >

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/10
                px-3
                py-1.5
                font-semibold
                text-[#20d8d3]
              "
            >

              <BookOpen size={13} />

              {
                course.level ||
                'Learning Path'
              }

            </span>


            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-slate-700
                bg-white/[0.03]
                px-3
                py-1.5
                text-slate-400
              "
            >

              <Clock3 size={13} />

              {duration}

            </span>

          </div>


          <h1
            className="
              mt-5
              max-w-3xl
              text-3xl
              lg:text-4xl
              font-bold
              tracking-tight
              text-white
            "
          >
            {lesson.title}
          </h1>


          <p
            className="
              mt-3
              max-w-3xl
              text-sm
              lg:text-base
              leading-7
              text-slate-400
            "
          >
            {lessonDescription}
          </p>

        </div>

      </section>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div
        className="
          grid
          xl:grid-cols-[1.55fr_0.75fr]
          gap-6
          items-start
        "
      >


        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div className="space-y-6">


          {/* =================================================
              VIDEO / LESSON MEDIA
          ================================================= */}

          <Card padding="large">

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
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
                    h-10
                    w-10
                    rounded-xl
                    bg-cyan-500/10
                    text-[#20d8d3]
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Video size={18} />

                </div>


                <div>

                  <h2
                    className="
                      font-bold
                      text-white
                    "
                  >
                    Lesson Content
                  </h2>

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Learn the concept before practicing
                  </p>

                </div>

              </div>

            </div>


            {/* ===============================================
                YOUTUBE VIDEO
            =============================================== */}

            {youtubeEmbedUrl ? (

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-800
                  bg-black
                  shadow-lg
                "
              >

                <iframe
                  src={youtubeEmbedUrl}
                  title={
                    lesson.title ||
                    'SignSpeak lesson video'
                  }
                  className="
                    aspect-video
                    w-full
                  "
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    web-share
                  "
                  allowFullScreen
                />

              </div>

            ) : isDirectVideo ? (

              /* =============================================
                 DIRECT VIDEO / MP4
              ============================================= */

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-800
                  bg-black
                  shadow-lg
                "
              >

                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="
                    aspect-video
                    w-full
                    bg-black
                  "
                >

                  <source src={videoUrl} />

                  Your browser does not support video playback.

                </video>

              </div>

            ) : (

              /* =============================================
                 VIDEO NOT AVAILABLE
              ============================================= */

              <div
                className="
                  relative
                  aspect-video
                  overflow-hidden
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-700
                  bg-gradient-to-br
                  from-[#0c1922]
                  via-[#101722]
                  to-[#17152b]
                  flex
                  items-center
                  justify-center
                "
              >

                <div
                  className="
                    absolute
                    h-44
                    w-44
                    rounded-full
                    bg-cyan-500/5
                    blur-3xl
                  "
                />


                <div
                  className="
                    relative
                    text-center
                    px-6
                  "
                >

                  <div
                    className="
                      h-16
                      w-16
                      rounded-2xl
                      border
                      border-cyan-500/20
                      bg-cyan-500/10
                      flex
                      items-center
                      justify-center
                      mx-auto
                    "
                  >

                    <Video
                      size={27}
                      className="text-[#20d8d3]"
                    />

                  </div>


                  <p
                    className="
                      mt-4
                      text-sm
                      font-semibold
                      text-slate-300
                    "
                  >
                    Lesson video
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-600
                    "
                  >
                    Video content is not available yet.
                  </p>

                </div>

              </div>

            )}


            {/* =================================================
                LESSON TEXT
            ================================================= */}

            <div
              className="
                mt-6
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
                  gap-2
                "
              >

                <Sparkles
                  size={16}
                  className="text-violet-400"
                />

                <h3
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  What you'll learn
                </h3>

              </div>


              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  text-slate-400
                "
              >
                {lessonDescription}
              </p>

            </div>

          </Card>


          {/* =================================================
              AI PRACTICE
          ================================================= */}

          <Card padding="large">

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-5
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-violet-400
                  "
                >

                  <Sparkles size={14} />

                  AI Practice

                </div>


                <h3
                  className="
                    mt-2
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  Practice this lesson with SignSpeak AI
                </h3>


                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Use your camera to perform the sign and receive
                  prediction confidence, feedback and personalized
                  recommendations.
                </p>

              </div>


              <Link
                to="/practice"
                className="shrink-0"
              >

                <Button>

                  <Target size={16} />

                  Open AI Practice

                </Button>

              </Link>

            </div>

          </Card>


          {/* =================================================
              COMPLETE LESSON
          ================================================= */}

          <Card padding="large">

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-5
              "
            >

              <div>

                <h3
                  className="
                    font-bold
                    text-white
                  "
                >
                  Lesson progress
                </h3>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Mark this lesson complete when you're ready.
                </p>

              </div>


              <Button
                onClick={completeLesson}
                disabled={
                  completing ||
                  completed
                }
              >

                {
                  completing ? (

                    <>

                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Saving...

                    </>

                  ) : completed ? (

                    <>

                      <CheckCircle2 size={16} />

                      Completed

                    </>

                  ) : (

                    <>

                      <CheckCircle2 size={16} />

                      Mark Complete

                    </>

                  )
                }

              </Button>

            </div>

          </Card>


          {/* =================================================
              PREVIOUS / NEXT
          ================================================= */}

          <div
            className="
              grid
              sm:grid-cols-2
              gap-4
            "
          >

            {previousLesson ? (

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/lesson/${course.id}/${previousLesson.id}`
                  )
                }
                className="
                  rounded-2xl
                  border
                  border-slate-800
                  bg-[#151a24]
                  p-4
                  text-left
                  hover:border-slate-700
                  transition
                "
              >

                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    font-bold
                    text-slate-600
                  "
                >
                  Previous lesson
                </span>


                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-2
                  "
                >

                  <ArrowLeft
                    size={15}
                    className="text-[#20d8d3]"
                  />

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-slate-300
                    "
                  >
                    {previousLesson.title}
                  </span>

                </div>

              </button>

            ) : (

              <div />

            )}


            {nextLesson ? (

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/lesson/${course.id}/${nextLesson.id}`
                  )
                }
                className="
                  rounded-2xl
                  border
                  border-cyan-500/20
                  bg-cyan-500/[0.04]
                  p-4
                  text-left
                  hover:bg-cyan-500/[0.07]
                  transition
                "
              >

                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    font-bold
                    text-[#20d8d3]
                  "
                >
                  Next lesson
                </span>


                <div
                  className="
                    mt-2
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-slate-200
                    "
                  >
                    {nextLesson.title}
                  </span>


                  <ArrowRight
                    size={15}
                    className="text-[#20d8d3]"
                  />

                </div>

              </button>

            ) : (

              <div
                className="
                  rounded-2xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/[0.04]
                  p-4
                "
              >

                <span
                  className="
                    text-xs
                    font-semibold
                    text-emerald-400
                  "
                >
                  🎉 Final lesson in this course
                </span>

              </div>

            )}

          </div>

        </div>


        {/* ===================================================
            COURSE SIDEBAR
        =================================================== */}

        <div className="space-y-5">


          <Card padding="large">

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-[#20d8d3]
                  "
                >
                  Course Progress
                </p>


                <h3
                  className="
                    mt-1
                    font-bold
                    text-white
                  "
                >
                  {course.title}
                </h3>

              </div>


              <span
                className="
                  text-xs
                  font-semibold
                  text-slate-500
                "
              >
                {lessonNumber}/{lessons.length}
              </span>

            </div>


            <div className="space-y-2">

              {lessons.map(
                (
                  item,
                  index
                ) => {

                  const current =
                    String(item.id) ===
                    String(lessonId);


                  const previouslyViewed =
                    index < lessonIndex;


                  return (

                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        navigate(
                          `/lesson/${course.id}/${item.id}`
                        )
                      }
                      className={`
                        w-full
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        text-left
                        border
                        transition-all

                        ${
                          current
                            ? 'border-cyan-500/30 bg-cyan-500/10'
                            : 'border-transparent hover:border-slate-800 hover:bg-white/[0.02]'
                        }
                      `}
                    >

                      <div
                        className={`
                          h-8
                          w-8
                          shrink-0
                          rounded-lg
                          flex
                          items-center
                          justify-center

                          ${
                            current
                              ? 'bg-[#16c8c4] text-slate-950'
                              : previouslyViewed
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }
                        `}
                      >

                        {
                          current ? (

                            <Play size={14} />

                          ) : previouslyViewed ? (

                            <CheckCircle2 size={14} />

                          ) : (

                            <span
                              className="
                                text-xs
                                font-bold
                              "
                            >
                              {index + 1}
                            </span>

                          )
                        }

                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <p
                          className={`
                            truncate
                            text-sm
                            font-semibold

                            ${
                              current
                                ? 'text-[#20d8d3]'
                                : 'text-slate-300'
                            }
                          `}
                        >
                          {item.title}
                        </p>


                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            text-slate-600
                          "
                        >
                          Lesson {index + 1}
                        </p>

                      </div>


                      <ChevronRight
                        size={14}
                        className="
                          shrink-0
                          text-slate-600
                        "
                      />

                    </button>

                  );

                }
              )}

            </div>

          </Card>


          {/* =================================================
              AI LEARNING FLOW
          ================================================= */}

          <Card padding="large">

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

                <Sparkles size={18} />

              </div>


              <div>

                <h3
                  className="
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  AI Learning Flow
                </h3>


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Learn → Practice → Assess
                </p>

              </div>

            </div>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              {[
                'Study lesson content',
                'Practice with AI camera',
                'Review AI feedback',
                'Complete assessment',
              ].map(
                (
                  text,
                  index
                ) => (

                  <div
                    key={text}
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        h-7
                        w-7
                        rounded-lg
                        bg-[#0d3b3c]
                        text-[#20d8d3]
                        flex
                        items-center
                        justify-center
                        text-[10px]
                        font-bold
                      "
                    >
                      {index + 1}
                    </div>


                    <span
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      {text}
                    </span>

                  </div>

                )
              )}

            </div>

          </Card>

        </div>

      </div>

    </div>

  );

}