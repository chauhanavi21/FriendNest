import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getGroupById,
  joinGroup,
  leaveGroup,
  deleteGroup,
  createEvent,
  joinEvent,
  leaveEvent,
  deleteEvent,
} from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import {
  UsersIcon,
  CalendarIcon,
  MessageSquareIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  LoaderIcon,
  EditIcon,
  MapPinIcon,
  ClockIcon,
} from "lucide-react";
import Avatar from "../components/Avatar";
import { getLanguageFlag } from "../components/FriendCard";

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [activeTab, setActiveTab] = useState("events"); // "events" or "members"

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupById(id),
  });

  const { mutate: joinGroupMutation, isPending: isJoining } = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      toast.success("Joined group successfully!");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to join group");
    },
  });

  const { mutate: leaveGroupMutation, isPending: isLeaving } = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      toast.success("Left group successfully!");
      navigate("/groups");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to leave group");
    },
  });

  const { mutate: deleteGroupMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      toast.success("Group deleted successfully!");
      navigate("/groups");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete group");
    },
  });

  const { mutate: createEventMutation, isPending: isCreatingEvent } = useMutation({
    mutationFn: (data) => createEvent(id, data),
    onSuccess: () => {
      toast.success("Event created successfully!");
      setShowCreateEventModal(false);
      setEventForm({ title: "", description: "", date: "", location: "" });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create event");
    },
  });

  const { mutate: joinEventMutation } = useMutation({
    mutationFn: (eventId) => joinEvent(id, eventId),
    onSuccess: () => {
      toast.success("Joined event successfully!");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to join event");
    },
  });

  const { mutate: leaveEventMutation } = useMutation({
    mutationFn: (eventId) => leaveEvent(id, eventId),
    onSuccess: () => {
      toast.success("Left event successfully!");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to leave event");
    },
  });

  const { mutate: deleteEventMutation } = useMutation({
    mutationFn: (eventId) => deleteEvent(id, eventId),
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete event");
    },
  });

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      toast.error("Title and date are required");
      return;
    }
    createEventMutation(eventForm);
  };

  const handleJoinEvent = (eventId) => {
    joinEventMutation(eventId);
  };

  const handleLeaveEvent = (eventId) => {
    leaveEventMutation(eventId);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation(eventId);
    }
  };

  const handleDeleteGroup = () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      deleteGroupMutation(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-base-200 p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Group not found</h2>
            <button onClick={() => navigate("/groups")} className="btn btn-primary mt-4">
              Go back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMember = group.isMember || false;
  const isCreator = group.isCreator || false;
  const sortedEvents = group.events
    ? [...group.events].sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  return (
    <div className="p-4 md:p-6 bg-base-100 min-h-full">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/groups")}
            className="btn btn-ghost btn-sm mb-4 gap-2"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Groups
          </button>

          <div className="card bg-base-200 border border-base-300">
            {group.coverImage && (
              <figure className="h-48 overflow-hidden">
                <img src={group.coverImage} alt={group.name} className="w-full object-cover" />
              </figure>
            )}
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                  {group.description && (
                    <p className="text-base-content opacity-70 mb-4">{group.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="badge badge-secondary">
                      {getLanguageFlag(group.language)}
                      <span className="ml-1">{group.language}</span>
                    </span>
                    <span className="badge badge-outline flex items-center gap-1">
                      <UsersIcon className="size-3" />
                      {group.memberCount || group.members?.length || 0} members
                    </span>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Avatar src={group.creator?.profilePic} alt={group.creator?.fullName} size="sm" />
                      <span>Created by {group.creator?.fullName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {isMember ? (
                    <>
                      <button
                        onClick={() => navigate(`/groups/${id}/chat`)}
                        className="btn btn-primary gap-2"
                      >
                        <MessageSquareIcon className="size-4" />
                        Group Chat
                      </button>
                      {isCreator ? (
                        <button
                          onClick={handleDeleteGroup}
                          disabled={isDeleting}
                          className="btn btn-error btn-outline gap-2"
                        >
                          <TrashIcon className="size-4" />
                          Delete Group
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to leave this group?")) {
                              leaveGroupMutation(id);
                            }
                          }}
                          disabled={isLeaving}
                          className="btn btn-error btn-outline gap-2"
                        >
                          <UserMinusIcon className="size-4" />
                          Leave Group
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => joinGroupMutation(id)}
                      disabled={isJoining}
                      className="btn btn-primary gap-2"
                    >
                      {isJoining ? (
                        <>
                          <LoaderIcon className="animate-spin size-4" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="size-4" />
                          Join Group
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 w-fit">
          <button
            className={`tab ${activeTab === "events" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            <CalendarIcon className="size-4 mr-2" />
            Events
          </button>
          <button
            className={`tab ${activeTab === "members" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <UsersIcon className="size-4 mr-2" />
            Members
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {isMember && (
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="btn btn-primary gap-2"
              >
                <PlusIcon className="size-4" />
                Create Event
              </button>
            )}

            {sortedEvents.length === 0 ? (
              <div className="card bg-base-200 p-8 text-center border border-base-300">
                <CalendarIcon className="size-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No events yet</h3>
                <p className="text-sm text-base-content opacity-70">
                  {isMember
                    ? "Create the first event for this group!"
                    : "Join the group to see and create events."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const isPast = eventDate < new Date();
                  const isAttending = event.attendees?.some(
                    (attendee) => attendee._id === authUser?._id || attendee === authUser?._id
                  );
                  const isOrganizer = event.organizer?._id === authUser?._id || event.organizer === authUser?._id;

                  return (
                    <div
                      key={event._id}
                      className={`card bg-base-200 border border-base-300 ${
                        isPast ? "opacity-60" : ""
                      }`}
                    >
                      <div className="card-body">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{event.title}</h3>
                              {isPast && (
                                <span className="badge badge-ghost text-xs">Past Event</span>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-base-content opacity-70 mb-4">{event.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="size-4 opacity-70" />
                                <span>{eventDate.toLocaleString()}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPinIcon className="size-4 opacity-70" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <UsersIcon className="size-4 opacity-70" />
                                <span>
                                  {event.attendees?.length || 0} attendee
                                  {event.attendees?.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-sm opacity-70">
                              <Avatar
                                src={event.organizer?.profilePic}
                                alt={event.organizer?.fullName}
                                size="sm"
                              />
                              <span>Organized by {event.organizer?.fullName}</span>
                            </div>
                          </div>

                          {isMember && !isPast && (
                            <div className="flex flex-col gap-2">
                              {isOrganizer ? (
                                <button
                                  onClick={() => handleDeleteEvent(event._id)}
                                  className="btn btn-error btn-outline btn-sm gap-2"
                                >
                                  <TrashIcon className="size-4" />
                                  Delete
                                </button>
                              ) : isAttending ? (
                                <button
                                  onClick={() => handleLeaveEvent(event._id)}
                                  className="btn btn-outline btn-sm gap-2"
                                >
                                  <UserMinusIcon className="size-4" />
                                  Leave Event
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleJoinEvent(event._id)}
                                  className="btn btn-primary btn-sm gap-2"
                                >
                                  <UserPlusIcon className="size-4" />
                                  Join Event
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4">
                Members ({group.memberCount || group.members?.length || 0})
              </h3>
              {group.members && group.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {group.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-3 bg-base-100 rounded-lg"
                    >
                      <Avatar src={member.profilePic} alt={member.fullName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{member.fullName}</p>
                        {member._id === group.creator?._id && (
                          <p className="text-xs text-primary">Creator</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center opacity-70 py-8">No members found</p>
              )}
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="card bg-base-200 border border-base-300 shadow-xl max-w-md w-full">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Create Event</h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Title *</span>
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, title: e.target.value })
                      }
                      className="input input-bordered"
                      placeholder="Event title"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Date & Time *</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, date: e.target.value })
                      }
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Location</span>
                    </label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, location: e.target.value })
                      }
                      className="input input-bordered"
                      placeholder="Event location (optional)"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Description</span>
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, description: e.target.value })
                      }
                      className="textarea textarea-bordered"
                      placeholder="Event description (optional)"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateEventModal(false);
                        setEventForm({ title: "", description: "", date: "", location: "" });
                      }}
                      className="btn btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingEvent}
                      className="btn btn-primary flex-1 gap-2"
                    >
                      {isCreatingEvent ? (
                        <>
                          <LoaderIcon className="animate-spin size-4" />
                          Creating...
                        </>
                      ) : (
                        "Create Event"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;

