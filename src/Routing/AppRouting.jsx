import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Home from "../pages/home/Home";
import Profile from "../pages/profile/Profile";
import Register from "../pages/Auth/register/Register";
import Login from "../pages/Auth/login/Login";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import PostDetails from "../pages/postDetails/PostDetails";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import SettingsLayout from "../layouts/SettingsLayout/SettingsLayout";
import Notfound from "../pages/notfound/Notfound";
import ProtectedRoute from "./ProtectedRoute";
   export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "profile", element: <Profile /> },
      { path: "profile/:userId", element: <Profile /> },
      { path: "post/:id", element: <PostDetails /> },
      { path: "bookmarks", element: <BookmarksPage /> },
      { path: "notifications", element: <NotificationsPage /> },
    ],
  },
  {
    path: "settings",
    element: (
      <ProtectedRoute>
        <SettingsLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <SettingsPage /> }],
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    // Catch-all, declared last. Left outside ProtectedRoute on purpose: an
    // unmatched URL should show the 404 page, not redirect to login.
    path: "*",
    element: <Notfound />,
  },
]);