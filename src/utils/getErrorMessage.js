export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  const message = data?.message || data?.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}
