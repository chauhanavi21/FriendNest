import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics } from "../../lib/api";
import { BarChart3Icon, TrendingUpIcon, UsersIcon, UserCircleIcon } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatisticsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: getAdminAnalytics,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>Error loading analytics. Please try again.</span>
        </div>
      </div>
    );
  }

  const analytics = data?.analytics;

  // Format date for display (show only last 5 chars: MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3Icon className="size-8" />
          Advanced Analytics & Reporting
        </h1>
        <p className="text-base-content opacity-70 mt-1">
          Detailed insights and trends for platform growth and activity
        </p>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">User Growth (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--bc) / 0.7)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="hsl(var(--bc) / 0.7)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--b1))",
                    border: "1px solid hsl(var(--bc) / 0.2)",
                    borderRadius: "8px",
                  }}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--p))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--p))", r: 4 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Group Growth Chart */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">Group Growth (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.groupGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--bc) / 0.7)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="hsl(var(--bc) / 0.7)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--b1))",
                    border: "1px solid hsl(var(--bc) / 0.2)",
                    borderRadius: "8px",
                  }}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="groups"
                  stroke="hsl(var(--in))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--in))", r: 4 }}
                  name="New Groups"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Friend Requests Chart */}
        <div className="card bg-base-200 shadow lg:col-span-2">
          <div className="card-body">
            <h3 className="card-title">Friend Requests (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.friendRequestGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--bc) / 0.7)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="hsl(var(--bc) / 0.7)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--b1))",
                    border: "1px solid hsl(var(--bc) / 0.2)",
                    borderRadius: "8px",
                  }}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(var(--s))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--s))", r: 4 }}
                  name="Friend Requests"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Users by Language */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">Users by Native Language (Top 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.usersByLanguage || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                <XAxis type="number" stroke="hsl(var(--bc) / 0.7)" style={{ fontSize: "12px" }} />
                <YAxis
                  dataKey="language"
                  type="category"
                  stroke="hsl(var(--bc) / 0.7)"
                  style={{ fontSize: "12px" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--b1))",
                    border: "1px solid hsl(var(--bc) / 0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--p))" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Groups by Language */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">Groups by Language</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.groupsByLanguage || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                <XAxis
                  dataKey="language"
                  stroke="hsl(var(--bc) / 0.7)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="hsl(var(--bc) / 0.7)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--b1))",
                    border: "1px solid hsl(var(--bc) / 0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--in))" name="Groups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity by Day of Week */}
      <div className="mb-6">
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">User Registration Activity by Day of Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.activityByDayOfWeek || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.1)" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--bc) / 0.7)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="hsl(var(--bc) / 0.7)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--b1))",
                    border: "1px solid hsl(var(--bc) / 0.2)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="users" fill="hsl(var(--a))" name="Users Registered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <UsersIcon className="size-8" />
          </div>
          <div className="stat-title">Total Users (30d)</div>
          <div className="stat-value text-2xl">
            {analytics?.userGrowth?.reduce((sum, item) => sum + item.users, 0) || 0}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-info">
            <UserCircleIcon className="size-8" />
          </div>
          <div className="stat-title">Total Groups (30d)</div>
          <div className="stat-value text-2xl">
            {analytics?.groupGrowth?.reduce((sum, item) => sum + item.groups, 0) || 0}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <TrendingUpIcon className="size-8" />
          </div>
          <div className="stat-title">Total Friend Requests (30d)</div>
          <div className="stat-value text-2xl">
            {analytics?.friendRequestGrowth?.reduce((sum, item) => sum + item.requests, 0) || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
