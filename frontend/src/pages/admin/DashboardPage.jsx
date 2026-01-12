import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "../../lib/api";
import { UsersIcon, UserCircleIcon, CalendarIcon, UserCheckIcon, BellIcon, HeartIcon } from "lucide-react";

const DashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: getAdminDashboardStats,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>Error loading dashboard stats. Please try again.</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      icon: UsersIcon,
      color: "primary",
    },
    {
      title: "Onboarded Users",
      value: stats?.users?.onboarded || 0,
      icon: UserCheckIcon,
      color: "success",
    },
    {
      title: "Total Groups",
      value: stats?.groups?.total || 0,
      icon: UserCircleIcon,
      color: "info",
    },
    {
      title: "Total Events",
      value: stats?.events?.total || 0,
      icon: CalendarIcon,
      color: "warning",
    },
    {
      title: "Friend Requests",
      value: stats?.friendRequests?.total || 0,
      icon: HeartIcon,
      color: "secondary",
    },
    {
      title: "Notifications",
      value: stats?.notifications?.total || 0,
      icon: BellIcon,
      color: "accent",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-base-content opacity-70 mt-1">Platform statistics and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card bg-base-200 shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`text-${stat.color} opacity-20`}>
                    <Icon className="size-12" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stats */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">User Statistics</h2>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span>Created This Week:</span>
                <span className="font-semibold">{stats?.users?.createdThisWeek || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Created This Month:</span>
                <span className="font-semibold">{stats?.users?.createdThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Onboarded:</span>
                <span className="font-semibold">{stats?.users?.notOnboarded || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Group Stats */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Group Statistics</h2>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span>Total Members:</span>
                <span className="font-semibold">{stats?.groups?.totalMembers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Created This Month:</span>
                <span className="font-semibold">{stats?.groups?.createdThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Friendships:</span>
                <span className="font-semibold">{stats?.friendships || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Friend Request Stats */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Friend Requests</h2>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-semibold">{stats?.friendRequests?.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Accepted:</span>
                <span className="font-semibold">{stats?.friendRequests?.accepted || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Removed:</span>
                <span className="font-semibold">{stats?.friendRequests?.removed || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Stats */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Event Statistics</h2>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span>Upcoming:</span>
                <span className="font-semibold">{stats?.events?.upcoming || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Past:</span>
                <span className="font-semibold">{stats?.events?.past || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Unread Notifications:</span>
                <span className="font-semibold">{stats?.notifications?.unread || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
