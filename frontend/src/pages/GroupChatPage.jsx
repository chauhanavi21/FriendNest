import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getGroupById } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  TypingIndicator,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import MessageSearch from "../components/MessageSearch";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageSearch, setShowMessageSearch] = useState(false);

  const { authUser } = useAuthUser();

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupById(id),
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      // Wait for group data to load
      if (!group) {
        setLoading(true);
        return;
      }

      // Check if user is a member
      if (!group.isMember) {
        toast.error("You must be a member of this group to access the chat");
        setLoading(false);
        return;
      }

      // Check if stream channel exists
      if (!group.streamChannelId) {
        toast.error("Group chat is not available. Please contact the group creator.");
        setLoading(false);
        return;
      }

      if (!tokenData?.token || !authUser) {
        setLoading(true);
        return;
      }

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Connect if not already connected
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        const currChannel = client.channel("messaging", group.streamChannelId);

        // Try to watch the channel - this will fail if user is not a member
        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (error.message?.includes("not a member") || error.message?.includes("permission")) {
          toast.error("You don't have permission to access this group chat. Please join the group first.");
        } else {
          toast.error("Could not connect to group chat. Please try again.");
        }
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, group]);

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col">
      {showMessageSearch && (
        <MessageSearch channel={channel} onClose={() => setShowMessageSearch(false)} />
      )}
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative flex-1 flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-base-300 bg-base-200">
              <button
                onClick={() => navigate(`/groups/${id}`)}
                className="btn btn-ghost btn-sm gap-2"
              >
                <ArrowLeftIcon className="size-4" />
                Back to Group
              </button>
              <button
                onClick={() => setShowMessageSearch(!showMessageSearch)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Search messages"
              >
                <SearchIcon className="size-4" />
              </button>
            </div>
            <Window>
              <ChannelHeader />
              <MessageList />
              <TypingIndicator />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default GroupChatPage;

