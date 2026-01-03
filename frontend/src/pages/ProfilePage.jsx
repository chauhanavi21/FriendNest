import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateProfile } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon, UserIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
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

  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  const handleCancel = () => {
    setFormState({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
      nativeLanguage: authUser?.nativeLanguage || "",
      learningLanguage: authUser?.learningLanguage || "",
      location: authUser?.location || "",
      profilePic: authUser?.profilePic || "",
    });
    setIsEditing(false);
  };

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-base-100 min-h-full">
      <div className="container mx-auto max-w-4xl">
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
                >
                  <UserIcon className="size-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                  <div className="size-24 sm:size-28 md:size-32 rounded-full bg-base-300 overflow-hidden flex-shrink-0 border-4 border-base-300">
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
                    <button
                      type="button"
                      onClick={handleRandomAvatar}
                      className="btn btn-accent w-full sm:w-auto h-10 sm:h-12 min-h-10 sm:min-h-12 text-sm sm:text-base"
                    >
                      <ShuffleIcon className="size-4 mr-2" />
                      Generate Random Avatar
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-sm sm:text-base font-semibold">Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="input input-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-sm sm:text-base font-semibold">Bio</span>
                  </label>
                  <textarea
                    value={formState.bio}
                    onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                    className="textarea textarea-bordered h-20 sm:h-24 text-sm sm:text-base"
                    placeholder="Tell others about yourself and your language learning goals"
                    maxLength={500}
                  />
                  <label className="label">
                    <span className="label-text-alt opacity-70">
                      {formState.bio.length}/500 characters
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1 sm:py-2">
                      <span className="label-text text-sm sm:text-base font-semibold">Native Language</span>
                    </label>
                    <select
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
                      <span className="label-text text-sm sm:text-base font-semibold">Learning Language</span>
                    </label>
                    <select
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
                    <span className="label-text text-sm sm:text-base font-semibold">Location</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-4 sm:size-5 text-base-content opacity-70" />
                    <input
                      type="text"
                      value={formState.location}
                      onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                      className="input input-bordered w-full pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline w-full sm:flex-1 h-11 sm:h-12 min-h-11 sm:min-h-12 text-sm sm:text-base"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:flex-1 h-11 sm:h-12 min-h-11 sm:min-h-12 text-sm sm:text-base"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <LoaderIcon className="animate-spin size-5 mr-2" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <ShipWheelIcon className="size-5 mr-2" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar src={authUser.profilePic} alt={authUser.fullName} size="xl" className="!w-32 !h-32 sm:!w-40 sm:!h-40" />
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{authUser.fullName}</h2>
                    {authUser.location && (
                      <div className="flex items-center justify-center text-sm sm:text-base opacity-70 gap-1">
                        <MapPinIcon className="size-4" />
                        <span>{authUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {authUser.bio && (
                  <div className="card bg-base-100 p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">About</h3>
                    <p className="text-sm sm:text-base opacity-80 leading-relaxed">{authUser.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {authUser.nativeLanguage && (
                    <div className="card bg-base-100 p-4 sm:p-5">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 opacity-70">Native Language</h3>
                      <p className="text-base sm:text-lg font-medium capitalize">{authUser.nativeLanguage}</p>
                    </div>
                  )}
                  {authUser.learningLanguage && (
                    <div className="card bg-base-100 p-4 sm:p-5">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 opacity-70">Learning Language</h3>
                      <p className="text-base sm:text-lg font-medium capitalize">{authUser.learningLanguage}</p>
                    </div>
                  )}
                </div>

                <div className="card bg-base-100 p-4 sm:p-5">
                  <h3 className="font-semibold text-sm sm:text-base mb-3 opacity-70">Account Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base opacity-70">Email</span>
                      <span className="text-sm sm:text-base font-medium">{authUser.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base opacity-70">Member since</span>
                      <span className="text-sm sm:text-base font-medium">
                        {new Date(authUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

