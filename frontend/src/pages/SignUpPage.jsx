import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";

import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });


  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
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
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">Create an Account</h2>
                  <p className="text-xs sm:text-sm opacity-70 mt-1">
                    Join FriendNest and start your Community Building adventure!
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="form-control w-full">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-sm sm:text-base">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-sm sm:text-base">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-sm sm:text-base">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1 px-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full h-11 sm:h-12 min-h-11 sm:min-h-12 text-sm sm:text-base mt-2" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-6 lg:p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full object-contain" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl lg:text-2xl font-semibold">Connect with language partners worldwide</h2>
              <p className="text-sm lg:text-base opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
