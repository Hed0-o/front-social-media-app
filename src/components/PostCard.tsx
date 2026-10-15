import { Avatar, Button, Card } from "@heroui/react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPostComments } from "../services/post.services";
import Comment, { type CommentData } from "./Comment";
import CreateComment from "./CreateComment";
import CreatePost, { type EditablePost } from "./CreatePost";

type User = {
  _id: string;
  name: string;
  username: string;
  photo: string;
};

type SharedPost = {
  _id: string;
  body: string;
  image?: string;
  privacy: string;
  user: User;
  createdAt: string;
};

export type Post = {
  _id: string;
  id: string;
  body: string;
  image?: string;
  privacy: string;
  user: User;
  sharedPost: SharedPost | null;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment?: CommentData | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  bookmarked: boolean;
};

type PostCardProps = {
  post: Post;
};

type CommentsResponse = {
  comments?: CommentData[];
  data?: {
    comments?: CommentData[];
    data?: {
      comments?: CommentData[];
    };
  };
};

function extractComments(response: { data?: CommentsResponse }): CommentData[] {
  const data = response?.data;

  const comments =
    data?.comments ?? data?.data?.comments ?? data?.data?.data?.comments;

  return Array.isArray(comments) ? comments : [];
}

export default function PostCard({ post }: PostCardProps) {
  const auth = useContext(AuthContext);
  const currentUser = auth?.user;

  const [currentPost, setCurrentPost] = useState(post);
  const [latestComment, setLatestComment] = useState<CommentData | null>(
    post.topComment ?? null,
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [allComments, setAllComments] = useState<CommentData[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const isPostOwner = currentUser?._id === currentPost.user._id;

  useEffect(() => {
    setCurrentPost(post);
    setLatestComment(post.topComment ?? null);
  }, [post]);

  async function loadComments(force = false) {
    if (loadingComments || (commentsLoaded && !force)) return;

    try {
      setLoadingComments(true);
      setCommentsError("");

      const response = await getPostComments(currentPost._id, 1, 10);
      const comments = extractComments(response);

      setAllComments(comments);
      setCommentsLoaded(true);
      setLatestComment(comments[0] ?? null);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setCommentsError("Failed to load comments. Please try again.");
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleToggleComments() {
    if (showAllComments) {
      setShowAllComments(false);
      return;
    }

    setShowAllComments(true);
    await loadComments();
  }

  async function handleCommentChanged(
    change: "created" | "updated" | "deleted",
  ) {
    if (change === "created") {
      setCurrentPost((previous) => ({
        ...previous,
        commentsCount: previous.commentsCount + 1,
      }));
    }

    if (change === "deleted") {
      setCurrentPost((previous) => ({
        ...previous,
        commentsCount: Math.max(0, previous.commentsCount - 1),
      }));
    }

    setCommentsLoaded(false);
    await loadComments(true);
  }

  function handlePostUpdated(updated: {
    body: string;
    privacy: "public" | "following" | "only_me";
    image?: string;
  }) {
    setCurrentPost((previous) => ({
      ...previous,
      body: updated.body,
      privacy: updated.privacy,
      image: updated.image,
    }));

    setIsEditing(false);
  }

  const {
    body,
    image,
    privacy,
    user,
    sharedPost,
    likesCount,
    commentsCount,
    sharesCount,
    isShare,
    createdAt,
  } = currentPost;

  return (
    <Card className="mx-auto w-full overflow-hidden rounded-2xl border border-default-200/70 bg-background shadow-sm transition-shadow duration-200 hover:shadow-md">
      {isEditing ? (
        <div className="p-4 sm:p-5">
          <CreatePost
            initialPost={currentPost as EditablePost}
            onPostUpdated={handlePostUpdated}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-11 w-11 shrink-0">
                <Avatar.Image src={user.photo} alt={user.name} />
                <Avatar.Fallback>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-foreground">
                    {user.name}
                  </h3>

                  {isShare && (
                    <span className="text-xs text-default-400">
                      shared a post
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-default-400">
                  <span>@{user.username}</span>
                  <span>·</span>
                  <span>{new Date(createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="capitalize">
                    {privacy.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {isPostOwner && (
              <div className="relative">
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  aria-label="Post options"
                  aria-expanded={showOptions}
                  onPress={() => setShowOptions((value) => !value)}
                  className="shrink-0 rounded-full text-default-400 hover:bg-default-100"
                >
                  <MoreHorizontal size={20} />
                </Button>

                {showOptions && (
                  <div className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-default-200 bg-background p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptions(false);
                        setIsEditing(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default-100"
                    >
                      <Pencil size={16} />
                      Edit post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {(body || image) && (
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              {body && (
                <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-7 text-foreground">
                  {body}
                </p>
              )}

              {image && (
                <div
                  className={`overflow-hidden rounded-2xl border border-default-200/50 ${
                    body ? "mt-4" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt="Post"
                    loading="lazy"
                    className="max-h-150 w-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {sharedPost && (
            <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-default-200 bg-default-50 sm:mx-5">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <Avatar.Image
                      src={sharedPost.user.photo}
                      alt={sharedPost.user.name}
                    />
                    <Avatar.Fallback>
                      {sharedPost.user.name.charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {sharedPost.user.name}
                    </p>
                    <p className="text-xs text-default-400">
                      @{sharedPost.user.username}
                    </p>
                  </div>
                </div>

                {sharedPost.body && (
                  <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-default-600">
                    {sharedPost.body}
                  </p>
                )}
              </div>

              {sharedPost.image && (
                <img
                  src={sharedPost.image}
                  alt="Shared post"
                  loading="lazy"
                  className="max-h-125 w-full object-contain"
                />
              )}
            </div>
          )}

          {latestComment && !showAllComments && (
            <div className="mx-4 mb-4 rounded-2xl bg-default-50 p-4 sm:mx-5">
              <Comment
                comment={latestComment}
                postId={currentPost._id}
                onChanged={handleCommentChanged}
              />

              {commentsCount > 1 && (
                <button
                  type="button"
                  onClick={handleToggleComments}
                  className="mt-3 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
                >
                  View all {commentsCount} comments
                </button>
              )}
            </div>
          )}

          {showAllComments && (
            <div className="mx-4 mb-4 rounded-2xl bg-default-50 p-4 sm:mx-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Comments ({commentsCount})
                </h3>

                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowAllComments(false)}
                  className="text-xs text-default-500"
                >
                  Hide comments
                </Button>
              </div>

              {loadingComments && (
                <p className="py-4 text-center text-sm text-default-400">
                  Loading comments...
                </p>
              )}

              {!loadingComments && commentsError && (
                <div className="py-3 text-center">
                  <p className="mb-3 text-sm text-danger">{commentsError}</p>
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => void loadComments(true)}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {!loadingComments && !commentsError && allComments.length > 0 && (
                <div className="space-y-4">
                  {allComments.map((comment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      postId={currentPost._id}
                      onChanged={handleCommentChanged}
                    />
                  ))}
                </div>
              )}

              {!loadingComments &&
                !commentsError &&
                commentsLoaded &&
                allComments.length === 0 && (
                  <p className="py-4 text-center text-sm text-default-400">
                    No comments yet.
                  </p>
                )}
            </div>
          )}

          <div className="px-4 pb-3 sm:px-5">
            <CreateComment
              postId={currentPost._id}
              onCreated={() => handleCommentChanged("created")}
            />
          </div>

          {(likesCount > 0 || commentsCount > 0 || sharesCount > 0) && (
            <>
              <div className="mx-5 h-px bg-default-200" />
              <div className="flex items-center justify-between px-5 py-3 text-xs text-default-400">
                <div className="flex items-center gap-4">
                  {likesCount > 0 && (
                    <span>
                      {likesCount} {likesCount === 1 ? "Like" : "Likes"}
                    </span>
                  )}

                  {commentsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleToggleComments}
                      className="transition-colors hover:text-primary"
                    >
                      {commentsCount}{" "}
                      {commentsCount === 1 ? "Comment" : "Comments"}
                    </button>
                  )}
                </div>

                {sharesCount > 0 && (
                  <span>
                    {sharesCount} {sharesCount === 1 ? "Share" : "Shares"}
                  </span>
                )}
              </div>
            </>
          )}

          <div className="mx-5 h-px bg-default-200" />

          <div className="grid grid-cols-3 gap-1 px-2 py-2">
            <Button
              variant="ghost"
              isDisabled
              className="h-10 rounded-xl text-sm font-semibold text-default-500"
            >
              <Heart size={18} />
              Like
            </Button>

            <Button
              variant="ghost"
              onPress={handleToggleComments}
              className="h-10 rounded-xl text-sm font-semibold text-default-500"
            >
              <MessageCircle size={18} />
              {showAllComments ? "Hide comments" : "Comment"}
            </Button>

            <Button
              variant="ghost"
              isDisabled
              className="h-10 rounded-xl text-sm font-semibold text-default-500"
            >
              <Share2 size={18} />
              Share
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
