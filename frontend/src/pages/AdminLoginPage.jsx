import { useState, useEffect } from "react";
import { ShipWheelIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const AdminLoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (authUser && authUser.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [authUser, navigate]);

  const { mutate: loginMutation, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // Invalidate auth query to refresh user data
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Check if user is admin from the response
      if (data?.user?.role === "admin") {
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Access Denied - Admin access required");
      }
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="mb-4 sm:mb-6 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-7 sm:size-8 lg:size-9 text-primary" />
            <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              FriendNest
            </span>
            <span className="text-lg opacity-70">Admin</span>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message || "Invalid credentials"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">Admin Login</h2>
                  <p className="text-xs sm:text-sm opacity-70 mt-1">
                    Sign in to access the admin dashboard
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="form-control w-full space-y-2">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-sm sm:text-base">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-sm sm:text-base">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full h-11 sm:h-12 min-h-11 sm:min-h-12 text-sm sm:text-base mt-2"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign In as Admin"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-6 lg:p-8">
            <div className="text-center space-y-3">
              <h2 className="text-xl lg:text-2xl font-semibold">Admin Dashboard</h2>
              <p className="text-sm lg:text-base opacity-70">
                Manage users, groups, and monitor platform statistics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
