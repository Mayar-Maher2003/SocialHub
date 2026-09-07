import React from "react";
import { useQuery } from "@tanstack/react-query";
import AllPosts from "./AllPosts";
import CreatePost from "./CreatePost";
import PostCardSkeleton from "./PostCardSkeleton";
import { AiOutlineFileText } from "react-icons/ai";
import  {getAllPosts}  from "../../APIData/Posts";
import getUserPosts from "../../APIData/UserPosts";

export default function Home({isHome = true , userId}) {
  // React Query
  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: isHome? ["all-posts"]: ["user.posts" , userId],
    queryFn: isHome ? getAllPosts : () => getUserPosts(userId),
  });


  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 bg-page min-h-screen">
        {isHome && <CreatePost />}
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error: {error?.response?.data?.message || error?.message}
      </div>
    );
  }
  // display posts
  return (
    <div className="space-y-4 p-4 bg-page min-h-screen">
      {isHome && <CreatePost />}
      {posts?.length > 0 ? (
        posts.map((post) => <AllPosts key={post._id} post={post} />)
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-muted">
          <AiOutlineFileText className="text-4xl text-muted" />
          <p className="text-sm">No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}
