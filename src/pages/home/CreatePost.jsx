import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "@heroui/react";
import { UserContext } from "../../context/UserContext";
import { createPost } from "../../APIData/Posts";
import { prependPostToFeeds } from "../../utils/postCache";

export default function CreatePost() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => createPost({ body: body.trim(), image: imageFile }),
    onSuccess: (newPost) => {
      // The create-post response's author reference isn't always populated
      // (some backends return it as a raw id, or omit it) - since we just
      // created this post ourselves, we already know who the author is, so
      // fill in any missing name/photo from the live logged-in user rather
      // than showing "Unknown User" + a default avatar until a later
      // background refetch happens to correct it.
      const rawAuthor = newPost?.user;
      const authorIsPopulated = !!rawAuthor && typeof rawAuthor === "object";
      const enrichedPost = {
        ...newPost,
        user: {
          _id: (authorIsPopulated ? rawAuthor._id || rawAuthor.id : rawAuthor) || user?._id || user?.id,
          name: (authorIsPopulated && rawAuthor.name) || user?.name || user?.username,
          photo: (authorIsPopulated && rawAuthor.photo) || user?.photo,
        },
      };
      prependPostToFeeds(queryClient, enrichedPost);
      setBody("");
      setImageFile(null);
      setImagePreview(null);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const canSubmit = !isPending && (body.trim() || imageFile);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutate();
  };

  return (
    <div className="flex justify-center px-4 pt-4 bg-page">
      <div className="w-full max-w-[500px]">
        <form
          onSubmit={handleSubmit}
          className="bg-surface text-ink p-5 rounded-2xl shadow-lg border border-subtle space-y-3"
        >
          <div className="flex gap-3 items-start">
            <Image
              alt="your photo"
              height={40}
              width={40}
              radius="full"
              className="object-cover flex-shrink-0"
              src={user?.photo || "https://i.pravatar.cc/150?u=default"}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              disabled={isPending}
              className="flex-1 bg-page border border-subtle rounded-xl p-3 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none disabled:opacity-60"
            />
          </div>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="rounded-xl max-h-[300px] object-cover w-full"
            />
          )}

          {isError && (
            <p className="text-red-400 text-sm">
              {error?.response?.data?.message || error?.message}
            </p>
          )}

          <div className="flex justify-between items-center pt-1">
            <label
              className={`text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer ${
                isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              Add Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isPending}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
