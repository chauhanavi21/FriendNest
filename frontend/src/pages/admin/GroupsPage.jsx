import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAdminGroups, deleteAdminGroup, getAdminGroupById } from "../../lib/api";
import { SearchIcon, TrashIcon, UsersIcon, CalendarIcon, GlobeIcon, EyeIcon, MapPinIcon } from "lucide-react";
import Avatar from "../../components/Avatar";
import toast from "react-hot-toast";
import { getLanguageFlag } from "../../components/FriendCard";

const GroupsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminGroups", page, limit, searchQuery],
    queryFn: () => getAllAdminGroups({ page, limit, search: searchQuery }),
  });

  const { mutate: deleteGroupMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteAdminGroup,
    onSuccess: () => {
      toast.success("Group deleted successfully");
      setGroupToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["adminGroups"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete group");
    },
  });

  const groups = data?.groups || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalGroups = data?.pagination?.total || 0;

  // Fetch group details when selected
  const { data: groupDetails } = useQuery({
    queryKey: ["adminGroupDetails", selectedGroupId],
    queryFn: () => getAdminGroupById(selectedGroupId),
    enabled: !!selectedGroupId,
  });

  const handleDelete = (groupId, groupName) => {
    setGroupToDelete({ id: groupId, name: groupName });
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      deleteGroupMutation(groupToDelete.id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Group Management</h1>
        <p className="text-base-content opacity-70 mt-1">Manage and monitor all platform groups</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="form-control w-full max-w-md">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="input input-bordered w-full pl-10"
              placeholder="Search by group name..."
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 flex gap-4">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Total Groups</div>
          <div className="stat-value text-2xl">{totalGroups}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Current Page</div>
          <div className="stat-value text-2xl">
            {page} / {totalPages}
          </div>
        </div>
      </div>

      {/* Groups Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>Error loading groups. Please try again.</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="card bg-base-200 p-8 text-center border border-base-300 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">No groups found</h3>
          <p className="text-sm text-base-content opacity-70">
            {searchQuery ? `No groups match "${searchQuery}"` : "No groups in the system"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Language</th>
                  <th>Members</th>
                  <th>Events</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {group.coverImage ? (
                          <img
                            src={group.coverImage}
                            alt={group.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <UsersIcon className="size-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{group.name}</div>
                          {group.description && (
                            <div className="text-xs opacity-70 line-clamp-1 max-w-xs">
                              {group.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getLanguageFlag(group.language)}</span>
                        <span className="text-sm">{group.language}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <UsersIcon className="size-4 opacity-70" />
                        <span>{group.members?.length || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 opacity-70" />
                        <span>{group.events?.length || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 opacity-70" />
                        <span className="text-sm">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedGroupId(group._id)}
                          className="btn btn-ghost btn-sm"
                        >
                          <EyeIcon className="size-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(group._id, group.name)}
                          className="btn btn-ghost btn-sm btn-error"
                          disabled={isDeleting}
                        >
                          <TrashIcon className="size-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                className="btn btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Group Detail Modal */}
      {selectedGroupId && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Group Details</h3>
            {groupDetails?.group ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {groupDetails.group.coverImage ? (
                    <img
                      src={groupDetails.group.coverImage}
                      alt={groupDetails.group.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                      <UsersIcon className="size-10 text-primary" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold">{groupDetails.group.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{getLanguageFlag(groupDetails.group.language)}</span>
                      <span>{groupDetails.group.language}</span>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                {groupDetails.group.description && (
                  <div>
                    <p className="text-sm opacity-70 mb-2">Description</p>
                    <p>{groupDetails.group.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-70">Members</p>
                    <p className="font-semibold flex items-center gap-2">
                      <UsersIcon className="size-4" />
                      {groupDetails.group.members?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Events</p>
                    <p className="font-semibold flex items-center gap-2">
                      <CalendarIcon className="size-4" />
                      {groupDetails.group.events?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Created</p>
                    <p className="font-semibold">
                      {new Date(groupDetails.group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {groupDetails.group.creator && (
                    <div>
                      <p className="text-sm opacity-70">Creator</p>
                      <div className="flex items-center gap-2">
                        <Avatar src={groupDetails.group.creator.profilePic} alt={groupDetails.group.creator.fullName} size="xs" />
                        <span className="font-semibold">{groupDetails.group.creator.fullName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {groupDetails.group.members && groupDetails.group.members.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="text-sm opacity-70 mb-2">Members ({groupDetails.group.members.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {groupDetails.group.members.map((member) => (
                          <div key={member._id} className="flex items-center gap-2 badge badge-outline">
                            <Avatar src={member.profilePic} alt={member.fullName} size="xs" />
                            <span>{member.fullName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {groupDetails.group.events && groupDetails.group.events.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="text-sm opacity-70 mb-2">Events ({groupDetails.group.events.length})</p>
                      <div className="space-y-2">
                        {groupDetails.group.events.map((event) => (
                          <div key={event._id} className="card bg-base-200 p-3">
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-xs opacity-70">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <CalendarIcon className="size-3" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                              {event.location && (
                                <>
                                  <MapPinIcon className="size-3 ml-2" />
                                  <span>{event.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
              </div>
            )}
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedGroupId(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {groupToDelete && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Group</h3>
            <p className="py-4">
              Are you sure you want to delete group <strong>{groupToDelete.name}</strong>? This
              action cannot be undone and will remove all associated data including events and chat
              history.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setGroupToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default GroupsPage;
