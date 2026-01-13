import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function updateProfile(profileData) {
  const response = await axiosInstance.put("/users/profile", profileData);
  return response.data;
}

export async function removeFriend(friendId) {
  const response = await axiosInstance.delete(`/users/friends/${friendId}`);
  return response.data;
}

export async function searchUsers(params) {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append("query", params.query);
  if (params.nativeLanguage) queryParams.append("nativeLanguage", params.nativeLanguage);
  if (params.learningLanguage) queryParams.append("learningLanguage", params.learningLanguage);
  if (params.location) queryParams.append("location", params.location);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  const response = await axiosInstance.get(`/users/search?${queryParams.toString()}`);
  return response.data;
}

export async function updateEmail(emailData) {
  const response = await axiosInstance.put("/users/settings/email", emailData);
  return response.data;
}

export async function updatePassword(passwordData) {
  const response = await axiosInstance.put("/users/settings/password", passwordData);
  return response.data;
}

export async function updateSettings(settingsData) {
  const response = await axiosInstance.put("/users/settings", settingsData);
  return response.data;
}

export async function deleteAccount(password) {
  const response = await axiosInstance.delete("/users/account", { data: { password } });
  return response.data;
}

// Group API functions
export async function getGroups(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.language) queryParams.append("language", params.language);
  if (params.search) queryParams.append("search", params.search);

  const response = await axiosInstance.get(`/groups?${queryParams.toString()}`);
  return response.data;
}

export async function getMyGroups() {
  const response = await axiosInstance.get("/groups/my-groups");
  return response.data;
}

export async function getGroupById(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}`);
  return response.data;
}

export async function createGroup(groupData) {
  const response = await axiosInstance.post("/groups", groupData);
  return response.data;
}

export async function updateGroup(groupId, groupData) {
  const response = await axiosInstance.put(`/groups/${groupId}`, groupData);
  return response.data;
}

export async function deleteGroup(groupId) {
  const response = await axiosInstance.delete(`/groups/${groupId}`);
  return response.data;
}

export async function joinGroup(groupId) {
  const response = await axiosInstance.post(`/groups/${groupId}/join`);
  return response.data;
}

export async function leaveGroup(groupId) {
  const response = await axiosInstance.post(`/groups/${groupId}/leave`);
  return response.data;
}

// Event API functions
export async function createEvent(groupId, eventData) {
  const response = await axiosInstance.post(`/groups/${groupId}/events`, eventData);
  return response.data;
}

export async function joinEvent(groupId, eventId) {
  const response = await axiosInstance.post(`/groups/${groupId}/events/${eventId}/join`);
  return response.data;
}

export async function leaveEvent(groupId, eventId) {
  const response = await axiosInstance.post(`/groups/${groupId}/events/${eventId}/leave`);
  return response.data;
}

export async function deleteEvent(groupId, eventId) {
  const response = await axiosInstance.delete(`/groups/${groupId}/events/${eventId}`);
  return response.data;
}

// Notification API functions
export async function getNotifications() {
  const response = await axiosInstance.get("/notifications");
  return response.data;
}

export async function markNotificationAsRead(notificationId) {
  const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await axiosInstance.put("/notifications/read-all");
  return response.data;
}

export async function createMessageNotification(senderId, channelId, messagePreview) {
  const response = await axiosInstance.post("/notifications/message", {
    senderId,
    channelId,
    messagePreview,
  });
  return response.data;
}

// ==================== ADMIN API FUNCTIONS ====================

// Statistics
export async function getAdminDashboardStats() {
  const response = await axiosInstance.get("/admin/stats/dashboard");
  return response.data;
}

// Users
export async function getAllAdminUsers(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const response = await axiosInstance.get(`/admin/users?${queryParams}`);
  return response.data;
}

export async function getAdminUserById(userId) {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data;
}

export async function deleteAdminUser(userId) {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
}

// Groups
export async function getAllAdminGroups(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const response = await axiosInstance.get(`/admin/groups?${queryParams}`);
  return response.data;
}

export async function getAdminGroupById(groupId) {
  const response = await axiosInstance.get(`/admin/groups/${groupId}`);
  return response.data;
}

export async function deleteAdminGroup(groupId) {
  const response = await axiosInstance.delete(`/admin/groups/${groupId}`);
  return response.data;
}

// Analytics
export async function getAdminAnalytics() {
  const response = await axiosInstance.get("/admin/stats/analytics");
  return response.data;
}
