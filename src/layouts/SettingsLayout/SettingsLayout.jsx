import { Outlet } from "react-router-dom";
import Nav from "../../components/layout/Navbar/Navbar";

// Deliberately skips LeftSidebar/RightSidebar/MobileBottomNav - the
// settings page is a single centered column, not the 3-column app shell.
export default function SettingsLayout() {
  return (
    <div className="bg-page min-h-screen">
      <Nav />
      <Outlet />
    </div>
  );
}
