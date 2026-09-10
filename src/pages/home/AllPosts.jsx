import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
} from "@heroui/react";
import { HiDotsHorizontal } from "react-icons/hi";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

import { useContext, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "../../context/UserContext";
import { AuthContext } from "../../context/AuthContext";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import CommentItem from "./../../PostActions/Comments";
import EditPostModal from "./../../PostActions/EditPostModal";
import DeleteConfirmModal from "./../../PostActions/DeleteConfirmModal";
import { likePost, bookmarkPost, sharePost } from "../../APIData/Posts";
import { patchPostEverywhere } from "../../utils/postCache";
import { formatRelativeTime } from "../../utils/formatTime";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";

export default function AllPosts({ post }) {
  const { user } = useContext(UserContext);
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentUserId = user?._id || user?.id || userData?.id || userData?._id;
  const authorId = post?.user?._id || post?.user?.id;
  const isOwner = !!currentUserId && !!authorId && String(currentUserId) === String(authorId);

  const postId = post?._id || post?.id;
  const likesCount = post?.likesCount ?? (Array.isArray(post?.likes) ? post.likes.length : 0);
  const isLiked = !!(
    post?.isLiked ??
    post?.liked ??
    (Array.isArray(post?.likes) &&
      currentUserId &&
      post.likes.some((l) => String(l?._id || l) === String(currentUserId)))
  );
  const isBookmarked = !!(post?.isBookmarked ?? post?.bookmarked ?? post?.saved);
  const sharesCount = post?.sharesCount ?? (Array.isArray(post?.shares) ? post.shares.length : 0);

  // Ref guards (not just isPending) so a genuine same-tick rapid click can't
  // fire a second request before the mutation's pending state has re-rendered.
  const likeInFlightRef = useRef(false);
  const bookmarkInFlightRef = useRef(false);
  const shareInFlightRef = useRef(false);

  const likeMutation = useMutation({
    mutationFn: () => likePost(postId),
    onSuccess: (response) => {
      const payload = response?.data?.post ?? response?.data ?? response ?? {};
      patchPostEverywhere(queryClient, postId, (current) => {
        const currentLiked = !!(current?.isLiked ?? current?.liked ?? isLiked);
        const currentLikesCount = current?.likesCount ?? likesCount;
        return {
          likesCount:
            payload?.likesCount ??
            (Array.isArray(payload?.likes) ? payload.likes.length : undefined) ??
            (currentLiked ? Math.max(0, currentLikesCount - 1) : currentLikesCount + 1),
          isLiked: payload?.isLiked ?? payload?.liked ?? !currentLiked,
        };
      });
    },
    onSettled: () => {
      likeInFlightRef.current = false;
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkPost(postId),
    onSuccess: (response) => {
      const payload = response?.data?.post ?? response?.data ?? response ?? {};
      patchPostEverywhere(queryClient, postId, (current) => {
        const currentBookmarked = !!(current?.isBookmarked ?? current?.bookmarked ?? current?.saved ?? isBookmarked);
        return {
          isBookmarked: payload?.isBookmarked ?? payload?.bookmarked ?? payload?.saved ?? !currentBookmarked,
        };
      });
    },
    onSettled: () => {
      bookmarkInFlightRef.current = false;
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => sharePost(postId, { body: post?.body, image: post?.image }),
    onSuccess: (response) => {
      const payload = response?.data?.post ?? response?.data ?? response ?? {};
      const nextSharesCount =
        payload?.sharesCount ?? (Array.isArray(payload?.shares) ? payload.shares.length : undefined);
      if (nextSharesCount != null) {
        patchPostEverywhere(queryClient, postId, () => ({ sharesCount: nextSharesCount }));
      }
      showToast("Post shared", { type: "success" });
    },
    onError: () => {
      showToast("Failed to share post", { type: "error" });
    },
    onSettled: () => {
      shareInFlightRef.current = false;
    },
  });

  const handleLike = () => {
    if (!postId || likeInFlightRef.current) return;
    likeInFlightRef.current = true;
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!postId || bookmarkInFlightRef.current) return;
    bookmarkInFlightRef.current = true;
    bookmarkMutation.mutate();
  };

  const handleShare = () => {
    if (!postId || shareInFlightRef.current) return;
    shareInFlightRef.current = true;
    shareMutation.mutate();
  };

  const goToPost = () => {
    if (postId) navigate(`/post/${postId}`);
  };

  const topComment = post?.topComment;

  return (
    <div className="flex justify-center px-4 py-2 bg-page">
      <div className="w-full max-w-[900px]">
        <Card className="bg-surface text-ink p-5 rounded-2xl shadow-lg border border-subtle">
          {/* Header */}
          <CardHeader className="flex justify-between items-center pb-3">
            <div className="flex gap-3 items-center">
              <Image
                alt="user photo"
                height={45}
                width={45}
                radius="full"
                className="object-cover"
                src={post?.user?.photo || "https://i.pravatar.cc/150?u=default"}
              />
              <div>
                <p className="text-lg font-semibold text-cyan-400 capitalize">
                  {post?.user?.name || "Unknown User"}
                </p>
                <p className="text-xs text-muted">
                  {formatRelativeTime(post?.createdAt)}
                </p>
              </div>
            </div>

            <Dropdown backdrop="blur" className="bg-surface">
              <DropdownTrigger>
                <Button className="text-muted bg-transparent hover:text-cyan-400 p-1">
                  <HiDotsHorizontal className="text-lg" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Post Actions"
                variant="faded"
                className="bg-surface text-ink min-w-[150px]"
              >
                <DropdownItem key="copy">Copy link</DropdownItem>
                {isOwner && (
                  <DropdownItem key="edit" onPress={() => setShowEditModal(true)}>
                    Edit Post
                  </DropdownItem>
                )}
                {isOwner && (
                  <DropdownItem
                    key="delete"
                    color="danger"
                    className="text-red-500"
                    onPress={() => setShowDeleteModal(true)}
                  >
                    Delete Post
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </CardHeader>

          {/* Body */}
          <CardBody className="space-y-3">
            {post?.body && (
              <p className="text-base text-ink leading-relaxed whitespace-pre-wrap">
                {post.body}
              </p>
            )}

            {post?.image && (
              <div className="w-full max-h-[420px] overflow-hidden rounded-xl bg-page">
                <Image
                  alt="post image"
                  src={post.image}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </CardBody>

          {((settings.showLikeCounts && likesCount > 0) || (post?.commentsCount ?? 0) > 0) && (
            <div className="flex justify-between items-center px-1 py-2 mt-1 text-xs text-muted">
              <span>
                {settings.showLikeCounts && likesCount > 0
                  ? `${likesCount} ${likesCount === 1 ? "like" : "likes"}`
                  : ""}
              </span>
              <span>
                {post?.commentsCount > 0 ? `${post.commentsCount} comments` : ""}
              </span>
            </div>
          )}

          {/* Action bar */}
          <CardFooter className="flex justify-between text-muted gap-1 pt-2">
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60 hover:bg-surface-2 ${
                isLiked ? "text-cyan-400" : "hover:text-cyan-400"
              }`}
            >
              {isLiked ? <AiFillLike size={18} /> : <AiOutlineLike size={18} />}
              <span className="text-sm">Like</span>
            </button>

            <button
              onClick={goToPost}
              className="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg transition-colors cursor-pointer hover:bg-surface-2 hover:text-cyan-400"
            >
              <FaRegComment size={18} />
              <span className="text-sm">Comment</span>
            </button>

            <button
              onClick={handleShare}
              disabled={shareMutation.isPending}
              className="flex items-center justify-center gap-2 flex-1 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60 hover:bg-surface-2 hover:text-cyan-400"
            >
              <RiShareForwardLine size={18} />
              <span className="text-sm">{sharesCount > 0 ? `Share (${sharesCount})` : "Share"}</span>
            </button>

            <button
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60 hover:bg-surface-2 ${
                isBookmarked ? "text-cyan-400" : "hover:text-cyan-400"
              }`}
            >
              {isBookmarked ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
              <span className="text-sm">Save</span>
            </button>
          </CardFooter>

          {(likeMutation.isError || bookmarkMutation.isError || shareMutation.isError) && (
            <p className="text-red-400 text-xs px-1 pb-1">
              {likeMutation.error?.response?.data?.message ||
                bookmarkMutation.error?.response?.data?.message ||
                shareMutation.error?.response?.data?.message ||
                likeMutation.error?.message ||
                bookmarkMutation.error?.message ||
                shareMutation.error?.message ||
                "Something went wrong, please try again."}
            </p>
          )}

          {topComment && <CommentItem comment={topComment} />}

          {postId && (
            <NavLink
              to={`/post/${postId}`}
              className="p-2 text-cyan-400 hover:text-cyan-300 transition-all text-sm"
            >
              {post.commentsCount > 0 ? "View all comments" : "Add a comment"}
            </NavLink>
          )}
        </Card>
      </div>

      {isOwner && (
        <>
          <EditPostModal
            post={post}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
          <DeleteConfirmModal
            postId={postId}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          />
        </>
      )}
    </div>
  );
}
