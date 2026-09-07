import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Image } from "@heroui/react";
import {
  FaRegBell,
  FaRegBookmark,
  FaRegUser,
  FaUsers,
  FaRegFolder,
} from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { UserContext } from "../../context/UserContext";
import { useSettings } from "../../context/SettingsContext";
import { useNotifications, formatBadgeCount } from "../../hooks/useNotifications";
import { MdOutlineSettings } from "react-icons/md";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
    isActive ? "bg-surface-2 text-cyan-400" : "text-muted hover:bg-surface hover:text-ink"
  }`;

export default function LeftSidebar() {
  const { user } = useContext(UserContext);
  const { settings } = useSettings();
  // Only need the unread count here - shares the same cached query the
  // navbar bell uses, so this doesn't trigger an extra request.
  const { unreadCount } = useNotifications({ listEnabled: false });
  const showBadge = !settings.muteNotifications && unreadCount > 0;

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-[260px] flex-shrink-0 sticky top-[64px] self-start max-h-[calc(100vh-64px)] overflow-y-auto py-4 pr-2">
      {/* <NavLink
        to="/profile"
        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface transition-colors mb-2"
      >
        <Image
          alt="your photo"
          height={40}
          width={40}
          radius="full"
          className="object-cover flex-shrink-0"
          src={user?.photo || "https://i.pravatar.cc/150?u=default"}
        />
        <span className="font-semibold text-ink truncate">{user?.username || "Your Profile"}</span>
      </NavLink> */}

      <NavLink to="/" end className={navLinkClass}>
        <IoHomeOutline className="text-xl flex-shrink-0" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/profile" end className={navLinkClass}>
        <FaRegUser className="text-lg flex-shrink-0" />
        <span>Profile</span>
      </NavLink>

      <NavLink to="/bookmarks" className={navLinkClass}>
        <FaRegBookmark className="text-lg flex-shrink-0" />
        <span>Saved</span>
      </NavLink>


      <NavLink to="/notifications" className={navLinkClass}>
        <span className="relative flex-shrink-0">
          <FaRegBell className="text-lg" />
          {showBadge && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-[10px] leading-4 text-center text-white">
              {formatBadgeCount(unreadCount)}
            </span>
          )}
        </span>
        <span>Notifications</span>
      </NavLink>
 <NavLink to="/settings" className={navLinkClass}>
        <MdOutlineSettings className="text-lg flex-shrink-0" />
        <span>Settings</span>
      </NavLink>
      <div className="mt-4 pt-4 border-t border-subtle space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted cursor-default">
          <FaUsers className="text-lg flex-shrink-0" />
          <span>Groups</span>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted">Soon</span>
        </div>
        {/* <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted cursor-default">
          <FaRegFolder className="text-lg flex-shrink-0" />
          <span>Chat</span>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted">Soon</span>
        </div> */}
      </div>
    </aside>
  );
}
