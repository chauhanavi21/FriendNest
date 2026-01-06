import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, MenuIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import Avatar from "./Avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendRequests, getNotifications } from "../lib/api";

const Navbar = ({ onMenuClick }) => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const queryClient = useQueryClient();

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!authUser,
    refetchInterval: 5000, // Refetch every 5 seconds for faster updates
  });

  // Listen for immediate notification updates
  useEffect(() => {
    const handleNotificationCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    };
    window.addEventListener("notificationCreated", handleNotificationCreated);
    return () => window.removeEventListener("notificationCreated", handleNotificationCreated);
  }, [queryClient]);

  const incomingRequests = friendRequests?.incomingReqs || [];
  const removedRequests = friendRequests?.removedReqs || [];
  const unreadMessageNotifications = notificationsData?.notifications?.filter(n => n.type === "message" && !n.isRead) || [];
  const unseenCount = incomingRequests.length + removedRequests.length + unreadMessageNotifications.length;

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-14 sm:h-16 flex items-center">
      <div className="container mx-auto px-3 sm:px-4 lg:px-4 w-full">
        <div className="flex items-center justify-between w-full gap-2">
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
            <Link to="/" className="flex items-center gap-1.5">
              <ShipWheelIcon className="size-6 sm:size-7 lg:size-9 text-primary" />
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                FriendNest
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Link to={"/notifications"} className="btn btn-ghost btn-circle h-10 w-10 min-h-10 sm:h-12 sm:w-12 sm:min-h-12 relative">
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              {unseenCount > 0 && (
                <span className="absolute top-0 right-0 bg-error text-error-content rounded-full min-w-[1.25rem] h-5 text-xs font-bold flex items-center justify-center px-1 border-2 border-base-200">
                  {unseenCount > 99 ? "99+" : unseenCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:block">
              <ThemeSelector />
            </div>

            <Link to="/profile">
              <Avatar src={authUser?.profilePic} alt="User Avatar" size="sm" className="sm:!w-9 sm:!h-9 hover:ring-2 ring-primary transition-all cursor-pointer" />
            </Link>

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
