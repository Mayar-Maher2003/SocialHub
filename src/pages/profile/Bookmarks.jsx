import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import AllPosts from "../home/AllPosts";
import { getBookmarks } from "../../APIData/Profile";

export default function Bookmarks() {
  const {
    data: bookmarks,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-bookmarks"],
    queryFn: getBookmarks,
  });

  if (isLoading) {
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

  if (!bookmarks || bookmarks.length === 0) {
    return <p className="text-muted text-center py-10">No bookmarks yet.</p>;
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((item) => {
        const post = item?.post || item;
        return <AllPosts key={post?._id || post?.id} post={post} />;
      })}
    </div>
  );
}
