import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { deletePost } from "../APIData/Posts";
import { removePostEverywhere } from "../utils/postCache";

export default function DeleteConfirmModal({ postId, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      removePostEverywhere(queryClient, postId);
      onClose();
      if (location.pathname === `/post/${postId}`) {
        navigate("/", { replace: true });
      }
    },
  });

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
          <>
            <ModalHeader className="border-b border-subtle">Delete Post</ModalHeader>
            <ModalBody className="py-4">
              <p className="text-ink">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              {isError && (
                <p className="text-red-400 text-sm mt-2">
                  {error?.response?.data?.message || error?.message}
                </p>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-subtle">
              <Button
                onClick={() => handleOpenChange(false)}
                isDisabled={isPending}
                className="bg-surface-2 text-ink"
              >
                Cancel
              </Button>
              <Button
                onClick={() => !isPending && mutate()}
                isDisabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
