import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser } from "../../APIData/Profile";

export default function FollowButton({ userId, initiallyFollowing = false }) {
  const [isFollowing, setIsFollowing] = useState(!!initiallyFollowing);
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: (response) => {
      setIsFollowing(true);

      // Prefer counts the backend already returned in the follow response...
      const newFollowersCount =
        response?.data?.followersCount ??
        response?.data?.user?.followersCount ??
        response?.followersCount;
      const newFollowingCount =
        response?.data?.followingCount ??
        response?.data?.currentUser?.followingCount ??
        response?.followingCount;

      // ...falling back to refetching the real profile endpoints so the
      // backend stays the source of truth for the counts.
      if (newFollowersCount != null) {
        queryClient.setQueryData(["user-profile", userId], (old) =>
          old ? { ...old, followersCount: newFollowersCount } : old
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      }

      if (newFollowingCount != null) {
        queryClient.setQueryData(["my-profile"], (old) =>
          old ? { ...old, followingCount: newFollowingCount } : old
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      }
    },
  });

  if (!userId) return null;

  const handleClick = () => {
    if (isFollowing || isPending) return;
    mutate();
  };

  return (
    <div className="flex flex-col items-center sm:items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isFollowing || isPending}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition duration-200 cursor-pointer disabled:cursor-default ${
          isFollowing
            ? "bg-surface-2 text-muted border border-subtle"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
        } ${isPending ? "opacity-70" : ""}`}
      >
        {isPending ? "Following..." : isFollowing ? "Following" : "Follow"}
      </button>
      {isError && (
        <span className="text-xs text-red-400">Couldn't follow, try again</span>
      )}
    </div>
  );
}
