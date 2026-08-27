import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  CircleAlert,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Trophy,
} from 'lucide-react';

import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Button } from '../../components/ui/Button';

import { notificationService } from '../../services/notificationService';
import { useToast } from '../../hooks/useToast';


const getStyle = (type) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCheck,
        iconClass: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      };

    case 'warning':
      return {
        icon: CircleAlert,
        iconClass: 'text-amber-400',
        bg: 'bg-amber-500/10',
      };

    case 'achievement':
      return {
        icon: Trophy,
        iconClass: 'text-violet-400',
        bg: 'bg-violet-500/10',
      };

    case 'course':
      return {
        icon: BookOpen,
        iconClass: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
      };

    default:
      return {
        icon: Info,
        iconClass: 'text-sky-400',
        bg: 'bg-sky-500/10',
      };
  }
};


const formatTime = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diff =
    Date.now() - date.getTime();

  const minute = 60000;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) {
    return 'Just now';
  }

  if (diff < hour) {
    const minutes =
      Math.floor(diff / minute);

    return `${minutes}m ago`;
  }

  if (diff < day) {
    const hours =
      Math.floor(diff / hour);

    return `${hours}h ago`;
  }

  if (diff < day * 7) {
    const days =
      Math.floor(diff / day);

    return `${days}d ago`;
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


export default function Notifications() {
  const { addToast } = useToast();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [processingId, setProcessingId] =
    useState(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  const [filter, setFilter] =
    useState('all');

  const [search, setSearch] =
    useState('');

  const [error, setError] =
    useState('');


  /* =====================================================
     LOAD
  ===================================================== */

  const loadNotifications = async (
    silent = false
  ) => {
    try {
      silent
        ? setRefreshing(true)
        : setLoading(true);

      setError('');

      const response =
        await notificationService
          .getNotifications();

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        'Notification load failed:',
        error
      );

      setError(
        error.response?.data?.detail ||
          'Unable to load notifications.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadNotifications();
  }, []);


  /* =====================================================
     FILTERING
  ===================================================== */

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (item) => !item.is_read
      ).length,
    [notifications]
  );


  const visibleNotifications =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return notifications.filter(
        (item) => {
          const matchesFilter =
            filter === 'all' ||
            (filter === 'unread' &&
              !item.is_read) ||
            (filter === 'read' &&
              item.is_read);

          const matchesSearch =
            !query ||
            item.title
              ?.toLowerCase()
              .includes(query) ||
            item.message
              ?.toLowerCase()
              .includes(query);

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      notifications,
      filter,
      search,
    ]);


  /* =====================================================
     MARK READ
  ===================================================== */

  const markRead = async (id) => {
    try {
      setProcessingId(id);

      await notificationService
        .markAsRead(id);

      setNotifications(
        (current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
          )
      );
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          'Unable to update notification',
        'error'
      );
    } finally {
      setProcessingId(null);
    }
  };


  const markAllRead = async () => {
    if (!unreadCount) return;

    try {
      setMarkingAll(true);

      await notificationService
        .markAllAsRead();

      setNotifications(
        (current) =>
          current.map((item) => ({
            ...item,
            is_read: true,
          }))
      );

      addToast(
        'All notifications marked as read',
        'success'
      );
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          'Unable to update notifications',
        'error'
      );
    } finally {
      setMarkingAll(false);
    }
  };


  /* =====================================================
     DELETE
  ===================================================== */

  const deleteNotification =
    async (id) => {
      try {
        setProcessingId(id);

        await notificationService
          .deleteNotification(id);

        setNotifications(
          (current) =>
            current.filter(
              (item) => item.id !== id
            )
        );

        addToast(
          'Notification removed',
          'success'
        );
      } catch (error) {
        addToast(
          error.response?.data
            ?.detail ||
            'Unable to remove notification',
          'error'
        );
      } finally {
        setProcessingId(null);
      }
    };


  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#20d8d3]"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-[1100px] mx-auto space-y-6">

      <Breadcrumb
        items={[
          { label: 'Account' },
          { label: 'Notifications' },
        ]}
      />


      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border border-slate-800
          bg-[#10151e]
          px-6 py-7
          sm:px-8
        "
      >
        <div
          className="
            absolute
            -right-24 -top-24
            h-72 w-72
            rounded-full
            bg-cyan-500/[0.07]
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-5
          "
        >
          <div>

            <div
              className="
                inline-flex
                items-center gap-2
                rounded-full
                border border-cyan-500/15
                bg-cyan-500/[0.07]
                px-3 py-1.5
                text-[11px]
                font-semibold
                text-[#20d8d3]
              "
            >
              <Bell size={13} />
              INBOX
            </div>

            <h1
              className="
                mt-4
                text-3xl
                font-bold
                tracking-tight
                text-white
              "
            >
              Notifications
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              You have{' '}
              <span className="font-semibold text-slate-300">
                {unreadCount}
              </span>{' '}
              unread notification
              {unreadCount === 1
                ? ''
                : 's'}.
            </p>

          </div>


          <div className="flex items-center gap-2">

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={() =>
                loadNotifications(true)
              }
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />
              Refresh
            </Button>


            {unreadCount > 0 && (
              <Button
                type="button"
                size="sm"
                loading={markingAll}
                disabled={markingAll}
                onClick={markAllRead}
              >
                <CheckCheck size={14} />
                Mark all read
              </Button>
            )}

          </div>
        </div>

      </section>


      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section
        className="
          rounded-2xl
          border border-slate-800
          bg-[#11161f]
          p-3
        "
      >
        <div
          className="
            flex flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >

          {/* FILTERS */}

          <div
            className="
              inline-flex
              self-start
              rounded-xl
              bg-[#0c1118]
              p-1
            "
          >
            {[
              {
                id: 'all',
                label: 'All',
                count:
                  notifications.length,
              },
              {
                id: 'unread',
                label: 'Unread',
                count: unreadCount,
              },
              {
                id: 'read',
                label: 'Read',
                count:
                  notifications.length -
                  unreadCount,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFilter(item.id)
                }
                className={`
                  rounded-lg
                  px-3 py-2
                  text-xs
                  font-semibold
                  transition-all
                  ${
                    filter === item.id
                      ? `
                        bg-slate-800
                        text-white
                        shadow-sm
                      `
                      : `
                        text-slate-600
                        hover:text-slate-300
                      `
                  }
                `}
              >
                {item.label}

                <span
                  className={`
                    ml-1.5
                    text-[10px]
                    ${
                      filter === item.id
                        ? 'text-[#20d8d3]'
                        : 'text-slate-700'
                    }
                  `}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>


          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              sm:w-[280px]
            "
          >
            <Search
              size={15}
              className="
                absolute
                left-3 top-1/2
                -translate-y-1/2
                text-slate-600
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search notifications..."
              className="
                w-full
                rounded-xl
                border border-slate-800
                bg-[#0c1118]
                py-2.5
                pl-9 pr-3
                text-xs
                text-slate-300
                outline-none
                transition
                placeholder:text-slate-700
                focus:border-cyan-500/30
              "
            />
          </div>

        </div>
      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="
            rounded-2xl
            border border-red-500/15
            bg-red-500/[0.04]
            px-5 py-4
          "
        >
          <div className="flex items-center gap-3">
            <CircleAlert
              size={17}
              className="text-red-400"
            />

            <p className="text-xs text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}


      {/* =================================================
          INBOX
      ================================================= */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border border-slate-800
          bg-[#11161f]
        "
      >

        {visibleNotifications.length ? (

          <div className="divide-y divide-slate-800">

            {visibleNotifications.map(
              (notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={
                    notification
                  }
                  processing={
                    processingId ===
                    notification.id
                  }
                  onRead={() =>
                    markRead(
                      notification.id
                    )
                  }
                  onDelete={() =>
                    deleteNotification(
                      notification.id
                    )
                  }
                />
              )
            )}

          </div>

        ) : (

          <div className="px-6 py-16 text-center">

            <div
              className="
                mx-auto
                h-14 w-14
                rounded-2xl
                bg-slate-800/50
                flex items-center justify-center
              "
            >
              <Bell
                size={23}
                className="text-slate-600"
              />
            </div>

            <h3
              className="
                mt-4
                text-sm
                font-semibold
                text-slate-300
              "
            >
              {filter === 'unread'
                ? 'You’re all caught up'
                : search
                ? 'No matching notifications'
                : 'Your inbox is empty'}
            </h3>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-xs
                leading-5
                text-slate-600
              "
            >
              {filter === 'unread'
                ? 'There are no unread notifications waiting for you.'
                : search
                ? 'Try searching with a different keyword.'
                : 'Course updates, achievements and learning alerts will appear here.'}
            </p>

          </div>

        )}

      </section>

    </div>
  );
}


/* =========================================================
   ROW
========================================================= */

function NotificationRow({
  notification,
  processing,
  onRead,
  onDelete,
}) {
  const style =
    getStyle(notification.type);

  const Icon = style.icon;


  return (
    <div
      className={`
        group
        relative
        px-5 py-5
        sm:px-6
        transition
        hover:bg-white/[0.015]
        ${
          !notification.is_read
            ? 'bg-cyan-500/[0.018]'
            : ''
        }
      `}
    >

      {!notification.is_read && (
        <span
          className="
            absolute
            left-0 top-0 bottom-0
            w-[2px]
            bg-[#20d8d3]
          "
        />
      )}


      <div className="flex items-start gap-4">

        {/* ICON */}

        <div
          className={`
            h-10 w-10
            shrink-0
            rounded-xl
            flex items-center
            justify-center
            ${style.bg}
          `}
        >
          <Icon
            size={17}
            className={
              style.iconClass
            }
          />
        </div>


        {/* CONTENT */}

        <div className="min-w-0 flex-1">

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-start
              sm:justify-between
              gap-2
            "
          >

            <div className="min-w-0">

              <div
                className="
                  flex items-center
                  gap-2
                "
              >
                <h3
                  className={`
                    truncate
                    text-sm
                    ${
                      notification.is_read
                        ? `
                          font-medium
                          text-slate-400
                        `
                        : `
                          font-semibold
                          text-slate-100
                        `
                    }
                  `}
                >
                  {notification.title}
                </h3>


                {!notification.is_read && (
                  <span
                    className="
                      h-1.5 w-1.5
                      shrink-0
                      rounded-full
                      bg-[#20d8d3]
                    "
                  />
                )}
              </div>


              <p
                className="
                  mt-1.5
                  max-w-3xl
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                {notification.message}
              </p>

            </div>


            <span
              className="
                shrink-0
                text-[10px]
                text-slate-700
              "
            >
              {formatTime(
                notification.created_at
              )}
            </span>

          </div>


          {/* ACTIONS */}

          <div
            className="
              mt-3
              flex items-center
              gap-3
            "
          >

            {!notification.is_read && (
              <button
                type="button"
                disabled={processing}
                onClick={onRead}
                className="
                  inline-flex
                  items-center gap-1.5
                  text-[10px]
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-[#20d8d3]
                  disabled:opacity-40
                "
              >
                {processing ? (
                  <Loader2
                    size={12}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={12} />
                )}

                Mark as read
              </button>
            )}


            <button
              type="button"
              disabled={processing}
              onClick={onDelete}
              className="
                inline-flex
                items-center gap-1.5
                text-[10px]
                font-semibold
                text-slate-700
                transition
                hover:text-red-400
                disabled:opacity-40
              "
            >
              <Trash2 size={12} />
              Remove
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}