import { useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../APIData/Notifications";
import { normalizePage, getNextPageParam, markItemRead, markAllRead } from "../utils/notificationCache";

const NOTIFICATIONS_LIMIT = 10;
const ALL_KEY = ["notifications", { unread: false }];
const UNREAD_KEY = ["notifications", { unread: true }];

export function extractUnreadCount(response) {
  const val =
    response?.data?.count ??
    response?.data?.unreadCount ??
    response?.count ??
    response?.unreadCount ??
    0;
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
}

export function formatBadgeCount(count) {
  return count > 99 ? "99+" : String(count);
}

// Shared notifications data/actions, reused by the navbar bell popover and
// the standalone notifications page - both consume the same cached queries,
// so opening either surface doesn't trigger duplicate network calls.
export function useNotifications({ listEnabled }) {
  const queryClient = useQueryClient();

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const markingIdsRef = useRef(new Set());
  const markAllInFlightRef = useRef(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: getUnreadNotificationsCount,
    select: extractUnreadCount,
    staleTime: 60_000,
  });

  const listQueryKey = unreadOnly ? UNREAD_KEY : ALL_KEY;
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: listQueryKey,
    queryFn: ({ pageParam = 1 }) =>
      getNotifications({ unread: unreadOnly, page: pageParam, limit: NOTIFICATIONS_LIMIT }),
    getNextPageParam: getNextPageParam(NOTIFICATIONS_LIMIT),
    initialPageParam: 1,
    enabled: listEnabled,
    staleTime: 15_000,
  });

  const notifications = data?.pages.flatMap((p) => normalizePage(p).items) ?? [];

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      markAllRead(queryClient, ALL_KEY);
      queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
    onSettled: () => {
      markAllInFlightRef.current = false;
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => markNotificationAsRead(id),
    onSuccess: (_response, id) => {
      markItemRead(queryClient, ALL_KEY, id);
      queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
    onSettled: (_data, _err, id) => {
      markingIdsRef.current.delete(id);
      setMarkingId((current) => (current === id ? null : current));
    },
  });

  const handleMarkOne = (id) => {
    if (!id || markingIdsRef.current.has(id)) return;
    markingIdsRef.current.add(id);
    setMarkingId(id);
    markOneMutation.mutate(id);
  };

  const handleMarkAll = () => {
    if (markAllInFlightRef.current) return;
    markAllInFlightRef.current = true;
    markAllMutation.mutate();
  };

  return {
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
    isMarkingAll: markAllMutation.isPending,
  };
}
