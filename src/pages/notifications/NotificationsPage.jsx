import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { FaRegBell } from "react-icons/fa";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "../../components/layout/Navbar/NotificationItem";

export default function NotificationsPage() {
  const navigate = useNavigate();

  const {
    unreadCount,
    unreadOnly,
    setUnreadOnly,
    notifications,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markingId,
    handleMarkOne,
    handleMarkAll,
    isMarkingAll,
  } = useNotifications({ listEnabled: true });

  return (
    <div className="bg-page min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface rounded-2xl border border-subtle">
          <div className="flex items-center justify-between px-5 py-4 border-b border-subtle">
            <h1 className="text-xl font-bold text-ink">Notifications</h1>
            <button
              onClick={handleMarkAll}
              disabled={isMarkingAll || unreadCount <= 0}
              className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              {isMarkingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>

          <div className="flex gap-2 px-5 pt-4">
            <button
              onClick={() => setUnreadOnly(false)}
              className={`text-sm font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${
                !unreadOnly ? "bg-cyan-500 text-white" : "text-muted hover:text-ink"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              className={`text-sm font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${
                unreadOnly ? "bg-cyan-500 text-white" : "text-muted hover:text-ink"
              }`}
            >
              Unread
            </button>
          </div>

          <div className="p-4 space-y-2">
            {isLoading && (
              <div className="flex justify-center py-10">
                <Spinner variant="dots" className="text-cyan-500" />
              </div>
            )}

            {isError && (
              <p className="text-red-500 text-sm text-center py-8">
                {error?.response?.data?.message || error?.message || "Couldn't load notifications."}
              </p>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-14 text-muted">
                <FaRegBell className="text-3xl text-muted" />
                <p className="text-sm">
                  {unreadOnly ? "No unread notifications." : "No notifications yet."}
                </p>
              </div>
            )}

            {notifications.map((notification) => {
              const id = notification?._id || notification?.id;
              return (
                <NotificationItem
                  key={id}
                  notification={notification}
                  isMarking={markingId === id}
                  onMarkRead={handleMarkOne}
                  onNavigate={(path, { commentId } = {}) =>
                    navigate(commentId ? `${path}?comment=${commentId}` : path)
                  }
                />
              );
            })}

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
