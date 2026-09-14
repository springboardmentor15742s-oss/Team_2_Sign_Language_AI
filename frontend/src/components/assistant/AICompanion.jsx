import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ArrowRight,
  BookOpen,
  Camera,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';


function getAssistantReply(message) {
  const text =
    message.trim().toLowerCase();

  if (!text) {
    return "Tell me what you'd like help with.";
  }

  if (
    text.includes('practice') ||
    text.includes('gesture') ||
    text.includes('sign')
  ) {
    return 'You can open Practice, start the camera, select a target sign, and analyze your attempt. I can also help you understand the feedback.';
  }

  if (
    text.includes('course') ||
    text.includes('lesson') ||
    text.includes('learn')
  ) {
    return 'Open Courses to continue your enrolled learning path. Complete lessons to increase your course progress.';
  }

  if (
    text.includes('assessment') ||
    text.includes('test') ||
    text.includes('quiz')
  ) {
    return 'The Assessments section lets you complete available assessments and review your results and performance.';
  }

  if (
    text.includes('certificate') ||
    text.includes('certification')
  ) {
    return 'Certificates become available after the required course completion conditions are satisfied.';
  }

  if (
    text.includes('report') ||
    text.includes('analytics') ||
    text.includes('progress')
  ) {
    return 'Reports and Analytics show your learning progress, practice activity, assessment performance, and other available metrics.';
  }

  if (
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey')
  ) {
    return 'Hi! 👋 I’m KIKO. I can help you navigate SignSpeak, practice signs, find courses, understand assessments, or check your progress.';
  }

  return 'I can help with SignSpeak courses, lessons, practice, assessments, reports, certificates, and navigation. Try asking something like “How do I start practice?”';
}


export function AICompanion() {
  const { user } = useAuth();
  const location = useLocation();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    input,
    setInput,
  ] = useState('');

  const [
    messages,
    setMessages,
  ] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi! I’m KIKO 👋 How can I help you with SignSpeak?',
    },
  ]);

  const bottomRef =
    useRef(null);


  const name =
    user?.full_name ||
    user?.name ||
    'Learner';

  const firstName =
    name.split(' ')[0];


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, open]);


  const sendMessage = (
    value = input
  ) => {
    const clean =
      value.trim();

    if (!clean) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: clean,
    };

    const reply = {
      id: Date.now() + 1,
      role: 'assistant',
      text: getAssistantReply(clean),
    };

    setMessages((current) => [
      ...current,
      userMessage,
      reply,
    ]);

    setInput('');
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };


  const pageLabel = (() => {
    const path = location.pathname;

    if (
      path.includes('practice')
    ) {
      return 'Practice';
    }

    if (
      path.includes('course') ||
      path.includes('lesson')
    ) {
      return 'Learning';
    }

    if (
      path.includes('assessment')
    ) {
      return 'Assessment';
    }

    if (
      path.includes('report')
    ) {
      return 'Reports';
    }

    if (
      path.includes('certificate')
    ) {
      return 'Certificates';
    }

    return 'SignSpeak';
  })();


  return (
    <div
      className="
        fixed
        right-5
        bottom-5
        z-[100]
        flex
        flex-col
        items-end
        gap-3
      "
    >

      {/* CHAT WINDOW */}

      {open && (
        <div
          className="
            w-[340px]
            sm:w-[370px]
            max-h-[570px]
            overflow-hidden
            rounded-[26px]
            border
            shadow-2xl
            animate-kiko-pop
          "
          style={{
            background:
              'var(--ss-card)',
            borderColor:
              'var(--ss-border)',
            color:
              'var(--ss-text)',
          }}
        >

          {/* HEADER */}

          <div
            className="
              relative
              overflow-hidden
              px-5
              py-4
            "
            style={{
              background:
                'linear-gradient(135deg,#177fe8 0%,#27bde8 58%,#35d7e9 100%)',
            }}
          >

            <div
              className="
                absolute
                -right-10
                -top-12
                h-32
                w-32
                rounded-full
                bg-white/10
              "
            />

            <div
              className="
                relative
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div className="kiko-mini-head">
                  <span className="kiko-eye left" />
                  <span className="kiko-eye right" />
                  <span className="kiko-mini-smile" />
                </div>

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      KIKO
                    </p>

                    <span
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-emerald-400/20
                        px-2
                        py-0.5
                        text-[9px]
                        font-semibold
                        text-emerald-100
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-300
                        "
                      />
                      Online
                    </span>

                  </div>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-white/75
                    "
                  >
                    SignSpeak Assistant · {pageLabel}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  h-8
                  w-8
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-white/10
                  text-white
                  transition
                  hover:bg-white/20
                "
              >
                <X size={16} />
              </button>

            </div>

          </div>


          {/* CHAT MESSAGES */}

          <div
            className="
              h-[280px]
              overflow-y-auto
              px-4
              py-4
              space-y-3
              scrollbar-thin
            "
            style={{
              background:
                'var(--ss-surface)',
            }}
          >

            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className={`
                    flex
                    ${
                      message.role ===
                      'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }
                  `}
                >

                  <div
                    className={`
                      max-w-[82%]
                      rounded-2xl
                      px-3.5
                      py-2.5
                      text-xs
                      leading-5

                      ${
                        message.role ===
                        'user'
                          ? `
                            bg-gradient-to-r
                            from-[#198cf0]
                            to-[#26bde4]
                            text-white
                            rounded-br-md
                          `
                          : `
                            rounded-bl-md
                          `
                      }
                    `}
                    style={
                      message.role ===
                      'assistant'
                        ? {
                            background:
                              'var(--ss-surface-2)',
                            color:
                              'var(--ss-text-soft)',
                          }
                        : undefined
                    }
                  >
                    {message.text}
                  </div>

                </div>
              )
            )}

            <div ref={bottomRef} />

          </div>


          {/* QUICK PROMPTS */}

          <div
            className="
              px-4
              pt-3
              flex
              gap-2
              overflow-x-auto
            "
            style={{
              borderTop:
                '1px solid var(--ss-border)',
            }}
          >

            {[
              'How do I practice?',
              'Show my courses',
              'Certificates',
            ].map(
              (prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() =>
                    sendMessage(prompt)
                  }
                  className="
                    shrink-0
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                  "
                  style={{
                    background:
                      'var(--ss-surface-2)',
                    borderColor:
                      'var(--ss-border)',
                    color:
                      'var(--ss-text-soft)',
                  }}
                >
                  {prompt}
                </button>
              )
            )}

          </div>


          {/* INPUT */}

          <form
            onSubmit={handleSubmit}
            className="
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                p-2
              "
              style={{
                background:
                  'var(--ss-surface-2)',
                borderColor:
                  'var(--ss-border)',
              }}
            >

              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                placeholder="Ask KIKO anything..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2
                  text-xs
                  outline-none
                "
                style={{
                  color:
                    'var(--ss-text)',
                }}
              />

              <button
                type="submit"
                className="
                  h-9
                  w-9
                  shrink-0
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-gradient-to-br
                  from-[#188cf0]
                  to-[#26c2e4]
                  text-white
                  shadow-lg
                "
              >
                <Send size={15} />
              </button>

            </div>

          </form>


          {/* NAVIGATION SHORTCUTS */}

          <div
            className="
              grid
              grid-cols-2
              gap-2
              px-4
              pb-4
            "
          >

            <Link
              to="/practice"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                py-2.5
                text-[10px]
                font-semibold
              "
              style={{
                borderColor:
                  'var(--ss-border)',
                color:
                  'var(--ss-text-soft)',
              }}
            >
              <Camera size={13} />
              Practice
            </Link>


            <Link
              to="/courses"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                py-2.5
                text-[10px]
                font-semibold
              "
              style={{
                borderColor:
                  'var(--ss-border)',
                color:
                  'var(--ss-text-soft)',
              }}
            >
              <BookOpen size={13} />
              Courses
            </Link>

          </div>

        </div>
      )}


      {/* SMALL MESSAGE */}

      {!open && (
        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="
            mr-2
            rounded-2xl
            border
            px-3.5
            py-2.5
            text-left
            shadow-lg
            transition
            hover:-translate-y-0.5
          "
          style={{
            background:
              'var(--ss-card)',
            borderColor:
              'var(--ss-border)',
          }}
        >
          <p
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-bold
            "
            style={{
              color:
                'var(--ss-text)',
            }}
          >
            <Sparkles
              size={11}
              className="text-cyan-500"
            />
            Hi {firstName}!
          </p>

          <p
            className="
              mt-0.5
              text-[9px]
            "
            style={{
              color:
                'var(--ss-text-muted)',
            }}
          >
            Need help? Ask KIKO
          </p>
        </button>
      )}


      {/* IMPROVED ROBOT */}

      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-label="Open KIKO assistant"
        className="
          kiko-robot
          group
        "
      >

        <div className="kiko-antenna">
          <span />
        </div>

        <div className="kiko-ear kiko-ear-left" />
        <div className="kiko-ear kiko-ear-right" />


        <div className="kiko-head">

          <div className="kiko-face">

            <div className="kiko-eyes">

              <span
                className="
                  kiko-eye
                  left
                "
              />

              <span
                className="
                  kiko-eye
                  right
                "
              />

            </div>

            <span className="kiko-smile" />

          </div>

        </div>


        <div className="kiko-neck" />


        <div className="kiko-body">

          <div className="kiko-core">

            <MessageCircle
              size={15}
            />

          </div>

        </div>


        <div className="kiko-arm kiko-arm-left" />
        <div className="kiko-arm kiko-arm-right" />


        <span className="kiko-online" />

      </button>

    </div>
  );
}
