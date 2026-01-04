import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

const MessageSearch = ({ channel, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !channel) return;

    setIsSearching(true);
    try {
      const response = await channel.search({
        text: { $autocomplete: searchQuery },
      });
      setSearchResults(response.results || []);
    } catch (error) {
      console.error("Error searching messages:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="p-4 border-b border-base-300 bg-base-200">
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <SearchIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-4 text-base-content opacity-70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 pr-10 h-10 text-sm"
            placeholder="Search messages..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 transform -translate-y-1/2 right-3 btn btn-ghost btn-xs btn-circle"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </form>
        {onClose && (
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Close
          </button>
        )}
      </div>

      {isSearching && (
        <div className="mt-2 text-sm text-base-content opacity-70">Searching...</div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
          {searchResults.map((result, idx) => (
            <div key={idx} className="p-2 bg-base-100 rounded text-sm">
              <div className="font-semibold text-xs opacity-70 mb-1">
                {new Date(result.message.created_at).toLocaleString()}
              </div>
              <div>{result.message.text}</div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="mt-2 text-sm text-base-content opacity-70">No messages found</div>
      )}
    </div>
  );
};

export default MessageSearch;

