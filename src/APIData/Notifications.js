import axios from "axios";
import { getAuthToken } from "../utils/getAuthToken";

const BASE_URL = "https://route-posts.routemisr.com";

function authHeaders() {
  return { Authorization: `Bearer ${getAuthToken()}` };
}

// the authenticated user's notifications
export async function getNotifications({ unread = false, page = 1, limit = 10 } = {}) {
  try {
    const { data } = await axios.get(`${BASE_URL}/notifications`, {
      headers: authHeaders(),
      params: { unread, page, limit },
    });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error.response?.data || error);
    throw error;
  }
}

// current unread notifications count
export async function getUnreadNotificationsCount() {
  try {
    const { data } = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: authHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error.response?.data || error);
    throw error;
  }
}

// mark every notification as read
export async function markAllNotificationsAsRead() {
  try {
    const { data } = await axios.patch(
      `${BASE_URL}/notifications/read-all`,
      {},
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error.response?.data || error);
    throw error;
  }
}

// mark a single notification as read
export async function markNotificationAsRead(notificationId) {
  try {
    const { data } = await axios.patch(
      `${BASE_URL}/notifications/${notificationId}/read`,
      {},
      { headers: authHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error.response?.data || error);
    throw error;
  }
}
