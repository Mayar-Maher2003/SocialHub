import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "../APIData/Posts";
import { replacePostEverywhere } from "../utils/postCache";

export default function EditPostModal({ post, isOpen, onClose }) {
  const [body, setBody] = useState(post?.body || "");
  const [imageFile, setImageFile] = useState(null);
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: () => updatePost(post._id, { body: body.trim(), image: imageFile }),
    onSuccess: (updatedPost) => {
      replacePostEverywhere(queryClient, post._id, updatedPost);
      onClose();
    },
  });

  const canSubmit = !isPending && (body.trim() || imageFile || post?.image);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutate();
  };

  const handleOpenChange = (open) => {
    if (!open && !isPending) {
      reset();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange} backdrop="blur">
      <ModalContent className="bg-surface text-ink border border-subtle">
        {() => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="border-b border-subtle">Edit Post</ModalHeader>
            <ModalBody className="py-4 space-y-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                disabled={isPending}
                placeholder="What's on your mind?"
                className="w-full bg-page border border-subtle rounded-xl p-3 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none disabled:opacity-60"
              />

              {post?.image && !imageFile && (
                <img
                  src={post.image}
                  alt="current post"
                  className="rounded-xl max-h-[220px] object-cover w-full"
                />
              )}

              <input
                type="file"
                accept="image/*"
                disabled={isPending}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm text-muted"
              />

              {isError && (
                <p className="text-red-400 text-sm">
                  {error?.response?.data?.message || error?.message}
                </p>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-subtle">
              <Button
                type="button"
                onClick={() => handleOpenChange(false)}
                isDisabled={isPending}
                className="bg-surface-2 text-ink"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isDisabled={!canSubmit}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
