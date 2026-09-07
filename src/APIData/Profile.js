import axios from "axios";
import { getAuthToken } from "../utils/getAuthToken";

const BASE_URL = "https://route-posts.routemisr.com";

function authHeaders() {
  const token = getAuthToken();
  return { Authorization: `Bearer ${token}` };
}

// current logged-in user's profile
export async function getMyProfile() {
  try {
    const { data } = await axios.get(`${BASE_URL}/users/profile-data`, {
      headers: authHeaders(),
    });
    return data?.data?.user ?? data?.data ?? data;
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data || error);
    throw error;
  }
}

// another user's profile
export async function getUserProfile(userId) {
  try {
    const { data } = await axios.get(`${BASE_URL}/users/${userId}/profile`, {
      headers: authHeaders(),
    });
    return data?.data?.user ?? data?.data ?? data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error);
    throw error;
  }
}

// a given user's posts
export async function getPostsByUser(userId) {
  try {
    const { data } = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
      headers: authHeaders(),
    });
    return data?.data?.posts ?? data?.data ?? data?.posts ?? [];
  } catch (error) {
    console.error("Error fetching user posts:", error.response?.data || error);
    throw error;
  }
}

// current user's bookmarks
export async function getBookmarks() {
  try {
    const { data } = await axios.get(`${BASE_URL}/users/bookmarks`, {
      headers: authHeaders(),
    });
    return (
      data?.data?.bookmarks ??
      data?.data?.posts ??
      data?.data ??
      data?.bookmarks ??
      []
    );
  } catch (error) {
    console.error("Error fetching bookmarks:", error.response?.data || error);
    throw error;
  }
}

// suggested users to follow
export async function getSuggestedUsers(limit = 10) {
  try {
    const { data } = await axios.get(`${BASE_URL}/users/suggestions`, {
      headers: authHeaders(),
      params: { limit },
    });
    return (
      data?.data?.users ??
      data?.data?.suggestions ??
      data?.data ??
      data?.users ??
      []
    );
  } catch (error) {
    console.error("Error fetching suggestions:", error.response?.data || error);
    throw error;
  }
}

// follow a user
export async function followUser(userId) {
  try {
    const { data } = await axios.put(
      `${BASE_URL}/users/${userId}/follow`,
      {},
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error following user:", error.response?.data || error);
    throw error;
  }
}
