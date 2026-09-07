import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { AuthContext } from "../../context/AuthContext";
import { getMyProfile, getUserProfile } from "../../APIData/Profile";
import ProfileHeader from "./ProfileHeader";
import ProfilePosts from "./ProfilePosts";
import Bookmarks from "./Bookmarks";

export default function Profile() {
  const { userId } = useParams();
  const { userData } = useContext(AuthContext);
  const currentUserId = userData?.id || userData?._id || userData?.userId;
  const isOwnProfile = !userId || (!!currentUserId && String(userId) === String(currentUserId));

  const [activeTab, setActiveTab] = useState("posts");

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: isOwnProfile ? ["my-profile"] : ["user-profile", userId],
    queryFn: isOwnProfile ? getMyProfile : () => getUserProfile(userId),
  });

  const profileId = profile?._id || profile?.id || (isOwnProfile ? currentUserId : userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-page">
        <Spinner variant="dots" className="text-cyan-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-page pt-10">
        <p className="text-red-500 text-center">
          Error: {error?.response?.data?.message || error?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} targetUserId={profileId} />

        {isOwnProfile && (
          <div className="flex gap-2 border-b border-subtle">
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                activeTab === "posts"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-muted hover:text-ink"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                activeTab === "bookmarks"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-muted hover:text-ink"
              }`}
            >
              Bookmarks
            </button>
          </div>
        )}

        {(!isOwnProfile || activeTab === "posts") && <ProfilePosts userId={profileId} />}
        {isOwnProfile && activeTab === "bookmarks" && <Bookmarks />}
      </div>
    </div>
  );
}
