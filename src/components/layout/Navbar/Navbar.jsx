import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import { AuthContext } from "../../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Nav() {
  const { user } = useContext(UserContext);
  const { logout } = useContext(AuthContext);

   const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // See utils/getAuthToken.js - the token has historically been written
    // under a couple of different localStorage keys, so clear all of them.
    localStorage.removeItem("user-token");
    localStorage.removeItem("user_token");
    navigate("/auth/login");
  };

  return (
    <Navbar className="bg-page text-ink shadow-lg px-4 sm:px-8">
      {/* Brand on the left */}
      <NavbarContent justify="start">
        <NavbarBrand className="flex items-center gap-2">
          <p className="font-bold text-cyan-500 text-lg sm:text-xl">
            SocialHub
          </p>
        </NavbarBrand>
      </NavbarContent>

      {/* Search bar in the center */}
      <NavbarContent justify="center" className="hidden md:flex flex-1 max-w-[520px]">
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-surface border border-subtle rounded-full pl-9 pr-4 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition"
          />
        </div>
      </NavbarContent>

      {/* Avatar / right side */}
      <NavbarContent as="div" className="items-center gap-3" justify="end">
        <NotificationBell />

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform border-2 border-cyan-500 cursor-pointer"
              color="secondary"
              name={user?.username || "User"}
              size="md"
              src={user?.photo || "https://i.pravatar.cc/150?u=default"}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
           
            <DropdownItem key="profile" as={NavLink} to="/profile">
              My Profile
            </DropdownItem>

            <DropdownItem key="settings" as={NavLink} to="/settings">
              Settings
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
