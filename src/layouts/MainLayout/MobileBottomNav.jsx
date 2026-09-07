import { NavLink } from "react-router-dom";
import { FaRegBell, FaRegBookmark, FaRegUser } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { useSettings } from "../../context/SettingsContext";
import { useNotifications, formatBadgeCount } from "../../hooks/useNotifications";

const itemClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
    isActive ? "text-cyan-400" : "text-muted hover:text-ink"
  }`;

export default function MobileBottomNav() {
  const { settings } = useSettings();
  const { unreadCount } = useNotifications({ listEnabled: false });
  const showBadge = !settings.muteNotifications && unreadCount > 0;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-page border-t border-subtle flex items-stretch pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/" end className={itemClass}>
        <IoHomeOutline className="text-xl" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/bookmarks" className={itemClass}>
        <FaRegBookmark className="text-lg" />
        <span>Bookmarks</span>
      </NavLink>
      <NavLink to="/notifications" className={itemClass}>
        <span className="relative">
          <FaRegBell className="text-lg" />
          {showBadge && (
            <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-cyan-500 text-[9px] leading-[14px] text-center text-white">
              {formatBadgeCount(unreadCount)}
            </span>
          )}
        </span>
        <span>Alerts</span>
      </NavLink>
      <NavLink to="/profile" className={itemClass}>
        <FaRegUser className="text-lg" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
