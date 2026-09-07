import { useContext, useEffect, useRef, useState } from "react";
import { Image, Spinner } from "@heroui/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AiOutlineLike } from "react-icons/ai";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import {
  updateComment,
  deleteComment,
  likeComment,
  createReply,
  getCommentReplies,
} from "../APIData/Comments";
import { updateItem, removeItem, prependItem, normalizePage, getNextPageParam } from "../utils/commentCache";
import { formatRelativeTime } from "../utils/formatTime";

const REPLIES_LIMIT = 10;

export default function CommentItem({ comment, postId, queryKey, isReply = false, highlight = false }) {
  const { user } = useContext(UserContext);
  const { userData } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const containerRef = useRef(null);

  useEffect(() => {
    if (!highlight) return;
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight]);

  const currentUserId = user?._id || user?.id || userData?.id || userData?._id;
  const authorId = comment?.commentCreator?._id || comment?.commentCreator?.id;
  const isOwner = !!currentUserId && !!authorId && String(currentUserId) === String(authorId);
  // Read-only preview mode: used e.g. for the topComment glimpse on the Home
  // feed, which isn't backed by a paginated comments cache to update.
  const interactive = !!postId && !!queryKey;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment?.content || "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyValue, setReplyValue] = useState("");

  const likesCount = comment?.likesCount ?? (Array.isArray(comment?.likes) ? comment.likes.length : 0);
  const likedByMe = !!(
    comment?.isLiked ??
    comment?.liked ??
    (Array.isArray(comment?.likes) &&
      currentUserId &&
      comment.likes.some((l) => String(l?._id || l) === String(currentUserId)))
  );
  const repliesCount = comment?.repliesCount ?? (Array.isArray(comment?.replies) ? comment.replies.length : 0);

  const updateMutation = useMutation({
    mutationFn: (content) => updateComment(postId, comment._id, content),
    onSuccess: (response, content) => {
      const payload = response?.data?.comment ?? response?.data ?? response ?? {};
      updateItem(queryClient, queryKey, comment._id, (old) => ({
        ...old,
        ...payload,
        content: payload?.content ?? content,
      }));
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(postId, comment._id),
    onSuccess: () => removeItem(queryClient, queryKey, comment._id),
  });

  // A ref (not React state) so a second click landing in the same tick as
  // the first - before isPending has re-rendered the disabled button - is
  // still synchronously blocked.
  const likeInFlightRef = useRef(false);
  const likeMutation = useMutation({
    mutationFn: () => likeComment(postId, comment._id),
    onSuccess: (response) => {
      const payload = response?.data?.comment ?? response?.data ?? response ?? {};
      updateItem(queryClient, queryKey, comment._id, (old) => {
        const nextLikesCount =
          payload?.likesCount ??
          (Array.isArray(payload?.likes) ? payload.likes.length : undefined) ??
          (likedByMe ? Math.max(0, likesCount - 1) : likesCount + 1);
        const nextLiked = payload?.isLiked ?? payload?.liked ?? !likedByMe;
        return { ...old, likesCount: nextLikesCount, isLiked: nextLiked };
      });
    },
    onSettled: () => {
      likeInFlightRef.current = false;
    },
  });

  const handleLikeClick = () => {
    if (likeInFlightRef.current) return;
    likeInFlightRef.current = true;
    likeMutation.mutate();
  };

  const repliesQueryKey = ["comment-replies", postId, comment._id];
  const {
    data: repliesData,
    isLoading: repliesLoading,
    isError: repliesError,
    fetchNextPage: fetchMoreReplies,
    hasNextPage: hasMoreReplies,
    isFetchingNextPage: fetchingMoreReplies,
  } = useInfiniteQuery({
    queryKey: repliesQueryKey,
    queryFn: ({ pageParam = 1 }) =>
      getCommentReplies(postId, comment._id, { page: pageParam, limit: REPLIES_LIMIT }),
    getNextPageParam: getNextPageParam(REPLIES_LIMIT),
    initialPageParam: 1,
    enabled: interactive && !isReply && showReplies,
    // Collapsing/expanding the same comment's replies repeatedly shouldn't
    // re-hit the network every time.
    staleTime: 60_000,
  });

  const replies = repliesData?.pages.flatMap((p) => normalizePage(p).items) ?? [];

  const replyMutation = useMutation({
    mutationFn: (content) => createReply(postId, comment._id, content),
    onSuccess: (response) => {
      const newReply = response?.data?.reply ?? response?.data?.comment ?? response?.data ?? response;
      // Same fix as post/comment creation: a reply we just created is
      // always authored by us, so fill in any unpopulated commentCreator
      // reference with the live logged-in user.
      const rawCreator = newReply?.commentCreator;
      const creatorIsPopulated = !!rawCreator && typeof rawCreator === "object";
      const enrichedReply = {
        ...newReply,
        commentCreator: {
          _id: (creatorIsPopulated ? rawCreator._id || rawCreator.id : rawCreator) || currentUserId,
          name: (creatorIsPopulated && rawCreator.name) || user?.name || user?.username,
          photo: (creatorIsPopulated && rawCreator.photo) || user?.photo,
        },
      };
      prependItem(queryClient, repliesQueryKey, enrichedReply);
      setReplyValue("");
      setShowReplyForm(false);
      setShowReplies(true);
    },
  });

  const avatarSize = isReply ? 32 : 40;

  return (
    <div
      ref={containerRef}
      className={`flex gap-3 p-4 rounded-xl border border-subtle hover:border-cyan-500/40 transition-all duration-300 bg-surface-2 ${
        highlight ? "animate-[comment-highlight-fade_2.5s_ease-out_forwards]" : ""
      }`}
    >
      <Image
        alt="user photo"
        height={avatarSize}
        width={avatarSize}
        radius="full"
        className="object-cover flex-shrink-0"
        src={comment?.commentCreator?.photo || "https://i.pravatar.cc/150?u=default"}
      />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-cyan-400 capitalize">
              {comment?.commentCreator?.name || "Unknown User"}
            </p>
            <p className="text-xs text-muted">
              {formatRelativeTime(comment?.createdAt)}
            </p>
          </div>

          {interactive && isOwner && !isEditing && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setEditValue(comment?.content || "");
                  setIsEditing(true);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                Edit
              </button>

              {confirmingDelete ? (
                <span className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-600 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleteMutation.isPending}
                    className="text-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {deleteMutation.isError && (
          <p className="text-red-400 text-xs mt-1">
            {deleteMutation.error?.response?.data?.message || "Couldn't delete this comment."}
          </p>
        )}

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={2}
              disabled={updateMutation.isPending}
              className="w-full bg-page border border-subtle rounded-lg p-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none disabled:opacity-60"
            />
            {updateMutation.isError && (
              <p className="text-red-400 text-xs">
                {updateMutation.error?.response?.data?.message || updateMutation.error?.message}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  editValue.trim() && !updateMutation.isPending && updateMutation.mutate(editValue.trim())
                }
                disabled={!editValue.trim() || updateMutation.isPending}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  updateMutation.reset();
                }}
                disabled={updateMutation.isPending}
                className="text-xs text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink mt-2 leading-relaxed break-words">{comment?.content}</p>
        )}

        {interactive && !isEditing && (
          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <button
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-1 transition cursor-pointer disabled:opacity-60 ${
                likedByMe ? "text-cyan-400" : "hover:text-cyan-400"
              }`}
            >
              <AiOutlineLike size={14} />
              {likesCount > 0 ? likesCount : "Like"}
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                Reply
              </button>
            )}

            {!isReply && repliesCount > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                {showReplies ? "Hide Replies" : `View Replies (${repliesCount})`}
              </button>
            )}
          </div>
        )}

        {likeMutation.isError && (
          <p className="text-red-400 text-xs mt-1">Couldn't update like, try again.</p>
        )}

        {interactive && !isReply && showReplyForm && (
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                value={replyValue}
                onChange={(e) => setReplyValue(e.target.value)}
                placeholder="Write a reply..."
                disabled={replyMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && replyValue.trim() && !replyMutation.isPending) {
                    replyMutation.mutate(replyValue.trim());
                  }
                }}
                className="flex-1 bg-page border border-subtle rounded-lg px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 disabled:opacity-60"
              />
              <button
                onClick={() =>
                  replyValue.trim() && !replyMutation.isPending && replyMutation.mutate(replyValue.trim())
                }
                disabled={!replyValue.trim() || replyMutation.isPending}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
              >
                {replyMutation.isPending ? "Sending..." : "Send"}
              </button>
            </div>
            {replyMutation.isError && (
              <p className="text-red-400 text-xs mt-1">
                {replyMutation.error?.response?.data?.message || replyMutation.error?.message}
              </p>
            )}
          </div>
        )}

        {interactive && !isReply && showReplies && (
          <div className="mt-3 ml-2 space-y-2 border-l border-subtle pl-3">
            {repliesLoading && (
              <div className="flex justify-center py-3">
                <Spinner size="sm" variant="dots" className="text-cyan-500" />
              </div>
            )}

            {repliesError && <p className="text-red-400 text-xs">Couldn't load replies.</p>}

            {!repliesLoading && !repliesError && replies.length === 0 && (
              <p className="text-muted text-xs">No replies yet.</p>
            )}

            {replies.map((reply) => (
              <CommentItem
                key={reply._id || reply.id}
                comment={reply}
                postId={postId}
                queryKey={repliesQueryKey}
                isReply
              />
            ))}

            {hasMoreReplies && (
              <button
                onClick={() => fetchMoreReplies()}
                disabled={fetchingMoreReplies}
                className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
              >
                {fetchingMoreReplies ? "Loading..." : "Load more replies"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
