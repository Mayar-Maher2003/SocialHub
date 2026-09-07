import { Image } from "@heroui/react";
import { formatRelativeTime } from "../../../utils/formatTime";

function getActorName(n) {
  return (
    n?.sender?.name ||
    n?.user?.name ||
    n?.from?.name ||
    n?.actor?.name ||
    n?.triggeredBy?.name ||
    n?.actorName ||
    n?.senderName ||
    null
  );
}

function getActorPhoto(n) {
  return (
    n?.sender?.photo ||
    n?.user?.photo ||
    n?.from?.photo ||
    n?.actor?.photo ||
    n?.triggeredBy?.photo ||
    null
  );
}

function getNotificationType(n) {
  const raw = n?.type || n?.notificationType || n?.action || n?.category;
  return typeof raw === "string" ? raw.toLowerCase() : "";
}

// Build a per-type "X liked your post" style message when the backend
// doesn't already send one - only falls back to the generic label when we
// can't identify the type or actor at all.
function buildMessage(n) {
  const explicit = n?.message || n?.title || n?.content || n?.text || n?.description;
  if (explicit) return explicit;

  const actor = getActorName(n) || "Someone";
  const type = getNotificationType(n);

  if (type.includes("follow")) return `${actor} started following you`;
  if (type.includes("reply")) return `${actor} replied to your comment`;
  if (type.includes("comment")) return `${actor} commented on your post`;
  if (type.includes("like")) return `${actor} liked your post`;

  return "New notification";
}

// Notifications may reference a post, a comment, or a user, either as a raw
// id or a populated object - resolve to one of the app's real existing
// routes only when we can identify a concrete id. Never invent a route.
function resolveDestination(notification) {
  const postId =
    notification?.post?._id ||
    notification?.post?.id ||
    notification?.postId ||
    notification?.targetPost?._id ||
    notification?.targetPost?.id ||
    notification?.comment?.post?._id ||
    notification?.comment?.post?.id ||
    notification?.comment?.postId ||
    (typeof notification?.post === "string" ? notification.post : null);

  const commentId =
    notification?.commentId ||
    notification?.comment?._id ||
    notification?.comment?.id ||
    notification?.replyId ||
    notification?.reply?._id ||
    notification?.reply?.id ||
    null;

  if (postId) return { path: `/post/${postId}`, commentId };

  const userId =
    notification?.sender?._id ||
    notification?.sender?.id ||
    notification?.user?._id ||
    notification?.user?.id ||
    notification?.from?._id ||
    notification?.from?.id ||
    notification?.actor?._id ||
    notification?.actor?.id;
  if (userId) return { path: `/profile/${userId}`, commentId: null };

  return null;
}

export default function NotificationItem({ notification, isMarking, onMarkRead, onNavigate }) {
  // TEMP DEBUG - remove once the real notification shape is confirmed
  // against the live backend.
  console.log("[DEBUG] notification object:", notification);

  const id = notification?._id || notification?.id;
  const isRead = !!(notification?.isRead ?? notification?.read);
  const text = buildMessage(notification);
  const timestamp = notification?.createdAt || notification?.date || notification?.timestamp;
  const actorPhoto = getActorPhoto(notification);
  const destination = resolveDestination(notification);
  const clickable = (!isRead && id) || destination;

  const handleClick = () => {
    if (!isRead && id) onMarkRead(id);
    if (destination) onNavigate?.(destination.path, { commentId: destination.commentId });
  };

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      className={`flex gap-3 p-3 rounded-lg transition-colors ${clickable ? "cursor-pointer" : ""} ${
        isRead ? "bg-surface hover:bg-surface-2" : "bg-surface-2 hover:bg-surface-2"
      } ${isMarking ? "opacity-60" : ""}`}
    >
      <div className="relative flex-shrink-0">
        <Image
          alt=""
          height={36}
          width={36}
          radius="full"
          className="object-cover"
          src={actorPhoto || "https://i.pravatar.cc/150?u=default"}
        />
        {!isRead && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 border border-surface" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug break-words ${isRead ? "text-muted" : "text-ink font-medium"}`}>
          {text}
        </p>
        {timestamp && (
          <p className="text-xs text-muted mt-1">{formatRelativeTime(timestamp)}</p>
        )}
      </div>
    </div>
  );
}
