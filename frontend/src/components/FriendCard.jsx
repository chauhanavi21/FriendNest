import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LANGUAGE_TO_FLAG } from "../constants";
import Avatar from "./Avatar";
import { removeFriend } from "../lib/api";
import { UserMinusIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  const queryClient = useQueryClient();

  const { mutate: removeFriendMutation, isPending } = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      toast.success("Friend removed successfully");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    },
  });

  const handleRemoveFriend = () => {
    if (window.confirm(`Are you sure you want to remove ${friend.fullName} as a friend?`)) {
      removeFriendMutation(friend._id);
    }
  };

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow border border-base-300">
      <div className="card-body p-5 sm:p-6">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <Avatar src={friend.profilePic} alt={friend.fullName} size="lg" className="sm:!w-16 sm:!h-16 flex-shrink-0" />
          <h3 className="font-semibold text-lg sm:text-xl truncate flex-1 min-w-0">{friend.fullName}</h3>
        </div>

        {/* Language Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge badge-secondary text-sm py-2">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="ml-1">Native: {friend.nativeLanguage}</span>
          </span>
          <span className="badge badge-outline text-sm py-2">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="ml-1">Learning: {friend.learningLanguage}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Link 
            to={`/chat/${friend._id}`} 
            className="btn btn-outline w-full h-11 min-h-11 sm:h-12 sm:min-h-12 text-sm sm:text-base"
          >
            Message
          </Link>
          <button
            onClick={handleRemoveFriend}
            disabled={isPending}
            className="btn btn-error btn-outline w-full h-11 min-h-11 sm:h-12 sm:min-h-12 text-sm sm:text-base"
          >
            <UserMinusIcon className="size-4 mr-2" />
            {isPending ? "Removing..." : "Remove Friend"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
