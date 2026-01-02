import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import Avatar from "../components/Avatar";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 pb-6 sm:pb-8 bg-base-100 min-h-full relative">
      <div className="container mx-auto space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10 max-w-7xl relative z-0">
        {/* Your Friends Section Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm w-full sm:w-auto justify-center">
            <UsersIcon className="mr-2 size-4" />
            <span>Friend Requests</span>
          </Link>
        </div>

        {/* Friends List */}
        {loadingFriends ? (
          <div className="flex justify-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="divider my-6 sm:my-8 lg:my-10"></div>

        {/* Meet New Learners Section */}
        <section className="relative z-10">
          <div className="mb-5 sm:mb-6 lg:mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Meet New Learners</h2>
              <p className="text-sm sm:text-base opacity-70 leading-relaxed">
                Discover perfect language exchange partners based on your profile
              </p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-8 sm:py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 sm:p-8 text-center border border-base-300 shadow-sm">
              <h3 className="font-semibold text-base sm:text-lg mb-2">No recommendations available</h3>
              <p className="text-sm sm:text-base text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300 border border-base-300 shadow-sm relative z-10"
                  >
                    <div className="card-body p-3 sm:p-4 space-y-2 sm:space-y-3">
                      {/* User Info */}
                      <div className="flex flex-col items-center text-center gap-2">
                        <Avatar src={user.profilePic} alt={user.fullName} size="md" className="sm:!w-12 sm:!h-12 flex-shrink-0" />
                        <div className="min-w-0 w-full">
                          <h3 className="font-semibold text-sm sm:text-base truncate mb-1">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center justify-center text-xs opacity-70">
                              <MapPinIcon className="size-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Language Badges */}
                      <div className="flex flex-wrap gap-1 justify-center">
                        <span className="badge badge-secondary text-xs py-1">
                          {getLanguageFlag(user.nativeLanguage)}
                          <span className="ml-1 hidden sm:inline">Native: {capitialize(user.nativeLanguage)}</span>
                        </span>
                        <span className="badge badge-outline text-xs py-1">
                          {getLanguageFlag(user.learningLanguage)}
                          <span className="ml-1 hidden sm:inline">Learning: {capitialize(user.learningLanguage)}</span>
                        </span>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-xs opacity-70 line-clamp-2 leading-relaxed text-center">
                          {user.bio}
                        </p>
                      )}

                      {/* Action Button */}
                      <button
                        className={`btn w-full mt-2 h-9 min-h-9 sm:h-10 sm:min-h-10 text-xs sm:text-sm ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-3 sm:size-4 mr-1" />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-3 sm:size-4 mr-1" />
                            <span>Add Friend</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
