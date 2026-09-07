// The app has historically written the auth token under different
// localStorage keys ("token", "user-token", "user_token") depending on
// which flow set it. Check all of them so profile requests keep working
// regardless of which one is populated.
export function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("user-token") ||
    localStorage.getItem("user_token") ||
    null
  );
}
