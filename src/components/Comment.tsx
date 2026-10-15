import { Avatar, Button, TextArea } from "@heroui/react";
import { Check, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { deleteComment, updateComment } from "../services/comment.services";

export type CommentData = {
  _id: string;
  content: string;
  image?: string;
  commentCreator: {
    _id: string;
    name: string;
    username: string;
    photo: string;
  };
  createdAt: string;
  repliesCount: number;
};

type CommentProps = {
  comment: CommentData;
  postId: string;
  onChanged?: (change: "updated" | "deleted") => void;
};

export default function Comment({ comment, postId, onChanged }: CommentProps) {
  const auth = useContext(AuthContext);
  const isOwner = auth?.user?._id === comment.commentCreator._id;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const trimmed = content.trim();
    if (!trimmed || isSaving) return;

    try {
      setIsSaving(true);
      setError("");
      await updateComment(postId, comment._id, { content: trimmed });
      setIsEditing(false);
      onChanged?.("updated");
    } catch (err) {
      console.error("Failed to update comment:", err);
      setError("Couldn't update this comment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError("");
      await deleteComment(postId, comment._id);
      onChanged?.("deleted");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError("Couldn't delete this comment. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <Avatar.Image
          src={comment.commentCreator.photo}
          alt={comment.commentCreator.name}
        />
        <Avatar.Fallback>
          {comment.commentCreator.name.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-default-100 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {comment.commentCreator.name}
              </p>
              <p className="text-xs text-default-400">
                @{comment.commentCreator.username}
              </p>
            </div>

            {isOwner && !isEditing && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label="Comment options"
                  onClick={() => setShowOptions((value) => !value)}
                  className="rounded-full p-1 text-default-400 transition-colors hover:bg-default-200 hover:text-foreground"
                >
                  <MoreHorizontal size={17} />
                </button>

                {showOptions && (
                  <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-default-200 bg-background p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setContent(comment.content);
                        setIsEditing(true);
                        setShowOptions(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-default-100"
                    >
                      <Pencil size={14} />
                      Edit comment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowOptions(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={14} />
                      Delete comment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-3">
              <TextArea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={isSaving}
                className="w-full resize-none rounded-xl border border-default-200 bg-background px-3 py-2 text-sm"
                aria-label="Edit comment"
              />

              {error && <p className="mt-2 text-xs text-danger">{error}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={isSaving}
                  onPress={() => {
                    setContent(comment.content);
                    setIsEditing(false);
                    setError("");
                  }}
                >
                  <X size={14} />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  isDisabled={isSaving || !content.trim()}
                  onPress={handleSave}
                >
                  <Check size={14} />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-default-600">
                {comment.content}
              </p>
              {comment.image && (
                <img
                  src={comment.image}
                  alt="Comment attachment"
                  loading="lazy"
                  className="mt-3 max-h-80 rounded-xl object-contain"
                />
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <p className="px-3 pt-1 text-xs text-default-400">
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
        )}

        {error && !isEditing && (
          <p className="px-3 pt-1 text-xs text-danger">{error}</p>
        )}

        {showDeleteConfirm && (
          <div className="mt-2 rounded-xl border border-danger/20 bg-danger/5 p-3">
            <p className="text-sm font-medium text-foreground">
              Delete this comment?
            </p>
            <p className="mt-1 text-xs text-default-500">
              This action cannot be undone.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                isDisabled={isSaving}
                onPress={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                isDisabled={isSaving}
                onPress={handleDelete}
              >
                {isSaving ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
