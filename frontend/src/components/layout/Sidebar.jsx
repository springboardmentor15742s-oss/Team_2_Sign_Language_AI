import { Link, useLocation } from 'react-router-dom';

import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Video,
  ClipboardCheck,
  BarChart3,
  FileText,
  Award,
  Trophy,
  User,
  Settings,
  Bell,
  LogOut,
  Hand,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';


const learnLinks = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Courses',
    path: '/courses',
    icon: BookOpen,
  },
  {
    name: 'Lessons',
    path: '/courses',
    icon: PlayCircle,
  },
  {
    name: 'Practice',
    path: '/practice',
    icon: Video,
  },
  {
    name: 'Assessments',
    path: '/assessments',
    icon: ClipboardCheck,
  },
];


const insightLinks = [
  {
    name: 'Analytics',
    path: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: FileText,
  },
  {
    name: 'Certificates',
    path: '/certificates',
    icon: Award,
  },
  {
    name: 'Achievements',
    path: '/achievements',
    icon: Trophy,
  },
];


const accountLinks = [
  {
    name: 'Profile',
    path: '/profile',
    icon: User,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell,
  },
];


function NavSection({
  title,
  links,
  pathname,
}) {
  return (
    <div className="mb-7">

      <p
        className="
          px-3
          mb-2
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-slate-600
        "
      >
        {title}
      </p>

      <div className="space-y-1">

        {links.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.path ||
            pathname.startsWith(
              `${item.path}/`
            );

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                group
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  active
                    ? `
                      bg-gradient-to-r
                      from-[#173b68]
                      to-[#122238]
                      text-white
                      shadow-[0_10px_30px_rgba(15,78,150,0.15)]
                    `
                    : `
                      text-slate-400
                      hover:bg-white/[0.04]
                      hover:text-slate-100
                    `
                }
              `}
            >

              <div
                className={`
                  h-8
                  w-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  transition

                  ${
                    active
                      ? `
                        bg-[#1c8fff]
                        text-white
                      `
                      : `
                        bg-white/[0.03]
                        text-slate-500
                        group-hover:text-slate-300
                      `
                  }
                `}
              >
                <Icon size={16} />
              </div>

              <span>
                {item.name}
              </span>

              {active && (
                <span
                  className="
                    ml-auto
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#32d6d0]
                  "
                />
              )}

            </Link>
          );
        })}

      </div>
    </div>
  );
}


export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside
      style={{
        background: 'var(--ss-sidebar)',
        color: 'var(--ss-text)',
        borderColor: 'var(--ss-border)',
      }}
      className="
        w-[252px]
        h-screen
        sticky
        top-0
        flex
        flex-col
        bg-[#07101d]
        border-r
        border-white/[0.06]
        text-white
      "
    >

      {/* BRAND */}

      <div
        className="
          px-5
          pt-6
          pb-5
        "
      >

        <Link
          to="/dashboard"
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
              rounded-2xl
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#22d3cf]
              to-[#2487ff]
              shadow-[0_10px_28px_rgba(34,211,207,0.2)]
            "
          >
            <Hand
              size={22}
              className="text-white"
            />
          </div>

          <div>

            <p
              className="
                text-[20px]
                font-bold
                tracking-tight
                text-white
              "
            >
              SignSpeak
            </p>

            <p
              className="
                mt-0.5
                text-[10px]
                font-medium
                tracking-wide
                text-[#39d8d2]
              "
            >
              Learn • Practice • Improve
            </p>

          </div>

        </Link>

      </div>


      {/* NAVIGATION */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-4
          pt-2
          pb-5
        "
      >

        <NavSection
          title="Learn"
          links={learnLinks}
          pathname={location.pathname}
        />

        <NavSection
          title="Insights"
          links={insightLinks}
          pathname={location.pathname}
        />

        <NavSection
          title="Account"
          links={accountLinks}
          pathname={location.pathname}
        />

      </nav>


      {/* FOOTER */}

      <div
        className="
          p-4
          border-t
          border-white/[0.06]
        "
      >

        <div
          className="
            mb-3
            rounded-2xl
            border
            border-cyan-500/10
            bg-gradient-to-br
            from-[#0c2230]
            to-[#0d1727]
            p-4
          "
        >

          <p
            className="
              text-xs
              font-semibold
              text-[#47ded8]
            "
          >
            Sign smarter.
          </p>

          <p
            className="
              mt-1
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            Build confidence one sign
            at a time.
          </p>

        </div>

        <button
          onClick={logout}
          className="
            w-full
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-red-400
            transition
            hover:bg-red-500/10
          "
        >
          <LogOut size={17} />
          Logout
        </button>

      </div>

    </aside>
  );
}
