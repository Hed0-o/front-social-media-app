import {
  Avatar,
  Button,
  Card,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { Image as ImageIcon, X } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  createPost,
  updatePost,
  type PostPrivacy,
} from "../services/post.services";

export type EditablePost = {
  _id: string;
  body: string;
  image?: string;
  privacy: string;
};

type CreatePostProps = {
  onPostCreated?: () => void;
  initialPost?: EditablePost | null;
  onPostUpdated?: (post: {
    body: string;
    privacy: PostPrivacy;
    image?: string;
  }) => void;
  onCancel?: () => void;
};

function normalizePrivacy(value?: string): PostPrivacy {
  if (value === "following" || value === "only_me") return value;
  return "public";
}

export default function CreatePost({
  onPostCreated,
  initialPost = null,
  onPostUpdated,
  onCancel,
}: CreatePostProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<string | null>(null);
  const isEditing = Boolean(initialPost);

  const [isOpen, setIsOpen] = useState(Boolean(initialPost));
  const [privacy, setPrivacy] = useState<PostPrivacy>(
    normalizePrivacy(initialPost?.privacy),
  );
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialPost?.image ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialPost) return;

    setIsOpen(true);
    setBody(initialPost.body);
    setPrivacy(normalizePrivacy(initialPost.privacy));
    setImage(null);
    setImagePreview(initialPost.image ?? "");
    setError("");
  }, [initialPost]);

  if (!user) return null;

  function clearLocalPreview() {
    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current);
      imagePreviewRef.current = null;
    }
  }

  function resetForm() {
    clearLocalPreview();
    setBody("");
    setPrivacy("public");
    setImage(null);
    setImagePreview("");
    setError("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (isSubmitting) return;

    if (isEditing) {
      onCancel?.();
      return;
    }

    setIsOpen(false);
    resetForm();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    clearLocalPreview();

    const previewUrl = URL.createObjectURL(file);
    imagePreviewRef.current = previewUrl;

    setImage(file);
    setImagePreview(previewUrl);
    setError("");
  }

  function removeImage() {
    setImage(null);
    clearLocalPreview();
    setImagePreview("");
    setError("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedBody = body.trim();

    if (!trimmedBody && !imagePreview) {
      setError("Write something or select an image first.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      if (initialPost) {
        const response = await updatePost(initialPost._id, {
          body: trimmedBody,
          privacy,
          image,
        });

        const updated =
          response?.post ?? response?.data?.post ?? response?.data ?? {};

        onPostUpdated?.({
          body: updated.body ?? trimmedBody,
          privacy: normalizePrivacy(updated.privacy ?? privacy),
          image:
            updated.image ??
            updated.post?.image ??
            (image ? imagePreview : initialPost.image),
        });
      } else {
        await createPost({
          body: trimmedBody,
          privacy,
          image,
        });

        setIsOpen(false);
        resetForm();
        onPostCreated?.();
      }
    } catch (err: unknown) {
      console.error("Failed to save post:", err);

      let message = isEditing
        ? "Failed to update post. Please try again."
        : "Failed to publish post. Please try again.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const data = (
          err as {
            response?: {
              data?: {
                message?: string;
                errors?: string | string[];
              };
            };
          }
        ).response?.data;

        if (data?.message) {
          message = data.message;
        } else if (data?.errors) {
          message = Array.isArray(data.errors)
            ? data.errors.join(", ")
            : data.errors;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full overflow-hidden rounded-2xl border border-default-200/70 bg-background shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center gap-3">
          {!isOpen && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex h-11 flex-1 items-center rounded-full bg-default-100 px-5 text-left text-sm font-medium text-default-500 transition-colors hover:bg-default-200"
            >
              What's on your mind, {user.name.split(" ")[0]}?
            </button>
          ) : (
            <div className="relative flex w-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  {isEditing ? "Edit post" : "Create post"}
                </h2>
                <p className="mt-1 text-sm text-default-400">
                  {isEditing
                    ? "Make changes to your post"
                    : "Share something with your friends"}
                </p>
              </div>

              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={handleClose}
                isDisabled={isSubmitting}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full text-default-500 transition-transform duration-200 hover:rotate-90"
                aria-label="Close"
              >
                <X size={19} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen || isEditing
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="border-t border-default-200/70 px-5 pb-5 pt-4"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <Avatar.Image src={user.photo} alt={user.name} />
                <Avatar.Fallback>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {user.name}
                </p>

                <Select
                  selectedKey={privacy}
                  onSelectionChange={(key) => {
                    if (
                      key === "public" ||
                      key === "following" ||
                      key === "only_me"
                    ) {
                      setPrivacy(key);
                    }
                  }}
                  aria-label="Post privacy"
                  className="mt-0.5"
                  isDisabled={isSubmitting}
                >
                  <Select.Trigger className="flex items-center gap-2 text-xs text-default-500">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>

                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="public" textValue="Public">
                        Public
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="following" textValue="Following">
                        Following
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="only_me" textValue="Only me">
                        Only me
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>

            <TextField className="mt-4">
              <Label className="sr-only">Post content</Label>
              <TextArea
                autoFocus={isOpen || isEditing}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={`What's on your mind, ${user.name.split(" ")[0]}?`}
                disabled={isSubmitting}
                className="min-h-32 w-full resize-none border-0 bg-transparent px-0 py-2 text-base shadow-none outline-none focus:ring-0"
              />
            </TextField>

            {imagePreview && (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-default-200 bg-default-50">
                <img
                  src={imagePreview}
                  alt="Selected post"
                  className="max-h-96 w-full object-contain"
                />
                <Button
                  type="button"
                  isIconOnly
                  variant="primary"
                  size="sm"
                  onPress={removeImage}
                  isDisabled={isSubmitting}
                  className="absolute right-2 top-2 rounded-full"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </Button>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-default-200/60 pt-3">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="hidden"
                  aria-label="Select post image"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onPress={() => fileInputRef.current?.click()}
                  isDisabled={isSubmitting}
                  className="h-9 rounded-xl px-3 text-sm font-semibold text-default-500 transition-colors hover:bg-success/10 hover:text-success"
                >
                  <ImageIcon size={18} />
                  Photo
                </Button>
              </div>

              <Button
                type="submit"
                variant="primary"
                isDisabled={isSubmitting}
                className="h-9 min-w-24 rounded-xl px-5 text-sm font-bold shadow-md shadow-primary/15 transition-transform duration-200 hover:-translate-y-0.5"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Save changes"
                    : "Post"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
