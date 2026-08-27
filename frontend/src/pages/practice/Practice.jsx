import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Hand,
  Info,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Video,
  Zap,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/layout/Breadcrumb';

import { CameraPanel } from '../../components/practice/CameraPanel';
import { ConfidenceMeter } from '../../components/practice/ConfidenceMeter';
import { FeedbackPanel } from '../../components/practice/FeedbackPanel';

import { mlService } from '../../services/mlService';
import { practiceService } from '../../services/practiceService';


const PRACTICE_SIGNS = [
  {
    id: 1,
    sign: 'A',
    name: 'Letter A',
    instruction:
      'Make a fist with your thumb resting on the side of your index finger.',
  },
  {
    id: 2,
    sign: 'B',
    name: 'Letter B',
    instruction:
      'Hold your hand flat with all fingers together and thumb tucked in.',
  },
  {
    id: 3,
    sign: 'C',
    name: 'Letter C',
    instruction:
      'Curve your fingers and thumb to form a C shape.',
  },
  {
    id: 4,
    sign: 'L',
    name: 'Letter L',
    instruction:
      'Extend your thumb and index finger to create an L shape.',
  },
  {
    id: 5,
    sign: 'V',
    name: 'Letter V',
    instruction:
      'Extend your index and middle fingers apart while keeping the remaining fingers folded.',
  },
];


export default function Practice() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);

  const [feedback, setFeedback] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);
  const [detections, setDetections] = useState([]);
  const [confidenceTotal, setConfidenceTotal] = useState(0);

  const cameraRef = useRef(null);
  const timerRef = useRef(null);

  const currentSign = PRACTICE_SIGNS[currentIndex];


  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimer((value) => value + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [isPaused]);


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    return `${minutes}:${String(
      seconds % 60
    ).padStart(2, '0')}`;
  };


  const clearSession = () => {
    setFeedback(null);
    setPrediction(null);
    setConfidence(0);

    setSessionId(null);
    setAttempts(0);
    setSuccessfulAttempts(0);
    setDetections([]);
    setConfidenceTotal(0);
  };


  const analyzeSign = async () => {
    try {
      setIsAnalyzing(true);
      setFeedback(null);

      if (!cameraRef.current) {
        throw new Error(
          'Camera is not ready. Please start the camera.'
        );
      }

      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const sessionResponse =
          await practiceService.startSession({
            targetGesture: currentSign.sign,
          });

        activeSessionId =
          sessionResponse.data.id;

        setSessionId(activeSessionId);
      }


      const imageFile =
        await cameraRef.current.captureFrame();


      const response =
        await mlService.predictSign(imageFile);

      const result = response.data;

      const score =
        Number(result.confidence || 0);

      const expected =
        currentSign.sign;

      const predicted =
        String(
          result.predicted_sign || ''
        ).toUpperCase();

      const correct =
        expected === predicted;


      setConfidence(score);

      setPrediction({
        expected,
        predicted,
        correct,
        confidence: score,
      });


      const nextAttempts =
        attempts + 1;

      const nextSuccessful =
        successfulAttempts +
        (correct ? 1 : 0);

      const nextConfidenceTotal =
        confidenceTotal + score;


      const detection = {
        target_gesture: expected,
        predicted_gesture: predicted,
        confidence: score,
        correct,
        learning_status:
          result.learning_status || null,
        feedback:
          result.feedback || null,
        recommendation:
          result.recommendation || null,
        timestamp:
          new Date().toISOString(),
      };


      const nextDetections = [
        ...detections,
        detection,
      ];


      setAttempts(nextAttempts);
      setSuccessfulAttempts(nextSuccessful);
      setConfidenceTotal(nextConfidenceTotal);
      setDetections(nextDetections);


      const averageConfidence =
        (
          nextConfidenceTotal /
          nextAttempts
        ) / 100;


      await practiceService.finishSession(
        activeSessionId,
        {
          durationSeconds: timer,
          averageConfidence,
          attempts: nextAttempts,
          successfulAttempts:
            nextSuccessful,
          detections:
            nextDetections,
        }
      );


      let type = 'warning';
      let title =
        `AI detected ${predicted || 'another sign'}`;

      if (correct && score >= 70) {
        type = 'success';
        title = 'Correct sign!';
      } else if (correct) {
        type = 'tip';
        title =
          'Correct, but improve confidence';
      }


      setFeedback({
        type,
        title,
        message:
          `${result.feedback || 'Review your hand position and try again.'}${
            result.recommendation
              ? ` ${result.recommendation}`
              : ''
          }`,
      });

    } catch (error) {
      console.error(
        'Sign analysis error:',
        error
      );

      setFeedback({
        type: 'error',
        title: 'Analysis unavailable',
        message:
          error?.response?.data?.detail ||
          error?.message ||
          'Unable to analyze this sign.',
      });

    } finally {
      setIsAnalyzing(false);
    }
  };


  const nextSign = () => {
    setCurrentIndex(
      (value) =>
        (value + 1) %
        PRACTICE_SIGNS.length
    );

    clearSession();
  };


  const selectSign = (index) => {
    setCurrentIndex(index);
    clearSession();
  };


  const reset = () => {
    setTimer(0);
    setIsPaused(false);
    clearSession();
  };


  const sessionAccuracy =
    attempts > 0
      ? Math.round(
          (
            successfulAttempts /
            attempts
          ) * 100
        )
      : 0;


  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <Breadcrumb
        items={[
          { label: 'Practice' },
        ]}
      />


      {/* HEADER */}

      <section className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 p-6 lg:p-7 text-white">

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#20d8d3]">
              <Sparkles size={14} />
              AI Gesture Recognition
            </div>

            <h1 className="mt-2 text-2xl lg:text-3xl font-bold">
              Practice with SignSpeak AI
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Perform the target sign using your camera.
              SignSpeak predicts the gesture, measures
              confidence, generates AI feedback and records
              your learner performance.
            </p>

          </div>


          <div className="flex flex-wrap items-center gap-2">

            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-300">
              <Clock3 size={15} />
              {formatTime(timer)}
            </div>

            <Button
              variant="ghost"
              onClick={() =>
                setIsPaused(!isPaused)
              }
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {isPaused ? (
                <Play size={15} />
              ) : (
                <Pause size={15} />
              )}

              {isPaused
                ? 'Resume'
                : 'Pause'}
            </Button>

            <Button
              variant="ghost"
              onClick={reset}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={15} />
              Reset
            </Button>

          </div>

        </div>

      </section>


      {/* STATS */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        <Card>
          <p className="text-xs text-slate-500">
            Attempts
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {attempts}
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Correct
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {successfulAttempts}
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Session Accuracy
          </p>

          <p className="mt-1 text-2xl font-bold text-[#20d8d3]">
            {sessionAccuracy}%
          </p>
        </Card>


        <Card>
          <p className="text-xs text-slate-500">
            Last Confidence
          </p>

          <p className="mt-1 text-2xl font-bold text-violet-400">
            {confidence.toFixed(1)}%
          </p>
        </Card>

      </div>


      {/* MAIN */}

      <div className="grid xl:grid-cols-[1.45fr_0.8fr] gap-6 items-start">


        {/* LEFT */}

        <div className="space-y-5">

          <Card
            padding="none"
            className="overflow-hidden"
          >

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-[#20d8d3] flex items-center justify-center">
                  <Video size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Live AI Camera
                  </p>

                  <p className="text-xs text-slate-500">
                    Camera → ML prediction → feedback
                  </p>
                </div>

              </div>


              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                AI Ready

              </span>

            </div>


            <div className="p-4">
              <CameraPanel
                ref={cameraRef}
              />
            </div>

          </Card>


          <div className="grid md:grid-cols-2 gap-5">

            <Card>

              <div className="flex items-center gap-3 mb-4">
                <Zap
                  size={18}
                  className="text-amber-400"
                />

                <h3 className="font-bold text-white">
                  AI Confidence
                </h3>
              </div>


              <ConfidenceMeter
                value={confidence}
              />


              {prediction && (
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Expected
                    </span>

                    <span className="font-bold text-white">
                      {prediction.expected}
                    </span>
                  </div>


                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Prediction
                    </span>

                    <span
                      className={
                        prediction.correct
                          ? 'font-bold text-emerald-400'
                          : 'font-bold text-amber-400'
                      }
                    >
                      {prediction.predicted}
                    </span>
                  </div>


                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Result
                    </span>

                    <span
                      className={
                        prediction.correct
                          ? 'font-bold text-emerald-400'
                          : 'font-bold text-rose-400'
                      }
                    >
                      {prediction.correct
                        ? 'Correct'
                        : 'Needs Practice'}
                    </span>
                  </div>

                </div>
              )}

            </Card>


            {feedback ? (
              <FeedbackPanel
                feedback={feedback}
              />
            ) : (
              <Card className="border-dashed">

                <div className="h-full flex flex-col justify-center">

                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Sparkles size={19} />
                  </div>

                  <h3 className="mt-3 font-bold text-white">
                    AI Feedback
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Start your camera and analyze your
                    gesture to receive personalized feedback.
                  </p>

                </div>

              </Card>
            )}

          </div>


          {/* HISTORY */}

          {detections.length > 0 && (
            <Card padding="large">

              <p className="text-xs font-semibold uppercase tracking-wider text-[#20d8d3]">
                Session History
              </p>

              <h3 className="mt-1 mb-4 font-bold text-white">
                Recent AI Detections
              </h3>


              <div className="space-y-2">

                {[...detections]
                  .reverse()
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      key={`${item.timestamp}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] p-3"
                    >

                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          item.correct
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {item.correct ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <CircleAlert size={15} />
                        )}
                      </div>


                      <div className="flex-1">

                        <p className="text-sm font-semibold text-slate-200">
                          {item.target_gesture}
                          {' → '}
                          {item.predicted_gesture}
                        </p>

                        <p className="text-xs text-slate-600">
                          Confidence{' '}
                          {Number(
                            item.confidence
                          ).toFixed(1)}
                          %
                        </p>

                      </div>


                      <span
                        className={
                          item.correct
                            ? 'text-xs font-bold text-emerald-400'
                            : 'text-xs font-bold text-amber-400'
                        }
                      >
                        {item.correct
                          ? 'Correct'
                          : 'Review'}
                      </span>

                    </div>
                  ))}

              </div>

            </Card>
          )}

        </div>


        {/* RIGHT */}

        <div className="space-y-5">

          <Card padding="large">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <Hand
                  size={18}
                  className="text-[#20d8d3]"
                />

                <span className="text-xs font-bold uppercase tracking-wider text-[#20d8d3]">
                  Target Sign
                </span>
              </div>


              <span className="text-xs font-semibold text-slate-500">
                {currentIndex + 1}
                {' / '}
                {PRACTICE_SIGNS.length}
              </span>

            </div>


            <h2 className="mt-4 text-3xl font-bold text-white">
              {currentSign.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {currentSign.instruction}
            </p>


            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4 flex gap-3">

              <Info
                size={17}
                className="text-[#20d8d3] mt-0.5 shrink-0"
              />

              <p className="text-xs leading-5 text-slate-400">
                Keep your hand inside the guide,
                use good lighting, and hold the
                gesture steady before analyzing.
              </p>

            </div>


            <div className="mt-5 space-y-2">

              <Button
                className="w-full"
                onClick={analyzeSign}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    AI analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Analyze with SignSpeak AI
                  </>
                )}
              </Button>


              <Button
                variant="outline"
                className="w-full"
                onClick={nextSign}
                disabled={isAnalyzing}
              >
                Next Sign
                <ArrowRight size={16} />
              </Button>

            </div>

          </Card>


          {/* QUEUE */}

          <Card>

            <div className="flex items-center justify-between mb-4">

              <h3 className="font-bold text-white">
                Practice Queue
              </h3>

              <span className="text-xs text-slate-500">
                ASL Alphabet
              </span>

            </div>


            <div className="space-y-2">

              {PRACTICE_SIGNS.map(
                (sign, index) => (
                  <button
                    key={sign.id}
                    onClick={() =>
                      selectSign(index)
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                      index === currentIndex
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : 'border-transparent hover:border-slate-800 hover:bg-white/[0.02]'
                    }`}
                  >

                    <span
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === currentIndex
                          ? 'bg-[#16c8c4] text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>


                    <span
                      className={`text-sm font-semibold flex-1 ${
                        index === currentIndex
                          ? 'text-[#20d8d3]'
                          : 'text-slate-300'
                      }`}
                    >
                      {sign.name}
                    </span>


                    {index === currentIndex ? (
                      <CheckCircle2
                        size={16}
                        className="text-[#20d8d3]"
                      />
                    ) : (
                      <CircleAlert
                        size={15}
                        className="text-slate-700"
                      />
                    )}

                  </button>
                )
              )}

            </div>

          </Card>


          {/* SUMMARY */}

          <Card>

            <div className="flex items-center gap-3 mb-4">

              <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Sparkles size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">
                  Learning Intelligence
                </h3>

                <p className="text-xs text-slate-500">
                  Current practice session
                </p>
              </div>

            </div>


            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Attempts
                </span>

                <span className="font-semibold text-slate-200">
                  {attempts}
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-slate-500">
                  Successful
                </span>

                <span className="font-semibold text-emerald-400">
                  {successfulAttempts}
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-slate-500">
                  Accuracy
                </span>

                <span className="font-semibold text-[#20d8d3]">
                  {sessionAccuracy}%
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-slate-500">
                  Database Session
                </span>

                <span
                  className={
                    sessionId
                      ? 'font-semibold text-emerald-400'
                      : 'font-semibold text-slate-600'
                  }
                >
                  {sessionId
                    ? `#${sessionId}`
                    : 'Not started'}
                </span>
              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
}