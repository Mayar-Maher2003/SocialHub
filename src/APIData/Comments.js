import axios from "axios";
import { getAuthToken } from "../utils/getAuthToken";

const BASE_URL = "https://route-posts.routemisr.com";

function authHeaders() {
  return { Authorization: `Bearer ${getAuthToken()}` };
}

// comments for a post
export async function getPostComments(postId, { page = 1, limit = 10 } = {}) {
  try {
    const { data } = await axios.get(`${BASE_URL}/posts/${postId}/comments`, {
      headers: authHeaders(),
      params: { page, limit },
    });
    return data;
  } catch (error) {
    console.error("Error fetching comments:", error.response?.data || error);
    throw error;
  }
}

// replies for a comment
export async function getCommentReplies(postId, commentId, { page = 1, limit = 10 } = {}) {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/posts/${postId}/comments/${commentId}/replies`,
      { headers: authHeaders(), params: { page, limit } }
    );
    return data;
  } catch (error) {
    console.error("Error fetching replies:", error.response?.data || error);
    throw error;
  }
}

// add a comment to a post
export async function createComment(postId, content) {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/posts/${postId}/comments`,
      { content },
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error creating comment:", error.response?.data || error);
    throw error;
  }
}

// add a reply to a comment
export async function createReply(postId, commentId, content) {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/posts/${postId}/comments/${commentId}/replies`,
      { content },
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error creating reply:", error.response?.data || error);
    throw error;
  }
}

// edit a comment or reply
export async function updateComment(postId, commentId, content) {
  try {
    const { data } = await axios.put(
      `${BASE_URL}/posts/${postId}/comments/${commentId}`,
      { content },
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error updating comment:", error.response?.data || error);
    throw error;
  }
}

// like/unlike a comment or reply
export async function likeComment(postId, commentId) {
  try {
    const { data } = await axios.put(
      `${BASE_URL}/posts/${postId}/comments/${commentId}/like`,
      {},
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error liking comment:", error.response?.data || error);
    throw error;
  }
}

// delete a comment or reply
export async function deleteComment(postId, commentId) {
  try {
    const { data } = await axios.delete(
      `${BASE_URL}/posts/${postId}/comments/${commentId}`,
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error deleting comment:", error.response?.data || error);
    throw error;
  }
}
