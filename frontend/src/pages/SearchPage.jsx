import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../lib/api";
import { SearchIcon, MapPinIcon, UserPlusIcon, CheckCircleIcon, FilterIcon, SortAscIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import { capitialize } from "../lib/utils";
import { getLanguageFlag } from "../components/FriendCard";
import Avatar from "../components/Avatar";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [learningLanguage, setLearningLanguage] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("recentlyActive");
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["searchUsers", searchQuery, nativeLanguage, learningLanguage, location, sortBy],
    queryFn: () =>
      searchUsers({
        query: searchQuery,
        nativeLanguage,
        learningLanguage,
        location,
        sortBy,
      }),
    enabled: true,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: async () => {
      const { getOutgoingFriendReqs } = await import("../lib/api");
      return getOutgoingFriendReqs();
    },
  });

  useState(() => {
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      const outgoingIds = new Set();
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);


  const clearFilters = () => {
    setSearchQuery("");
    setNativeLanguage("");
    setLearningLanguage("");
    setLocation("");
    setSortBy("recentlyActive");
  };

  const hasActiveFilters = searchQuery || nativeLanguage || learningLanguage || location || sortBy !== "recentlyActive";

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-base-100 min-h-full">
      <div className="container mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Search & Discover</h1>
          <p className="text-sm sm:text-base opacity-70">Find language exchange partners by name, language, or location</p>
        </div>

        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-4 sm:p-6">
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Search</span>
                </label>
                <div className="relative">
                  <SearchIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full pl-10 h-11 sm:h-12 text-sm sm:text-base"
                    placeholder="Search by name, location, or bio..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Native Language</span>
                  </label>
                  <select
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                    className="select select-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Learning Language</span>
                  </label>
                  <select
                    value={learningLanguage}
                    onChange={(e) => setLearningLanguage(e.target.value)}
                    className="select select-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Location</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-4 sm:size-5 text-base-content opacity-70" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input input-bordered w-full pl-10 h-11 sm:h-12 text-sm sm:text-base"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Sort By</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select select-bordered w-full h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <option value="recentlyActive">Recently Active</option>
                    <option value="newUsers">New Users</option>
                    <option value="location">Location</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button onClick={clearFilters} className="btn btn-outline btn-sm">
                    <FilterIcon className="size-4 mr-2" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="card bg-base-200 p-8 text-center border border-base-300 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">No users found</h3>
            <p className="text-sm text-base-content opacity-70">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm sm:text-base opacity-70">
                Found {users.length} {users.length === 1 ? "user" : "users"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {users.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300 border border-base-300 shadow-sm"
                  >
                    <div className="card-body p-4 sm:p-5">
                      <div className="flex flex-col items-center text-center gap-2 mb-3">
                        <Avatar src={user.profilePic} alt={user.fullName} size="lg" className="sm:!w-16 sm:!h-16" />
                        <div className="min-w-0 w-full">
                          <h3 className="font-semibold text-base sm:text-lg truncate mb-1">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center justify-center text-xs opacity-70">
                              <MapPinIcon className="size-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 justify-center mb-3">
                        {user.nativeLanguage && (
                          <span className="badge badge-secondary text-xs py-1">
                            {getLanguageFlag(user.nativeLanguage)}
                            <span className="ml-1 hidden sm:inline">Native: {capitialize(user.nativeLanguage)}</span>
                          </span>
                        )}
                        {user.learningLanguage && (
                          <span className="badge badge-outline text-xs py-1">
                            {getLanguageFlag(user.learningLanguage)}
                            <span className="ml-1 hidden sm:inline">Learning: {capitialize(user.learningLanguage)}</span>
                          </span>
                        )}
                      </div>

                      {user.bio && (
                        <p className="text-xs opacity-70 line-clamp-2 leading-relaxed text-center mb-3">
                          {user.bio}
                        </p>
                      )}

                      <button
                        className={`btn w-full h-10 min-h-10 sm:h-11 sm:min-h-11 text-xs sm:text-sm ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => handleSendRequest(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-3 sm:size-4 mr-1" />
                            <span>Request Sent</span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

