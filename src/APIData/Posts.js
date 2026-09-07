import axios from "axios";
import { getAuthToken } from "../utils/getAuthToken";

const BASE_URL = "https://route-posts.routemisr.com";

// display posts
export async function getAllPosts() {
  const token = localStorage.getItem("user-token");

  const { data } = await axios.get("https://route-posts.routemisr.com/posts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      sort: "-createdAt",
    },
  });
  // console.log("API Response:", data.data.posts);

  // return posts
  return data.data.posts;
}

export async function getSinglePost(id) {
  const token = localStorage.getItem("user-token");

  const response = await axios.get(
    `https://route-posts.routemisr.com/posts/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  // console.log("API RESPONSE:", response.data);

  return response.data.data;
}

function authHeaders() {
  return { Authorization: `Bearer ${getAuthToken()}` };
}

// create a new post
export async function createPost({ body, image }) {
  try {
    const formData = new FormData();
    if (body) formData.append("body", body);
    if (image) formData.append("image", image);

    const { data } = await axios.post(`${BASE_URL}/posts`, formData, {
      headers: authHeaders(),
    });
    return data?.data?.post ?? data?.data ?? data;
  } catch (error) {
    console.error("Error creating post:", error.response?.data || error);
    throw error;
  }
}

// update an existing post
export async function updatePost(postId, { body, image }) {
  try {
    const formData = new FormData();
    if (body !== undefined) formData.append("body", body);
    if (image) formData.append("image", image);

    const { data } = await axios.put(`${BASE_URL}/posts/${postId}`, formData, {
      headers: authHeaders(),
    });
    return data?.data?.post ?? data?.data ?? data;
  } catch (error) {
    console.error("Error updating post:", error.response?.data || error);
    throw error;
  }
}

// like/unlike a post
export async function likePost(postId) {
  const url = `${BASE_URL}/posts/${postId}/like`;
  try {
    const { data } = await axios.put(url, {}, { headers: authHeaders() });
    // TEMP DEBUG - remove once the like/share UI-update issue is confirmed fixed
    console.log("[DEBUG] PUT", url, "-> response:", data);
    return data;
  } catch (error) {
    console.error("[DEBUG] PUT", url, "-> FAILED:", error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

// bookmark/unbookmark a post
export async function bookmarkPost(postId) {
  const url = `${BASE_URL}/posts/${postId}/bookmark`;
  try {
    const { data } = await axios.put(url, {}, { headers: authHeaders() });
    console.log("[DEBUG] PUT", url, "-> response:", data);
    return data;
  } catch (error) {
    console.error("[DEBUG] PUT", url, "-> FAILED:", error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

// share a post
export async function sharePost(postId, { body, image } = {}) {
  const url = `${BASE_URL}/posts/${postId}/share`;
  try {
    // Defensive: some backends implement "share" as a generic update that
    // assigns the request body onto the post document, so an empty payload
    // can blank out existing content. Resend the original text and image URL
    // (same field name/shape used everywhere else post content is read) so
    // that pattern can't wipe either of them.
    const payload = {};
    if (body !== undefined) payload.body = body;
    if (image !== undefined) payload.image = image;
    const { data } = await axios.post(url, payload, { headers: authHeaders() });
    console.log("[DEBUG] POST", url, "-> response:", data);
    return data;
  } catch (error) {
    console.error("[DEBUG] POST", url, "-> FAILED:", error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

// delete a post
export async function deletePost(postId) {
  try {
    const { data } = await axios.delete(`${BASE_URL}/posts/${postId}`, {
      headers: authHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Error deleting post:", error.response?.data || error);
    throw error;
  }
}




