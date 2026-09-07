import { useQuery } from "@tanstack/react-query";
import { Image } from "@heroui/react";
import { NavLink } from "react-router-dom";
import { getSuggestedUsers } from "../../APIData/Profile";
import FollowButton from "./FollowButton";

function SuggestionSkeletonRow() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-surface-2 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-surface-2" />
        <div className="h-2.5 w-16 rounded bg-surface-2" />
      </div>
      <div className="h-7 w-16 rounded-full bg-surface-2" />
    </div>
  );
}

export default function SuggestedUsers({ title = "Suggested Users" }) {
  const {
    data: suggestions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => getSuggestedUsers(10),
  });

  return (
    <div className="bg-surface rounded-2xl border border-subtle p-4">
      <h2 className="text-ink font-semibold mb-4">{title}</h2>

      {isLoading && (
        <div className="space-y-4">
          <SuggestionSkeletonRow />
          <SuggestionSkeletonRow />
          <SuggestionSkeletonRow />
        </div>
      )}

      {isError && (
        <p className="text-red-500 text-sm">
          Error: {error?.response?.data?.message || error?.message}
        </p>
      )}

      {!isLoading && !isError && (!suggestions || suggestions.length === 0) && (
        <p className="text-muted text-sm">No suggestions right now.</p>
      )}

      <div className="space-y-4">
        {suggestions?.map((s) => {
          const id = s?._id || s?.id;
          const alreadyFollowing = !!(s?.isFollowed || s?.isFollowing || s?.following === true);
          return (
            <div key={id} className="flex items-center justify-between gap-3">
              <NavLink to={`/profile/${id}`} className="flex items-center gap-3 min-w-0">
                <Image
                  alt="user photo"
                  height={40}
                  width={40}
                  radius="full"
                  className="object-cover flex-shrink-0"
                  src={s?.photo || "https://i.pravatar.cc/150?u=default"}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-cyan-400 capitalize truncate">
                    {s?.name || s?.username || "Unknown User"}
                  </p>
                  {s?.username && (
                    <p className="text-xs text-muted truncate">@{s.username}</p>
                  )}
                </div>
              </NavLink>
              <FollowButton userId={id} initiallyFollowing={alreadyFollowing} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
