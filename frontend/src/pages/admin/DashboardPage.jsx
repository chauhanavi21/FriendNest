import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "../../lib/api";
import { UsersIcon, UserCircleIcon, CalendarIcon, UserCheckIcon, BellIcon, HeartIcon, ClockIcon } from "lucide-react";
import Avatar from "../../components/Avatar";
import { getLanguageFlag } from "../../components/FriendCard";

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

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h3 className="card-title text-lg">Recent Users</h3>
              {stats?.recentActivity?.users?.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {stats.recentActivity.users.map((user) => (
                    <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition">
                      <Avatar src={user.profilePic} alt={user.fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.fullName || "N/A"}</p>
                        <p className="text-xs opacity-70 truncate">{user.email}</p>
                      </div>
                      <div className="text-xs opacity-70">
                        <ClockIcon className="size-3 inline mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-70 mt-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Groups */}
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h3 className="card-title text-lg">Recent Groups</h3>
              {stats?.recentActivity?.groups?.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {stats.recentActivity.groups.map((group) => (
                    <div key={group._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition">
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt={group.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <UserCircleIcon className="size-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{group.name}</p>
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <span>{getLanguageFlag(group.language)}</span>
                          <span>{group.language}</span>
                        </div>
                      </div>
                      <div className="text-xs opacity-70">
                        <ClockIcon className="size-3 inline mr-1" />
                        {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-70 mt-4">No recent groups</p>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h3 className="card-title text-lg">Recent Events</h3>
              {stats?.recentActivity?.events?.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {stats.recentActivity.events.map((event, idx) => (
                    <div key={event._id || idx} className="p-2 rounded-lg hover:bg-base-300 transition">
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      <p className="text-xs opacity-70 truncate">{event.groupName}</p>
                      <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                        <CalendarIcon className="size-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-70 mt-4">No recent events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
