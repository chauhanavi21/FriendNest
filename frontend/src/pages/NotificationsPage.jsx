import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests, getNotifications, markNotificationAsRead } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon, UserMinusIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import Avatar from "../components/Avatar";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const { data: friendRequests, isLoading: loadingFriendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { data: notificationsData, isLoading: loadingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 5000, // Refetch every 5 seconds for faster updates
  });

  // Listen for notification creation events - immediate update
  useEffect(() => {
    const handleNotificationCreated = () => {
      // Immediately refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] }); // Also update friend requests badge
    };
    window.addEventListener("notificationCreated", handleNotificationCreated);
    return () => window.removeEventListener("notificationCreated", handleNotificationCreated);
  }, [queryClient]);

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const { mutate: markAsReadMutation } = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];
  const removedRequests = friendRequests?.removedReqs || [];
  const messageNotifications = (notificationsData?.notifications?.filter((n) => n.type === "message") || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  const isLoading = loadingFriendRequests || loadingNotifications;

  const handleMessageNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation(notification._id);
    }
    
    // Extract friend ID from channelId (format: "userId1-userId2")
    if (notification.channelId && authUser) {
      const channelParts = notification.channelId.split("-");
      const friendId = channelParts.find(id => id !== authUser._id);
      if (friendId) {
        navigate(`/chat/${friendId}`);
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-4 sm:space-y-6 lg:space-y-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-4 sm:mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  <span>Friend Requests</span>
                  <span className="badge badge-primary">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar src={request.sender.profilePic} alt={request.sender.fullName} size="lg" className="sm:!w-14 sm:!h-14" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm text-xs">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm text-xs">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm sm:btn-md h-10 min-h-10 w-full sm:w-auto"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {acceptedRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => {
                    const otherUser = notification.otherUser || (notification.role === "sender" ? notification.recipient : notification.sender);
                    const isRecipient = notification.role === "recipient"; // Current user accepted the request
                    
                    return (
                      <div key={notification._id} className="card bg-base-200 shadow-sm">
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <Avatar src={otherUser.profilePic} alt={otherUser.fullName} size="md" className="mt-1 sm:!w-12 sm:!h-12" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{otherUser.fullName}</h3>
                              <p className="text-xs sm:text-sm my-1">
                                {isRecipient
                                  ? `You accepted ${otherUser.fullName}'s friend request`
                                  : `${otherUser.fullName} accepted your friend request`}
                              </p>
                              <p className="text-xs flex items-center opacity-70">
                                <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                Recently
                              </p>
                            </div>
                            <div className="badge badge-success flex-shrink-0">
                              <MessageSquareIcon className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">New Friend</span>
                              <span className="sm:hidden">New</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {removedRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap">
                  <UserMinusIcon className="h-5 w-5 text-error" />
                  <span>Removed Friends</span>
                  <span className="badge badge-error">{removedRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {removedRequests.map((notification) => {
                    const otherUser = notification.sender;

                    return (
                      <div key={notification._id} className="card bg-base-200 shadow-sm border border-error/20">
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <Avatar src={otherUser.profilePic} alt={otherUser.fullName} size="md" className="mt-1 sm:!w-12 sm:!h-12" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{otherUser.fullName}</h3>
                              <p className="text-xs sm:text-sm my-1 text-error">
                                {otherUser.fullName} removed you as a friend
                              </p>
                              <p className="text-xs flex items-center opacity-70">
                                <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                {new Date(notification.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="badge badge-error flex-shrink-0">
                              <UserMinusIcon className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Removed</span>
                              <span className="sm:hidden">Rem</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {messageNotifications.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap">
                  <MessageSquareIcon className="h-5 w-5 text-info" />
                  <span>Messages</span>
                  <span className="badge badge-info">{messageNotifications.length}</span>
                </h2>

                <div className="space-y-3">
                  {messageNotifications.map((notification) => {
                    const sender = notification.sender;
                    if (!sender) return null;

                    return (
                      <div
                        key={notification._id}
                        className={`card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${!notification.isRead ? "ring-2 ring-info/50" : ""}`}
                        onClick={() => handleMessageNotificationClick(notification)}
                      >
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <Avatar src={sender.profilePic} alt={sender.fullName} size="md" className="mt-1 sm:!w-12 sm:!h-12" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{sender.fullName}</h3>
                              <p className="text-xs sm:text-sm my-1">
                                {notification.metadata?.messagePreview || notification.message}
                              </p>
                              <p className="text-xs flex items-center opacity-70">
                                <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="badge badge-info flex-shrink-0">
                                <MessageSquareIcon className="h-3 w-3 mr-1" />
                                {notification.metadata?.count > 1 ? (
                                  <span>{notification.metadata.count}</span>
                                ) : (
                                  <>
                                    <span className="hidden sm:inline">New</span>
                                    <span className="sm:hidden">N</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && removedRequests.length === 0 && messageNotifications.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
