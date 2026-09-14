import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Bell,
  Search,
  Menu,
  Command,
  ChevronDown,
  Sun,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { notificationService } from '../../services/notificationService';


export function Topbar({ onMenuClick }) {
  const { user } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const isMobile =
    useMediaQuery('(max-width: 768px)');


  useEffect(() => {
    let active = true;

    if (!user) {
      return undefined;
    }

    notificationService
      .getNotifications()
      .then(({ data }) => {
        if (!active) return;

        setUnread(
          Array.isArray(data)
            ? data.filter(
                (item) => !item.is_read
              ).length
            : 0
        );
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user]);


  const name =
    user?.full_name ||
    user?.name ||
    'Learner';

  const initials =
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();


  return (
    <header
      className="
        h-[76px]
        sticky
        top-0
        z-30
        flex
        items-center
        justify-between
        gap-5
        px-4
        lg:px-7
        border-b
        backdrop-blur-xl
      "
      style={{
        background:
          'var(--ss-topbar)',
        borderColor:
          'var(--ss-border)',
      }}
    >

      {/* LEFT SIDE */}

      <div
        className="
          flex
          items-center
          gap-3
          flex-1
          min-w-0
        "
      >

        {isMobile && (
          <button
            type="button"
            onClick={onMenuClick}
            className="
              h-10
              w-10
              flex
              items-center
              justify-center
              rounded-xl
              transition
            "
            style={{
              color:
                'var(--ss-text-soft)',
            }}
          >
            <Menu size={20} />
          </button>
        )}


        {/* SEARCH */}

        {searchOpen ? (
          <div
            className="
              flex
              items-center
              gap-3
              w-full
              max-w-[520px]
              h-11
              px-4
              rounded-2xl
              border
            "
            style={{
              background:
                'var(--ss-surface)',
              borderColor:
                'var(--ss-border)',
            }}
          >
            <Search
              size={17}
              className="text-[#32d6d0]"
            />

            <input
              autoFocus
              type="text"
              placeholder="Search courses, lessons or signs..."
              className="
                flex-1
                min-w-0
                bg-transparent
                outline-none
                text-sm
              "
              style={{
                color:
                  'var(--ss-text)',
              }}
              onBlur={() =>
                setSearchOpen(false)
              }
            />

            <kbd
              className="
                hidden
                sm:flex
                items-center
                gap-1
                rounded-md
                border
                px-1.5
                py-1
                text-[9px]
              "
              style={{
                borderColor:
                  'var(--ss-border)',
                color:
                  'var(--ss-text-muted)',
              }}
            >
              <Command size={9} />
              K
            </kbd>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              setSearchOpen(true)
            }
            className="
              flex
              items-center
              gap-3
              w-full
              max-w-[520px]
              h-11
              px-4
              rounded-2xl
              border
              text-sm
              transition
            "
            style={{
              background:
                'var(--ss-surface)',
              borderColor:
                'var(--ss-border)',
              color:
                'var(--ss-text-muted)',
            }}
          >
            <Search size={17} />

            <span
              className="
                flex-1
                text-left
                truncate
              "
            >
              Search courses, lessons or signs...
            </span>

            <span
              className="
                hidden
                sm:flex
                items-center
                gap-1
                rounded-md
                border
                px-1.5
                py-1
                text-[9px]
              "
              style={{
                borderColor:
                  'var(--ss-border)',
              }}
            >
              <Command size={9} />
              K
            </span>
          </button>
        )}

      </div>


      {/* RIGHT SIDE */}

      <div
        className="
          flex
          items-center
          gap-1.5
          sm:gap-2
          shrink-0
        "
      >

        <Link
          to="/practice"
          className="
            hidden
            lg:flex
            items-center
            gap-2
            h-10
            px-4
            rounded-xl
            border
            text-xs
            font-semibold
            text-[#42ddd8]
          "
          style={{
            borderColor:
              'var(--ss-border)',
            background:
              'var(--ss-surface)',
          }}
        >
          <Sparkles size={15} />
          AI Practice
        </Link>


        {/* NOTIFICATIONS */}

        <Link
          to="/notifications"
          className="
            relative
            h-10
            w-10
            flex
            items-center
            justify-center
            rounded-xl
            border
            transition
          "
          style={{
            borderColor:
              'var(--ss-border)',
            background:
              'var(--ss-surface)',
            color:
              'var(--ss-text-soft)',
          }}
        >
          <Bell size={18} />

          {unread > 0 && (
            <span
              className="
                absolute
                top-1
                right-1
                min-w-[15px]
                h-[15px]
                px-1
                rounded-full
                flex
                items-center
                justify-center
                bg-[#28d4cf]
                text-[8px]
                font-extrabold
                text-[#07101d]
              "
            >
              {unread > 9
                ? '9+'
                : unread}
            </span>
          )}
        </Link>


        <div
          className="
            hidden
            sm:block
            h-7
            w-px
            mx-1
          "
          style={{
            background:
              'var(--ss-border)',
          }}
        />


        {/* PROFILE */}

        <Link
          to="/profile"
          className="
            flex
            items-center
            gap-2.5
            rounded-xl
            py-1
            pl-1
            pr-2
            transition
          "
        >

          <div
            className="
              h-9
              w-9
              rounded-xl
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#23d3cf]
              to-[#347cf6]
              text-[11px]
              font-bold
              text-white
            "
          >
            {initials}
          </div>

          <div
            className="
              hidden
              md:block
              max-w-[130px]
            "
          >
            <p
              className="
                truncate
                text-xs
                font-semibold
              "
              style={{
                color:
                  'var(--ss-text)',
              }}
            >
              {name}
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
              Learner
            </p>
          </div>

          <ChevronDown
            size={13}
            className="
              hidden
              md:block
            "
            style={{
              color:
                'var(--ss-text-muted)',
            }}
          />

        </Link>

      </div>

    </header>
  );
}
