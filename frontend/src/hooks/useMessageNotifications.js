import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { StreamChat } from "stream-chat";
import { getStreamToken, createMessageNotification } from "../lib/api";
import useAuthUser from "./useAuthUser";
import { useQuery } from "@tanstack/react-query";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function useMessageNotifications() {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const clientRef = useRef(null);
  const currentChannelIdRef = useRef(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Extract current channel ID from location
  useEffect(() => {
    // Check if we're on a chat page
    if (location.pathname.startsWith("/chat/")) {
      const chatId = location.pathname.split("/chat/")[1];
      if (chatId && authUser) {
        // Generate the same channel ID format used in ChatPage
        const channelId = [authUser._id, chatId].sort().join("-");
        currentChannelIdRef.current = channelId;
      }
    } else if (location.pathname === "/chatroom") {
      // For chatroom, the channel will be set via custom event from ChatRoomPage
      currentChannelIdRef.current = null;
    } else {
      currentChannelIdRef.current = null;
    }
  }, [location.pathname, authUser]);

  // Listen for channel changes from ChatRoomPage
  useEffect(() => {
    const handleChannelChange = (event) => {
      currentChannelIdRef.current = event.detail?.channelId || null;
    };
    window.addEventListener("currentChannelChanged", handleChannelChange);
    return () => window.removeEventListener("currentChannelChanged", handleChannelChange);
  }, []);

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    const initGlobalClient = async () => {
      try {
        // Get or create a singleton client instance
        let client = StreamChat.getInstance(STREAM_API_KEY);

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

        clientRef.current = client;

        // Listen for new messages
        const handleNewMessage = async (event) => {
          if (!event.message || !event.user) return;

          // Don't create notification for own messages
          if (event.user.id === authUser._id) return;

          // Get channel ID - Stream Chat uses cid format like "messaging:channel-id"
          const cid = event.cid;
          if (!cid) return;

          // Extract just the channel ID part (after the colon)
          const channelId = cid.includes(":") ? cid.split(":")[1] : cid;

          // Don't create notification if user is currently viewing this chat
          if (currentChannelIdRef.current === channelId) {
            return;
          }

          // Extract message preview
          const messageText = event.message.text || "New message";
          const messagePreview = messageText.length > 50 
            ? messageText.substring(0, 50) + "..." 
            : messageText;

          // Get sender ID from the message
          const senderId = event.message.user?.id || event.user.id;

          // Create notification via API
          try {
            await createMessageNotification(senderId, channelId, messagePreview);
            // Dispatch custom event to trigger query invalidation
            window.dispatchEvent(new CustomEvent("notificationCreated"));
          } catch (error) {
            console.error("Error creating message notification:", error);
          }
        };

        // Subscribe to message.new event
        client.on("message.new", handleNewMessage);

        // Cleanup function
        return () => {
          if (clientRef.current) {
            clientRef.current.off("message.new", handleNewMessage);
          }
        };
      } catch (error) {
        console.error("Error initializing global chat client:", error);
      }
    };

    initGlobalClient();

    // Cleanup on unmount
    return () => {
      // Note: We don't disconnect the client here as it might be used by other components
      // The client will be cleaned up when the user logs out
    };
  }, [tokenData, authUser]);
}

