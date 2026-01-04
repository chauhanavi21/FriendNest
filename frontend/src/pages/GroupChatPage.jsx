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
      if (!tokenData?.token || !authUser || !group?.streamChannelId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const currChannel = client.channel("messaging", group.streamChannelId);

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to group chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, group?.streamChannelId]);

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

