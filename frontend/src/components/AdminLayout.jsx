import { Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboardIcon, UsersIcon, UserCircleIcon, LogOutIcon, BarChart3Icon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        navigate("/admin/login");
      },
    });
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-base-200 border-r border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Admin Panel
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <Link
              to="/admin/dashboard"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
                currentPath === "/admin/dashboard" ? "btn-active" : ""
              }`}
            >
              <LayoutDashboardIcon className="size-5 text-base-content opacity-70" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/users"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
                currentPath.startsWith("/admin/users") ? "btn-active" : ""
              }`}
            >
              <UsersIcon className="size-5 text-base-content opacity-70" />
              <span>Users</span>
            </Link>

            <Link
              to="/admin/groups"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
                currentPath.startsWith("/admin/groups") ? "btn-active" : ""
              }`}
            >
              <UserCircleIcon className="size-5 text-base-content opacity-70" />
              <span>Groups</span>
            </Link>

            <Link
              to="/admin/statistics"
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case h-12 min-h-12 ${
                currentPath.startsWith("/admin/statistics") ? "btn-active" : ""
              }`}
            >
              <BarChart3Icon className="size-5 text-base-content opacity-70" />
              <span>Analytics</span>
            </Link>
          </nav>

          {/* User profile section */}
          <div className="p-3 border-t border-base-300">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={authUser?.profilePic} alt={authUser?.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
                <p className="text-xs opacity-70 truncate">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm w-full justify-start gap-2 normal-case"
            >
              <LogOutIcon className="size-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-base-100">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
