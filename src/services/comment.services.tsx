import { routeApi } from "./api";

export type CommentPayload = {
  content: string;
};

export async function createComment(postId: string, payload: CommentPayload) {
  const response = await routeApi.post(`/posts/${postId}/comments`, payload);

  return response.data;
}

export async function updateComment(
  postId: string,
  commentId: string,
  payload: CommentPayload,
) {
  const response = await routeApi.put(
    `/posts/${postId}/comments/${commentId}`,
    payload,
  );

  return response.data;
}

export async function deleteComment(postId: string, commentId: string) {
  const response = await routeApi.delete(
    `/posts/${postId}/comments/${commentId}`,
  );

  return response.data;
}
