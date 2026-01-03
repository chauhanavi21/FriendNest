import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { SearchIcon } from "lucide-react";

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) {
      return friends;
    }

    const query = searchQuery.toLowerCase().trim();
    return friends.filter((friend) => {
      const nameMatch = friend.fullName?.toLowerCase().includes(query);
      const locationMatch = friend.location?.toLowerCase().includes(query);
      const nativeLangMatch = friend.nativeLanguage?.toLowerCase().includes(query);
      const learningLangMatch = friend.learningLanguage?.toLowerCase().includes(query);
      const bioMatch = friend.bio?.toLowerCase().includes(query);

      return nameMatch || locationMatch || nativeLangMatch || learningLangMatch || bioMatch;
    });
  }, [friends, searchQuery]);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Your Friends</h2>
          
          <div className="form-control w-full sm:w-auto sm:max-w-xs">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10 h-11 sm:h-12 text-sm sm:text-base"
                placeholder="Search friends by name, location, or language..."
              />
            </div>
          </div>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredFriends.length === 0 ? (
          searchQuery.trim() ? (
            <div className="card bg-base-200 p-8 text-center border border-base-300 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">No friends found</h3>
              <p className="text-sm text-base-content opacity-70">
                No friends match your search "{searchQuery}"
              </p>
            </div>
          ) : (
            <NoFriendsFound />
          )
        ) : (
          <>
            {searchQuery.trim() && (
              <p className="text-sm sm:text-base opacity-70">
                Found {filteredFriends.length} {filteredFriends.length === 1 ? "friend" : "friends"} matching "{searchQuery}"
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;

