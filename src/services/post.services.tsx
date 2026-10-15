import { routeApi } from "./api";

export type PostPrivacy = "public" | "following" | "only_me";

export type CreatePostPayload = {
  body: string;
  privacy: PostPrivacy;
  image?: File | null;
};

export type UpdatePostPayload = {
  body: string;
  privacy: PostPrivacy;
  image?: File | null;
  removeImage?: boolean;
};

export async function getPosts() {
  return routeApi.get("/posts");
}

export async function getPostComments(postId: string, page = 1, limit = 10) {
  return routeApi.get(`/posts/${postId}/comments`, {
    params: { page, limit },
  });
}

export async function createPost(payload: CreatePostPayload) {
  const body = payload.body.trim();

  if (!body && !payload.image) {
    throw new Error("Add a caption or an image before posting.");
  }

  const formData = new FormData();

  formData.append("body", body);
  formData.append("privacy", payload.privacy);

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return routeApi.post("/posts", formData);
}

export async function updatePost(postId: string, payload: UpdatePostPayload) {
  const body = payload.body.trim();

  if (!body && payload.removeImage && !payload.image) {
    throw new Error("A post must have a caption or an image.");
  }

  const formData = new FormData();

  formData.append("body", body);
  formData.append("privacy", payload.privacy);

  if (payload.image) {
    formData.append("image", payload.image);
  }

  if (payload.removeImage && !payload.image) {
    formData.append("removeImage", "true");
  }

  return routeApi.put(`/posts/${postId}`, formData);
}
