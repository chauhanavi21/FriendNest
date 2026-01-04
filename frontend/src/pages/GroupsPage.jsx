import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  getGroups,
  getMyGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
} from "../lib/api";
import { LANGUAGES } from "../constants";
import { getLanguageFlag } from "../components/FriendCard";
import {
  UsersIcon,
  PlusIcon,
  GlobeIcon,
  MessageSquareIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  LoaderIcon,
  SearchIcon,
} from "lucide-react";
import Avatar from "../components/Avatar";
import useAuthUser from "../hooks/useAuthUser";

const GroupsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    language: "",
    coverImage: "",
  });

  const { data: allGroups = [], isLoading: loadingAllGroups } = useQuery({
    queryKey: ["groups", searchQuery, languageFilter],
    queryFn: () => getGroups({ search: searchQuery, language: languageFilter }),
    enabled: activeTab === "all",
  });

  const { data: myGroups = [], isLoading: loadingMyGroups } = useQuery({
    queryKey: ["myGroups"],
    queryFn: getMyGroups,
    enabled: activeTab === "my",
  });

  const { mutate: createGroupMutation, isPending: isCreating } = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success("Group created successfully!");
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", language: "", coverImage: "" });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  const { mutate: joinGroupMutation, isPending: isJoining } = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      toast.success("Joined group successfully!");
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
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to leave group");
    },
  });

  const { mutate: deleteGroupMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      toast.success("Group deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete group");
    },
  });

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.language) {
      toast.error("Name and language are required");
      return;
    }
    createGroupMutation(createForm);
  };

  const handleJoinGroup = (groupId) => {
    joinGroupMutation(groupId);
  };

  const handleLeaveGroup = (groupId) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      leaveGroupMutation(groupId);
    }
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      deleteGroupMutation(groupId);
    }
  };

  const groupsToDisplay = activeTab === "all" ? allGroups : myGroups;
  const isLoading = activeTab === "all" ? loadingAllGroups : loadingMyGroups;

  return (
    <div className="p-4 md:p-6 bg-base-100 min-h-full">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gap-2"
          >
            <PlusIcon className="size-5" />
            Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 w-fit">
          <button
            className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Groups
          </button>
          <button
            className={`tab ${activeTab === "my" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("my")}
          >
            My Groups
          </button>
        </div>

        {/* Filters (only for "all" tab) */}
        {activeTab === "all" && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="form-control flex-1">
              <div className="relative">
                <SearchIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10"
                  placeholder="Search groups by name or description..."
                />
              </div>
            </div>
            <div className="form-control sm:w-48">
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="select select-bordered"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Groups List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : groupsToDisplay.length === 0 ? (
          <div className="card bg-base-200 p-8 text-center border border-base-300">
            <UsersIcon className="size-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No groups found</h3>
            <p className="text-sm text-base-content opacity-70 mb-4">
              {activeTab === "all"
                ? "Create a new group to get started!"
                : "You haven't joined any groups yet."}
            </p>
            {activeTab === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupsToDisplay.map((group) => (
              <div
                key={group._id}
                className="card bg-base-200 hover:shadow-lg transition-shadow border border-base-300"
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl mb-2 truncate">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-base-content opacity-70 line-clamp-2 mb-3">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="badge badge-secondary">
                      {getLanguageFlag(group.language)}
                      <span className="ml-1">{group.language}</span>
                    </span>
                    <span className="badge badge-outline flex items-center gap-1">
                      <UsersIcon className="size-3" />
                      {group.memberCount || group.members?.length || 0} members
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Avatar
                      src={group.creator?.profilePic}
                      alt={group.creator?.fullName}
                      size="sm"
                    />
                    <span className="text-sm opacity-70">
                      Created by {group.creator?.fullName}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {group.isMember ? (
                      <>
                        <button
                          onClick={() => navigate(`/groups/${group._id}`)}
                          className="btn btn-primary btn-sm flex-1"
                        >
                          View Group
                        </button>
                        {group.isCreator ? (
                          <button
                            onClick={() => handleDeleteGroup(group._id)}
                            disabled={isDeleting}
                            className="btn btn-error btn-outline btn-sm"
                            title="Delete Group"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveGroup(group._id)}
                            disabled={isLeaving}
                            className="btn btn-error btn-outline btn-sm"
                            title="Leave Group"
                          >
                            <UserMinusIcon className="size-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group._id)}
                        disabled={isJoining}
                        className="btn btn-primary btn-sm w-full gap-2"
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
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="card bg-base-200 border border-base-300 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Group Name *</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="input input-bordered"
                      placeholder="Enter group name"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Language *</span>
                    </label>
                    <select
                      value={createForm.language}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, language: e.target.value })
                      }
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select a language</option>
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Description</span>
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, description: e.target.value })
                      }
                      className="textarea textarea-bordered"
                      placeholder="Enter group description (optional)"
                      rows="3"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Cover Image URL</span>
                    </label>
                    <input
                      type="url"
                      value={createForm.coverImage}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, coverImage: e.target.value })
                      }
                      className="input input-bordered"
                      placeholder="https://example.com/image.jpg (optional)"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setCreateForm({
                          name: "",
                          description: "",
                          language: "",
                          coverImage: "",
                        });
                      }}
                      className="btn btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="btn btn-primary flex-1 gap-2"
                    >
                      {isCreating ? (
                        <>
                          <LoaderIcon className="animate-spin size-4" />
                          Creating...
                        </>
                      ) : (
                        "Create Group"
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

export default GroupsPage;

