import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import Avatar from "./Avatar";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow border border-base-300">
      <div className="card-body p-4 sm:p-5">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <Avatar src={friend.profilePic} alt={friend.fullName} size="md" className="sm:!w-12 sm:!h-12 flex-shrink-0" />
          <h3 className="font-semibold text-base sm:text-lg truncate flex-1 min-w-0">{friend.fullName}</h3>
        </div>

        {/* Language Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="badge badge-secondary text-xs py-1.5">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="ml-1">Native: {friend.nativeLanguage}</span>
          </span>
          <span className="badge badge-outline text-xs py-1.5">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="ml-1">Learning: {friend.learningLanguage}</span>
          </span>
        </div>

        {/* Message Button */}
        <Link 
          to={`/chat/${friend._id}`} 
          className="btn btn-outline w-full h-11 min-h-11 sm:h-12 sm:min-h-12 text-sm sm:text-base"
        >
          Message
        </Link>
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
