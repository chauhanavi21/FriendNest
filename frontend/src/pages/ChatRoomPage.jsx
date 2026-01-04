import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends, getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import Avatar from "../components/Avatar";
import { MessageSquareIcon, ArrowLeftIcon, MenuIcon, XIcon } from "lucide-react";
import Sidebar, { MobileSidebar } from "../components/Sidebar";
import Navbar from "../components/Navbar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatRoomPage = () => {
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { authUser } = useAuthUser();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChatClient = async () => {
      if (!tokenData?.token || !authUser) return;

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

        setChatClient(client);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat client:", error);
        toast.error("Could not connect to chat. Please try again.");
        setLoading(false);
      }
    };

    initChatClient();
  }, [tokenData, authUser]);

  useEffect(() => {
    const initChannel = async () => {
      if (!selectedFriendId || !chatClient || !authUser) {
        setChannel(null);
        return;
      }

      try {
        const channelId = [authUser._id, selectedFriendId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, selectedFriendId],
        });

        await currChannel.watch();

        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing channel:", error);
        toast.error("Could not load chat. Please try again.");
      }
    };

    initChannel();
  }, [selectedFriendId, chatClient, authUser]);

  const handleFriendClick = (friendId) => {
    setSelectedFriendId(friendId);
    setShowChatOnMobile(true);
  };

  const handleBackToFriends = () => {
    setShowChatOnMobile(false);
  };

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  const selectedFriend = friends.find((friend) => friend._id === selectedFriendId);

  if (loading || !chatClient) {
    return <ChatLoader />;
  }

  return (
    <div className="min-h-screen relative bg-base-100">
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle hidden" checked={isMobileMenuOpen} readOnly />
      
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex h-[calc(100vh-4rem)]">
        {isSidebarOpen && (
          <>
            <Sidebar />
            <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          </>
        )}

        <div className="flex-1 flex flex-col bg-base-100">
          <div className="h-full flex flex-col lg:flex-row bg-base-100">
              <div
                className={`${
                  showChatOnMobile ? "hidden" : "flex"
                } lg:flex flex-col w-full lg:w-[22%] border-r border-base-300 bg-base-200`}
              >
                <div className="p-4 border-b border-base-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="btn btn-ghost btn-sm btn-circle"
                      aria-label="Toggle sidebar"
                    >
                      <MenuIcon className="size-5" />
                    </button>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquareIcon className="size-5" />
                      Messages
                    </h2>
                  </div>
                </div>
        <div className="flex-1 overflow-y-auto">
          {loadingFriends ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : friends.length === 0 ? (
            <div className="p-4 text-center text-base-content opacity-70">
              <p>No friends yet. Start adding friends to chat!</p>
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => handleFriendClick(friend._id)}
                  className={`w-full p-4 hover:bg-base-300 transition-colors text-left ${
                    selectedFriendId === friend._id ? "bg-primary text-primary-content" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={friend.profilePic} alt={friend.fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{friend.fullName}</p>
                      {friend.location && (
                        <p className="text-xs opacity-70 truncate">{friend.location}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`${
          showChatOnMobile ? "flex" : "hidden"
        } lg:flex flex-col flex-1 w-full lg:w-[78%] bg-base-100`}
      >
        {selectedFriendId && channel ? (
          <>
            <div className="lg:hidden p-3 border-b border-base-300 bg-base-200 flex items-center gap-3">
              <button
                onClick={handleBackToFriends}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Back to friends"
              >
                <ArrowLeftIcon className="size-5" />
              </button>
              <Avatar src={selectedFriend?.profilePic} alt={selectedFriend?.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{selectedFriend?.fullName}</p>
              </div>
            </div>
            <div className="flex-1 relative h-full">
              <Chat client={chatClient}>
                <Channel channel={channel}>
                  <div className="w-full h-full relative">
                    <CallButton handleVideoCall={handleVideoCall} />
                    <Window>
                      <ChannelHeader />
                      <MessageList />
                      <MessageInput focus />
                    </Window>
                  </div>
                  <Thread />
                </Channel>
              </Chat>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-base-100">
            <div className="text-center p-6">
              <MessageSquareIcon className="size-16 mx-auto mb-4 text-base-content opacity-30" />
              <p className="text-lg font-semibold mb-2">Select a friend to start chatting</p>
              <p className="text-sm text-base-content opacity-70">
                Choose a friend from the list to view your conversation
              </p>
            </div>
          </div>
        )}
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;

