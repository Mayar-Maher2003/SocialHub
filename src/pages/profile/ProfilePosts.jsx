import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import AllPosts from "../home/AllPosts";
import { getPostsByUser } from "../../APIData/Profile";

export default function ProfilePosts({ userId }) {
  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile-posts", userId],
    queryFn: () => getPostsByUser(userId),
    enabled: !!userId,
  });

  if (!userId || isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner variant="dots" className="text-cyan-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        Error: {error?.response?.data?.message || error?.message}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <p className="text-muted text-center py-10">No posts yet.</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <AllPosts key={post._id || post.id} post={post} />
      ))}
    </div>
  );
}
