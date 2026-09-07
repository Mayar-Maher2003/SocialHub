import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Popover, PopoverTrigger, PopoverContent, Spinner } from "@heroui/react";
import { FaRegBell } from "react-icons/fa";
import { useNotifications, formatBadgeCount } from "../../../hooks/useNotifications";
import { useSettings } from "../../../context/SettingsContext";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();

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
  } = useNotifications({ listEnabled: isOpen });

  const handleNavigate = (path, { commentId } = {}) => {
    setIsOpen(false);
    navigate(commentId ? `${path}?comment=${commentId}` : path);
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end" backdrop="transparent">
      <PopoverTrigger>
        <button
          aria-label="Notifications"
          className="relative p-1 text-muted hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <Badge
            content={formatBadgeCount(unreadCount)}
            isInvisible={settings.muteNotifications || unreadCount <= 0}
            placement="top-right"
            shape="circle"
            classNames={{ badge: "bg-cyan-500 text-white border-0" }}
          >
            <FaRegBell className="text-xl" />
          </Badge>
        </button>
      </PopoverTrigger>

      <PopoverContent className="bg-surface border border-subtle text-ink p-0 w-[92vw] sm:w-[360px] max-w-[400px]">
        <div className="w-full max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
            <h3 className="font-semibold text-ink">Notifications</h3>
            <button
              onClick={handleMarkAll}
              disabled={isMarkingAll || unreadCount <= 0}
              className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              {isMarkingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>

          <div className="flex gap-2 px-4 pt-3">
            <button
              onClick={() => setUnreadOnly(false)}
              className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-colors ${
                !unreadOnly ? "bg-cyan-500 text-white" : "text-muted hover:text-ink"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-colors ${
                unreadOnly ? "bg-cyan-500 text-white" : "text-muted hover:text-ink"
              }`}
            >
              Unread
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Spinner variant="dots" className="text-cyan-500" />
              </div>
            )}

            {isError && (
              <p className="text-red-500 text-sm text-center py-6">
                {error?.response?.data?.message || error?.message || "Couldn't load notifications."}
              </p>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <p className="text-muted text-sm text-center py-8">
                {unreadOnly ? "No unread notifications." : "No notifications yet."}
              </p>
            )}

            {notifications.map((notification) => {
              const id = notification?._id || notification?.id;
              return (
                <NotificationItem
                  key={id}
                  notification={notification}
                  isMarking={markingId === id}
                  onMarkRead={handleMarkOne}
                  onNavigate={handleNavigate}
                />
              );
            })}

            {hasNextPage && (
              <div className="flex justify-center pt-1">
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

          <div className="px-4 py-2 border-t border-subtle text-center">
            <button
              onClick={() => handleNavigate("/notifications")}
              className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              View all notifications
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
