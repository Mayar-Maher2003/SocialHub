import { useContext, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import { getPostComments, createComment } from "../APIData/Comments";
import { normalizePage, prependItem, getNextPageParam } from "../utils/commentCache";
import CommentItem from "./Comments";

const COMMENTS_LIMIT = 10;

export default function CommentsSection({ postId, highlightCommentId }) {
  const { user } = useContext(UserContext);
  const { userData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const queryKey = ["post-comments", postId];
  const [commentValue, setCommentValue] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => getPostComments(postId, { page: pageParam, limit: COMMENTS_LIMIT }),
    getNextPageParam: getNextPageParam(COMMENTS_LIMIT),
    initialPageParam: 1,
    enabled: !!postId,
    staleTime: 30_000,
  });

  const comments = useMemo(
    () => data?.pages.flatMap((p) => normalizePage(p).items) ?? [],
    [data]
  );

  // A notification can deep-link to a comment that's on a later page than
  // what's loaded by default - keep paging until it's found or we run out
  // of pages (nested replies aren't paged in here, so this only reaches
  // top-level comments).
  useEffect(() => {
    if (!highlightCommentId || !hasNextPage || isFetchingNextPage) return;
    const alreadyLoaded = comments.some(
      (c) => String(c?._id || c?.id) === String(highlightCommentId)
    );
    if (!alreadyLoaded) fetchNextPage();
  }, [highlightCommentId, comments, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const createMutation = useMutation({
    mutationFn: (content) => createComment(postId, content),
    onSuccess: (response) => {
      const newComment = response?.data?.comment ?? response?.data ?? response;
      // Same fix as post creation: a comment we just created is always
      // authored by us, so fill in any unpopulated commentCreator reference
      // with the live logged-in user instead of showing "Unknown User".
      const rawCreator = newComment?.commentCreator;
      const creatorIsPopulated = !!rawCreator && typeof rawCreator === "object";
      const enrichedComment = {
        ...newComment,
        commentCreator: {
          _id:
            (creatorIsPopulated ? rawCreator._id || rawCreator.id : rawCreator) ||
            user?._id || user?.id || userData?.id || userData?._id,
          name: (creatorIsPopulated && rawCreator.name) || user?.name || user?.username,
          photo: (creatorIsPopulated && rawCreator.photo) || user?.photo,
        },
      };
      prependItem(queryClient, queryKey, enrichedComment);
      setCommentValue("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = commentValue.trim();
    if (!trimmed || createMutation.isPending) return;
    createMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-cyan-400">Comments</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={commentValue}
          onChange={(e) => setCommentValue(e.target.value)}
          placeholder="Write a comment..."
          disabled={createMutation.isPending}
          className="flex-1 bg-surface border border-subtle rounded-xl px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!commentValue.trim() || createMutation.isPending}
          className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {createMutation.isPending ? "Posting..." : "Post"}
        </button>
      </form>

      {createMutation.isError && (
        <p className="text-red-400 text-sm">
          {createMutation.error?.response?.data?.message || createMutation.error?.message}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner variant="dots" className="text-cyan-500" />
        </div>
      )}

      {isError && (
        <p className="text-red-500 text-center">
          Error: {error?.response?.data?.message || error?.message}
        </p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-muted text-center py-6">No comments yet. Be the first to comment!</p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id || comment.id}
            comment={comment}
            postId={postId}
            queryKey={queryKey}
            highlight={
              !!highlightCommentId && String(comment._id || comment.id) === String(highlightCommentId)
            }
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
          >
            {isFetchingNextPage ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}
    </div>
  );
}
