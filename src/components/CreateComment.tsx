import { Avatar, Button, TextArea } from "@heroui/react";
import { Send } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { createComment } from "../services/comment.services";

type CreateCommentProps = {
  postId: string;
  onCreated?: () => void;
};

export default function CreateComment({
  postId,
  onCreated,
}: CreateCommentProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      await createComment(postId, { content: trimmedContent });
      setContent("");
      onCreated?.();
    } catch (err) {
      console.error("Failed to create comment:", err);
      setError("Couldn't add your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar className="mt-1 h-9 w-9 shrink-0">
        <Avatar.Image src={user.photo} alt={user.name} />
        <Avatar.Fallback>{user.name.charAt(0).toUpperCase()}</Avatar.Fallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-2 rounded-2xl border border-default-200 bg-default-50 p-2 transition-colors focus-within:border-primary/50">
          <TextArea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a comment..."
            disabled={isSubmitting}
            className="min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none"
            aria-label="Write a comment"
          />

          <Button
            type="submit"
            isIconOnly
            variant="primary"
            isDisabled={isSubmitting || !content.trim()}
            aria-label="Send comment"
            className="mb-0.5 h-9 w-9 shrink-0 rounded-xl"
          >
            <Send size={16} />
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-2 px-2 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
