import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getUserFriends } from "../lib/api";
import Avatar from "../components/Avatar";

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
import CallButton from "../components/CallButton";
import MessageSearch from "../components/MessageSearch";
import { SearchIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageSearch, setShowMessageSearch] = useState(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });

  const targetFriend = friends.find((friend) => friend._id === targetUserId);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

       
        const channelId = [authUser._id, targetUserId].sort().join("-");


        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
        
        // Notify the message notification hook about the current channel
        window.dispatchEvent(new CustomEvent("currentChannelChanged", { detail: { channelId } }));
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
    
    // Cleanup: notify that channel is no longer active when component unmounts
    return () => {
      window.dispatchEvent(new CustomEvent("currentChannelChanged", { detail: { channelId: null } }));
    };
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col">
      {showMessageSearch && (
        <MessageSearch channel={channel} onClose={() => setShowMessageSearch(false)} />
      )}
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative flex-1 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-200 sticky top-0 z-10">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar src={targetFriend?.profilePic} alt={targetFriend?.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-base-content">{targetFriend?.fullName}</p>
                  <p className="text-xs opacity-70 text-base-content">2 members, 1 online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                  className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                  aria-label="Search messages"
                >
                  <SearchIcon className="size-4" />
                </button>
                <CallButton handleVideoCall={handleVideoCall} />
              </div>
            </div>
            <Window>
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
export default ChatPage;
