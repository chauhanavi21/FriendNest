import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, XIcon } from "lucide-react";
import Avatar from "./Avatar";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-4 sm:p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-7 sm:size-9 text-primary" />
          <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            FriendNest
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <Avatar src={authUser?.profilePic} alt="User Avatar" size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const MobileSidebar = ({ isOpen, onClose }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}></div>
      <aside className="w-64 bg-base-200 border-r border-base-300 flex flex-col h-full fixed left-0 top-0 z-50 lg:hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <ShipWheelIcon className="size-7 sm:size-9 text-primary" />
            <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              FriendNest
            </span>
          </Link>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close menu">
            <XIcon className="size-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
              currentPath === "/" ? "btn-active" : ""
            }`}
            onClick={onClose}
          >
            <HomeIcon className="size-5 text-base-content opacity-70" />
            <span>Home</span>
          </Link>

          <Link
            to="/friends"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
              currentPath === "/friends" ? "btn-active" : ""
            }`}
            onClick={onClose}
          >
            <UsersIcon className="size-5 text-base-content opacity-70" />
            <span>Friends</span>
          </Link>

          <Link
            to="/notifications"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
              currentPath === "/notifications" ? "btn-active" : ""
            }`}
            onClick={onClose}
          >
            <BellIcon className="size-5 text-base-content opacity-70" />
            <span>Notifications</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <Avatar src={authUser?.profilePic} alt="User Avatar" size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
