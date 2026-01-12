import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAdminUsers, deleteAdminUser, getAdminUserById } from "../../lib/api";
import { SearchIcon, TrashIcon, UserIcon, MailIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, EyeIcon, MapPinIcon, GlobeIcon } from "lucide-react";
import Avatar from "../../components/Avatar";
import toast from "react-hot-toast";

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUsers", page, limit, searchQuery],
    queryFn: () => getAllAdminUsers({ page, limit, search: searchQuery }),
  });

  const { mutate: deleteUserMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const users = data?.users || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalUsers = data?.pagination?.total || 0;

  // Fetch user details when selected
  const { data: userDetails } = useQuery({
    queryKey: ["adminUserDetails", selectedUserId],
    queryFn: () => getAdminUserById(selectedUserId),
    enabled: !!selectedUserId,
  });

  const handleDelete = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation(userToDelete.id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-base-content opacity-70 mt-1">Manage and monitor all platform users</p>
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
              placeholder="Search by name or email..."
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 flex gap-4">
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-2xl">{totalUsers}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg shadow">
          <div className="stat-title">Current Page</div>
          <div className="stat-value text-2xl">
            {page} / {totalPages}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>Error loading users. Please try again.</span>
        </div>
      ) : users.length === 0 ? (
        <div className="card bg-base-200 p-8 text-center border border-base-300 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">No users found</h3>
          <p className="text-sm text-base-content opacity-70">
            {searchQuery ? `No users match "${searchQuery}"` : "No users in the system"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Onboarded</th>
                  <th>Friends</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar src={user.profilePic} alt={user.fullName} size="sm" />
                        <div>
                          <div className="font-semibold">{user.fullName || "N/A"}</div>
                          {user.location && (
                            <div className="text-xs opacity-70">{user.location}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MailIcon className="size-4 opacity-70" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      {user.isOnboarded ? (
                        <span className="badge badge-success gap-2">
                          <CheckCircleIcon className="size-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="badge badge-error gap-2">
                          <XCircleIcon className="size-4" />
                          No
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <UserIcon className="size-4 opacity-70" />
                        <span>{user.friends?.length || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 opacity-70" />
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUserId(user._id)}
                          className="btn btn-ghost btn-sm"
                        >
                          <EyeIcon className="size-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.fullName || user.email)}
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

      {/* User Detail Modal */}
      {selectedUserId && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">User Details</h3>
            {userDetails?.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar src={userDetails.user.profilePic} alt={userDetails.user.fullName} size="lg" />
                  <div>
                    <h4 className="text-xl font-bold">{userDetails.user.fullName || "N/A"}</h4>
                    <p className="text-sm opacity-70">{userDetails.user.email}</p>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-70">Location</p>
                    <p className="font-semibold flex items-center gap-2">
                      <MapPinIcon className="size-4" />
                      {userDetails.user.location || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Onboarded</p>
                    <p>
                      {userDetails.user.isOnboarded ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-error">No</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Native Language</p>
                    <p className="font-semibold flex items-center gap-2">
                      <GlobeIcon className="size-4" />
                      {userDetails.user.nativeLanguage || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Learning Language</p>
                    <p className="font-semibold flex items-center gap-2">
                      <GlobeIcon className="size-4" />
                      {userDetails.user.learningLanguage || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Friends</p>
                    <p className="font-semibold">{userDetails.user.friends?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Groups</p>
                    <p className="font-semibold">{userDetails.groups?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Created</p>
                    <p className="font-semibold">
                      {new Date(userDetails.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {userDetails.user.bio && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="text-sm opacity-70 mb-2">Bio</p>
                      <p>{userDetails.user.bio}</p>
                    </div>
                  </>
                )}

                {userDetails.user.friends && userDetails.user.friends.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="text-sm opacity-70 mb-2">Friends ({userDetails.user.friends.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {userDetails.user.friends.map((friend) => (
                          <div key={friend._id} className="flex items-center gap-2 badge badge-outline">
                            <Avatar src={friend.profilePic} alt={friend.fullName} size="xs" />
                            <span>{friend.fullName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {userDetails.groups && userDetails.groups.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="text-sm opacity-70 mb-2">Groups ({userDetails.groups.length})</p>
                      <div className="space-y-2">
                        {userDetails.groups.map((group) => (
                          <div key={group._id} className="card bg-base-200 p-3">
                            <p className="font-semibold">{group.name}</p>
                            <p className="text-xs opacity-70">{group.language}</p>
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
              <button className="btn" onClick={() => setSelectedUserId(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete User</h3>
            <p className="py-4">
              Are you sure you want to delete user <strong>{userToDelete.name}</strong>? This action
              cannot be undone and will remove all associated data.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setUserToDelete(null)}
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

export default UsersPage;
