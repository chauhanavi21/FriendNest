import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import Avatar from "./Avatar";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-3 sm:p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Avatar src={friend.profilePic} alt={friend.fullName} size="md" className="sm:!w-12 sm:!h-12" />
          <h3 className="font-semibold text-sm sm:text-base truncate flex-1 min-w-0">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full h-10 min-h-10 sm:h-12 sm:min-h-12 text-sm sm:text-base">
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
