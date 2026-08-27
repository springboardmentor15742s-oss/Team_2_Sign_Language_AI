import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Target,
  Flag,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { assessmentService } from '../../services/assessmentService';


export default function Assessment() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [
    assessment,
    setAssessment,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    current,
    setCurrent,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    flagged,
    setFlagged,
  ] = useState([]);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(0);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  /* LOAD ASSESSMENT */

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const response =
          await assessmentService
            .getAssessment(id);

        if (!active) {
          return;
        }

        setAssessment(
          response.data
        );

        setTimeLeft(
          Number(
            response.data
              .time_limit_minutes ||
            15
          ) * 60
        );

      } catch (err) {
        console.error(err);

        if (active) {
          setError(
            err?.response?.data?.detail ||
              'Unable to load assessment.'
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
  }, [id]);


  /* TIMER */

  useEffect(() => {
    if (
      loading ||
      !assessment ||
      submitting
    ) {
      return undefined;
    }

    if (timeLeft <= 0) {
      return undefined;
    }

    const interval =
      setInterval(() => {
        setTimeLeft(
          (value) =>
            Math.max(
              value - 1,
              0
            )
        );
      }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    loading,
    assessment,
    submitting,
    timeLeft,
  ]);


  const questions =
    assessment?.questions || [];

  const question =
    questions[current];


  const answeredCount =
    Object.keys(
      answers
    ).filter(
      (key) =>
        answers[key] !==
          undefined &&
        answers[key] !== ''
    ).length;


  const progress =
    questions.length
      ? (
          answeredCount /
          questions.length
        ) * 100
      : 0;


  const formatTime =
    (seconds) =>
      `${Math.floor(
        seconds / 60
      )}:${String(
        seconds % 60
      ).padStart(2, '0')}`;


  const selectAnswer =
    (answer) => {
      setAnswers(
        (previous) => ({
          ...previous,
          [String(question.id)]:
            answer,
        })
      );
    };


  const toggleFlag = () => {
    setFlagged(
      (previous) =>
        previous.includes(
          question.id
        )
          ? previous.filter(
              (id) =>
                id !==
                question.id
            )
          : [
              ...previous,
              question.id,
            ]
    );
  };


  const submitAssessment =
    async () => {
      try {
        setSubmitting(true);

        const response =
          await assessmentService
            .submitAssessment(
              id,
              answers
            );

        navigate(
          '/assessment-results',
          {
            state: {
              result:
                response.data,
              assessment,
              answers,
            },
          }
        );

      } catch (err) {
        console.error(
          'Assessment submission failed:',
          err
        );

        setError(
          err?.response?.data?.detail ||
            'Assessment submission failed.'
        );

      } finally {
        setSubmitting(false);
      }
    };


  useEffect(() => {
    if (
      assessment &&
      timeLeft === 0 &&
      !submitting
    ) {
      submitAssessment();
    }
    // timer expiry only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);


  const unanswered =
    questions.length -
    answeredCount;


  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-[#20d8d3]"
        />
      </div>
    );
  }


  if (
    error &&
    !assessment
  ) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card padding="large">
          <p className="text-center text-rose-400">
            {error}
          </p>
        </Card>
      </div>
    );
  }


  if (
    !assessment ||
    !question
  ) {
    return null;
  }


  return (
    <div className="max-w-[1250px] mx-auto space-y-6">

      <Breadcrumb
        items={[
          {
            label: 'Assessments',
            path: '/assessments',
          },
          {
            label:
              assessment.title,
          },
        ]}
      />


      {/* TOP STATUS */}

      <section className="rounded-[26px] border border-slate-800 bg-[#101721] p-5 lg:p-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
              <ShieldCheck
                size={14}
              />
              Active Assessment
            </div>

            <h1 className="mt-2 text-2xl font-bold text-white">
              {assessment.title}
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Passing score:
              {' '}
              {
                assessment
                  .passing_score
              }%
            </p>
          </div>


          <div className="flex gap-3">

            <div className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-3">
              <p className="text-[10px] uppercase text-slate-600">
                Answered
              </p>

              <p className="mt-1 font-bold text-[#20d8d3]">
                {answeredCount}
                {' / '}
                {questions.length}
              </p>
            </div>


            <div
              className={`rounded-xl border px-4 py-3 ${
                timeLeft <= 60
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-slate-800 bg-[#111827]'
              }`}
            >
              <p className="text-[10px] uppercase text-slate-600">
                Time Remaining
              </p>

              <p
                className={`mt-1 flex items-center gap-1.5 font-bold ${
                  timeLeft <= 60
                    ? 'text-rose-400'
                    : 'text-white'
                }`}
              >
                <Clock3 size={14} />
                {
                  formatTime(
                    timeLeft
                  )
                }
              </p>
            </div>

          </div>

        </div>


        <div className="mt-5 h-2 rounded-full bg-slate-800 overflow-hidden">

          <div
            className="h-full rounded-full bg-[#16c8c4] transition-all"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </section>


      <div className="grid xl:grid-cols-[1fr_290px] gap-6">


        {/* QUESTION */}

        <Card padding="large">

          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#20d8d3]">
                Question
                {' '}
                {current + 1}
              </p>

              <h2 className="mt-3 text-xl lg:text-2xl font-bold leading-8 text-white">
                {
                  question
                    .question_text
                }
              </h2>

              <p className="mt-2 text-xs text-slate-600">
                {
                  question.points
                }
                {' '}
                point
                {
                  question.points !== 1
                    ? 's'
                    : ''
                }
              </p>
            </div>


            <button
              onClick={toggleFlag}
              className={`rounded-xl p-2.5 border transition ${
                flagged.includes(
                  question.id
                )
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 text-slate-600'
              }`}
            >
              <Flag size={17} />
            </button>

          </div>


          <div className="mt-7">

            {question.question_type ===
              'multiple_choice' && (
              <div className="space-y-3">

                {(question.options || [])
                  .map(
                    (
                      option,
                      index
                    ) => {

                      const selected =
                        answers[
                          String(
                            question.id
                          )
                        ] ===
                        option;

                      return (
                        <button
                          key={option}
                          onClick={() =>
                            selectAnswer(
                              option
                            )
                          }
                          className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                            selected
                              ? 'border-cyan-500/40 bg-cyan-500/10'
                              : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                          }`}
                        >

                          <span
                            className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                              selected
                                ? 'bg-[#16c8c4] text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {
                              String.fromCharCode(
                                65 +
                                index
                              )
                            }
                          </span>

                          <span
                            className={`text-sm font-semibold ${
                              selected
                                ? 'text-white'
                                : 'text-slate-300'
                            }`}
                          >
                            {option}
                          </span>

                        </button>
                      );
                    }
                  )}

              </div>
            )}


            {question.question_type ===
              'true_false' && (
              <div className="grid sm:grid-cols-2 gap-4">

                {[
                  'True',
                  'False',
                ].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() =>
                        selectAnswer(
                          option
                        )
                      }
                      className={`rounded-2xl border p-6 text-center font-bold transition ${
                        answers[
                          String(
                            question.id
                          )
                        ] ===
                        option
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-[#20d8d3]'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}

              </div>
            )}


            {question.question_type ===
              'gesture_recognition' && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-7">

                <div className="text-center">

                  <Target
                    size={32}
                    className="mx-auto text-violet-400"
                  />

                  <h3 className="mt-3 font-bold text-white">
                    Gesture recognition question
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Select the sign you believe matches the displayed prompt.
                  </p>


                  {question.options?.length ? (
                    <div className="mt-5 grid sm:grid-cols-2 gap-3">

                      {question.options.map(
                        (option) => (
                          <button
                            key={option}
                            onClick={() =>
                              selectAnswer(
                                option
                              )
                            }
                            className={`rounded-xl border p-3 text-sm font-semibold ${
                              answers[
                                String(
                                  question.id
                                )
                              ] ===
                              option
                                ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                                : 'border-slate-800 text-slate-400'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      )}

                    </div>
                  ) : (
                    <input
                      value={
                        answers[
                          String(
                            question.id
                          )
                        ] || ''
                      }
                      onChange={(event) =>
                        selectAnswer(
                          event.target.value
                        )
                      }
                      placeholder="Enter your answer"
                      className="mt-5 w-full rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                    />
                  )}

                </div>

              </div>
            )}

          </div>


          {error && (
            <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}


          <div className="mt-8 flex items-center justify-between">

            <Button
              variant="outline"
              onClick={() =>
                setCurrent(
                  (value) =>
                    Math.max(
                      0,
                      value - 1
                    )
                )
              }
              disabled={
                current === 0
              }
            >
              <ChevronLeft
                size={15}
              />
              Previous
            </Button>


            {current <
            questions.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrent(
                    (value) =>
                      Math.min(
                        questions.length -
                          1,
                        value + 1
                      )
                  )
                }
              >
                Next
                <ChevronRight
                  size={15}
                />
              </Button>
            ) : (
              <Button
                onClick={
                  submitAssessment
                }
                disabled={
                  submitting
                }
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Assessment
                  </>
                )}
              </Button>
            )}

          </div>

        </Card>


        {/* NAVIGATOR */}

        <div className="space-y-5">

          <Card>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question Navigator
            </p>


            <div className="mt-4 grid grid-cols-5 gap-2">

              {questions.map(
                (
                  item,
                  index
                ) => {

                  const answered =
                    answers[
                      String(
                        item.id
                      )
                    ] !==
                    undefined;

                  const isFlagged =
                    flagged.includes(
                      item.id
                    );

                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setCurrent(
                          index
                        )
                      }
                      className={`aspect-square rounded-lg text-xs font-bold border ${
                        index ===
                        current
                          ? 'border-cyan-500 bg-cyan-500/10 text-[#20d8d3]'
                          : isFlagged
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : answered
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                }
              )}

            </div>


            <div className="mt-5 space-y-2 text-xs">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Answered
                </span>

                <span className="font-bold text-emerald-400">
                  {answeredCount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Unanswered
                </span>

                <span className="font-bold text-slate-300">
                  {unanswered}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Flagged
                </span>

                <span className="font-bold text-amber-400">
                  {flagged.length}
                </span>
              </div>

            </div>

          </Card>


          {unanswered > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">

              <div className="flex gap-3">

                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <p className="text-xs leading-5 text-slate-500">
                  You still have
                  {' '}
                  <strong className="text-amber-400">
                    {unanswered}
                  </strong>
                  {' '}
                  unanswered question
                  {unanswered !== 1
                    ? 's'
                    : ''}.
                </p>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}