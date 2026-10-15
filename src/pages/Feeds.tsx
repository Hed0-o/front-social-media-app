import { useCallback, useEffect, useState } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";
import PostCard, { type Post } from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { getPosts } from "../services/post.services";

export default function Feeds() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      setError("");
      const response = await getPosts();

      const postsData =
        response?.data?.posts ?? response?.posts ?? response?.data?.data?.posts;

      if (!Array.isArray(postsData)) {
        throw new Error("Unexpected posts response.");
      }

      setPosts(postsData);
    } catch (err) {
      console.error("Posts Error:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return (
    <main className="min-h-screen bg-default-50/70 px-4 pb-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="pb-1 pt-8 text-center sm:pt-10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle size={25} />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Your Feed
          </h1>

          <p className="mt-2 text-sm text-default-500 sm:text-base">
            Catch up with the latest posts and share what’s on your mind.
          </p>
        </header>

        <CreatePost onPostCreated={fetchPosts} />

        {loading && (
          <div className="rounded-2xl border border-default-200/70 bg-background px-4 py-12 text-center shadow-sm">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-default-200 border-t-primary" />
            <p className="mt-4 text-sm text-default-500">
              Loading your feed...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-danger/20 bg-background px-5 py-8 text-center shadow-sm">
            <p className="text-sm text-danger">{error}</p>
            <Button
              className="mt-4"
              size="sm"
              variant="primary"
              onPress={() => void fetchPosts()}
            >
              <RefreshCw size={15} />
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-default-300 bg-background px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-default-100 text-default-500">
              <MessageCircle size={23} />
            </div>
            <h2 className="mt-4 font-semibold text-foreground">
              Your feed is looking quiet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-default-500">
              Be the first to share a thought, a photo, or something
              interesting.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          posts.map((post) => <PostCard key={post._id} post={post} />)}

        {!loading && !error && posts.length > 0 && (
          <p className="pb-3 pt-1 text-center text-xs text-default-400">
            You’re all caught up.
          </p>
        )}
      </div>
    </main>
  );
}
