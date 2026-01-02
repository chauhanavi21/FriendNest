import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
              
              <div className="size-24 sm:size-28 md:size-32 rounded-full bg-base-300 overflow-hidden flex-shrink-0">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShipWheelIcon className="size-8 sm:size-10 md:size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent w-full sm:w-auto h-10 sm:h-12 min-h-10 sm:min-h-12 text-sm sm:text-base">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            
            <div className="form-control">
              <label className="label py-1 sm:py-2">
                <span className="label-text text-sm sm:text-base">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                placeholder="Your full name"
              />
            </div>

            
            <div className="form-control">
              <label className="label py-1 sm:py-2">
                <span className="label-text text-sm sm:text-base">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-20 sm:h-24 text-sm sm:text-base"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="form-control">
                <label className="label py-1 sm:py-2">
                  <span className="label-text text-sm sm:text-base">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              
              <div className="form-control">
                <label className="label py-1 sm:py-2">
                  <span className="label-text text-sm sm:text-base">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            
            <div className="form-control">
              <label className="label py-1 sm:py-2">
                <span className="label-text text-sm sm:text-base">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-4 sm:size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base"
                  placeholder="City, Country"
                />
              </div>
            </div>


            <button className="btn btn-primary w-full h-11 sm:h-12 min-h-11 sm:min-h-12 text-sm sm:text-base mt-2" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
