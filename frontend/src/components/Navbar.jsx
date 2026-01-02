import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, MenuIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import Avatar from "./Avatar";

const Navbar = ({ onMenuClick }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-14 sm:h-16 flex items-center">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full gap-2">
          {/* Left side - Logo (chat pages) or Menu button */}
          <div className="flex items-center gap-2">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="btn btn-ghost btn-circle lg:hidden h-10 w-10 min-h-10"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              </button>
            )}
            {isChatPage && (
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5">
                <ShipWheelIcon className="size-6 sm:size-7 lg:size-9 text-primary" />
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  FriendNest
                </span>
              </Link>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Link to={"/notifications"} className="btn btn-ghost btn-circle h-10 w-10 min-h-10 sm:h-12 sm:w-12 sm:min-h-12">
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
            </Link>

            <div className="hidden sm:block">
              <ThemeSelector />
            </div>

            <Avatar src={authUser?.profilePic} alt="User Avatar" size="sm" className="sm:!w-9 sm:!h-9" />

            <button
              className="btn btn-ghost btn-circle h-10 w-10 min-h-10 sm:h-12 sm:w-12 sm:min-h-12"
              onClick={logoutMutation}
              aria-label="Logout"
            >
              <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
