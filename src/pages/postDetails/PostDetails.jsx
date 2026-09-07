import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSinglePost } from "../../APIData/Posts";
import {  Spinner } from "@heroui/react";
import AllPosts from './../home/AllPosts';
import CommentsSection from "../../PostActions/CommentsSection";


export default function PostDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const highlightCommentId = searchParams.get("comment");

  const {data: post, isLoading, isError, error } = useQuery({
    queryKey: ["single_post", id],
    queryFn: () => getSinglePost(id),
    select: (data) => data.post,
    // A 404 (deleted/missing post) will never succeed on retry - retrying it
    // anyway just delays the "not found" message behind several seconds of
    // exponential backoff. Still retry other, possibly-transient errors.
    retry: (failureCount, err) => err?.response?.status !== 404 && failureCount < 2,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-page">
        <Spinner variant="dots" className="text-cyan-500" />
      </div>
    );
  }

  // Error state, or a 200 with no post - e.g. a notification pointing at a
  // post that's since been deleted. Show a friendly message instead of
  // crashing on `post._id` below or rendering a blank page.
  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 min-h-screen bg-page text-center px-4">
        <p className="text-ink text-lg font-medium">Post not found</p>
        <p className="text-muted text-sm max-w-sm">
          {error?.response?.status === 404 || !error
            ? "This post may have been deleted or is no longer available."
            : error?.response?.data?.message || error?.message}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4 p-4 bg-page min-h-screen text-ink">
      <AllPosts key={post._id} post={post} />

      <div className="flex justify-center px-4">
        <div className="w-full max-w-[500px]">
          <CommentsSection postId={post._id} highlightCommentId={highlightCommentId} />
        </div>
      </div>
    </div>
  );
}