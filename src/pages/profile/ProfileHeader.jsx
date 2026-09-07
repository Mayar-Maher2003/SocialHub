import { Image } from "@heroui/react";
import FollowButton from "./FollowButton";

export default function ProfileHeader({ profile, isOwnProfile, targetUserId }) {
  if (!profile) return null;

  const name = profile?.name || profile?.username || "Unknown User";
  const username = profile?.username;
  const bio = profile?.bio || profile?.about;
  const photo = profile?.photo || profile?.avatar;
  const postsCount = profile?.postsCount ?? profile?.postCount;
  const followersCount = profile?.followersCount ?? profile?.followers?.length;
  const followingCount = profile?.followingCount ?? profile?.following?.length;
  const alreadyFollowing = !!(
    profile?.isFollowed ||
    profile?.isFollowing ||
    profile?.following === true
  );

  return (
    <div className="bg-surface rounded-2xl border border-subtle p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <Image
        alt="profile photo"
        height={110}
        width={110}
        radius="full"
        className="object-cover border-2 border-cyan-500"
        src={photo || "https://i.pravatar.cc/150?u=default"}
      />

      <div className="flex-1 w-full text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink capitalize">{name}</h1>
            {username && <p className="text-sm text-muted">@{username}</p>}
          </div>

          {!isOwnProfile && targetUserId && (
            <FollowButton userId={targetUserId} initiallyFollowing={alreadyFollowing} />
          )}
        </div>

        {bio && <p className="text-ink mt-3">{bio}</p>}

        <div className="flex justify-center sm:justify-start gap-6 mt-4 text-sm text-muted">
          {postsCount != null && (
            <span>
              <span className="text-ink font-semibold">{postsCount}</span> Posts
            </span>
          )}
          {followersCount != null && (
            <span>
              <span className="text-ink font-semibold">{followersCount}</span> Followers
            </span>
          )}
          {followingCount != null && (
            <span>
              <span className="text-ink font-semibold">{followingCount}</span> Following
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
