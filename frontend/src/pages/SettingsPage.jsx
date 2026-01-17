import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  updateEmail,
  updatePassword,
  updateSettings,
  deleteAccount,
  logout,
} from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import {
  SettingsIcon,
  MailIcon,
  LockIcon,
  ShieldIcon,
  BellIcon,
  GlobeIcon,
  TrashIcon,
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

const SettingsPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");

  const [emailForm, setEmailForm] = useState({
    email: authUser?.email || "",
    password: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const [privacySettings, setPrivacySettings] = useState({
    whoCanSendFriendRequests:
      authUser?.settings?.privacy?.whoCanSendFriendRequests || "everyone",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    friendRequests: authUser?.settings?.notifications?.friendRequests ?? true,
    friendAcceptances: authUser?.settings?.notifications?.friendAcceptances ?? true,
    friendRemovals: authUser?.settings?.notifications?.friendRemovals ?? true,
    messages: authUser?.settings?.notifications?.messages ?? true,
  });

  const [languageSettings, setLanguageSettings] = useState({
    preferredLanguage: authUser?.settings?.language?.preferredLanguage || "en",
  });

  const [deletePassword, setDeletePassword] = useState("");

  const { mutate: updateEmailMutation, isPending: isUpdatingEmail } = useMutation({
    mutationFn: updateEmail,
    onSuccess: (data) => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setEmailForm({ ...emailForm, password: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update email");
    },
  });

  const { mutate: updatePasswordMutation, isPending: isUpdatingPassword } = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const { mutate: updateSettingsMutation, isPending: isUpdatingSettings } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  const { mutate: deleteAccountMutation, isPending: isDeletingAccount } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      toast.success("Account deleted successfully");
      await logout();
      queryClient.clear();
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account");
    },
  });

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    updateEmailMutation(emailForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    updatePasswordMutation({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handlePrivacySave = () => {
    updateSettingsMutation({ privacy: privacySettings });
  };

  const handleNotificationSave = () => {
    updateSettingsMutation({ notifications: notificationSettings });
  };

  const handleLanguageSave = () => {
    updateSettingsMutation({ language: languageSettings });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast.error("Please enter your password");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted."
      )
    ) {
      return;
    }
    deleteAccountMutation(deletePassword);
  };

  const tabs = [
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "privacy", label: "Privacy", icon: ShieldIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "language", label: "Language", icon: GlobeIcon },
    { id: "danger", label: "Danger Zone", icon: TrashIcon },
  ];

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-base-100 min-h-full">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
          <p className="text-sm sm:text-base opacity-70">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-0">
                <ul className="menu menu-vertical w-full p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 ${
                            activeTab === tab.id ? "bg-primary text-primary-content" : ""
                          }`}
                        >
                          <Icon className="size-5" />
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="card bg-base-200 border border-base-300 shadow-lg">
              <div className="card-body p-4 sm:p-6">
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MailIcon className="size-5" />
                        Email Settings
                      </h2>
                      <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">New Email</span>
                          </label>
                          <input
                            type="email"
                            value={emailForm.email}
                            onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                            className="input input-bordered w-full"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Current Password</span>
                          </label>
                          <input
                            type="password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                            className="input input-bordered w-full"
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary w-full sm:w-auto"
                          disabled={isUpdatingEmail}
                        >
                          {isUpdatingEmail ? (
                            <>
                              <LoaderIcon className="animate-spin size-4 mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Update Email"
                          )}
                        </button>
                      </form>
                    </div>

                    <div className="divider" />

                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <LockIcon className="size-5" />
                        Password Settings
                      </h2>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Current Password</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                              }
                              className="input input-bordered w-full pr-10"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showCurrentPassword ? (
                                <EyeOffIcon className="size-5 opacity-70" />
                              ) : (
                                <EyeIcon className="size-5 opacity-70" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">New Password</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                              }
                              className="input input-bordered w-full pr-10"
                              placeholder="Enter new password (min 6 characters)"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showNewPassword ? (
                                <EyeOffIcon className="size-5 opacity-70" />
                              ) : (
                                <EyeIcon className="size-5 opacity-70" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Confirm New Password</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                              }
                              className="input input-bordered w-full pr-10"
                              placeholder="Confirm new password"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="size-5 opacity-70" />
                              ) : (
                                <EyeIcon className="size-5 opacity-70" />
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary w-full sm:w-auto"
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? (
                            <>
                              <LoaderIcon className="animate-spin size-4 mr-2" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ShieldIcon className="size-5" />
                      Privacy Settings
                    </h2>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Who can send you friend requests?</span>
                      </label>
                      <select
                        value={privacySettings.whoCanSendFriendRequests}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            whoCanSendFriendRequests: e.target.value,
                          })
                        }
                        className="select select-bordered w-full"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="friendsOfFriends">Friends of Friends</option>
                        <option value="nobody">Nobody</option>
                      </select>
                      <label className="label">
                        <span className="label-text-alt opacity-70">
                          {privacySettings.whoCanSendFriendRequests === "everyone" &&
                            "Anyone can send you friend requests"}
                          {privacySettings.whoCanSendFriendRequests === "friendsOfFriends" &&
                            "Only people who are friends with your friends can send requests"}
                          {privacySettings.whoCanSendFriendRequests === "nobody" &&
                            "No one can send you friend requests"}
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={handlePrivacySave}
                      className="btn btn-primary w-full sm:w-auto"
                      disabled={isUpdatingSettings}
                    >
                      {isUpdatingSettings ? (
                        <>
                          <LoaderIcon className="animate-spin size-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Privacy Settings"
                      )}
                    </button>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <BellIcon className="size-5" />
                      Notification Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings.friendRequests}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                friendRequests: e.target.checked,
                              })
                            }
                            className="checkbox checkbox-primary"
                          />
                          <div>
                            <span className="label-text font-semibold">Friend Requests</span>
                            <p className="text-xs opacity-70">Get notified when someone sends you a friend request</p>
                          </div>
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings.friendAcceptances}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                friendAcceptances: e.target.checked,
                              })
                            }
                            className="checkbox checkbox-primary"
                          />
                          <div>
                            <span className="label-text font-semibold">Friend Acceptances</span>
                            <p className="text-xs opacity-70">Get notified when someone accepts your friend request</p>
                          </div>
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings.friendRemovals}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                friendRemovals: e.target.checked,
                              })
                            }
                            className="checkbox checkbox-primary"
                          />
                          <div>
                            <span className="label-text font-semibold">Friend Removals</span>
                            <p className="text-xs opacity-70">Get notified when someone removes you as a friend</p>
                          </div>
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings.messages}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                messages: e.target.checked,
                              })
                            }
                            className="checkbox checkbox-primary"
                          />
                          <div>
                            <span className="label-text font-semibold">Messages</span>
                            <p className="text-xs opacity-70">Get notified when you receive new messages</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleNotificationSave}
                      className="btn btn-primary w-full sm:w-auto"
                      disabled={isUpdatingSettings}
                    >
                      {isUpdatingSettings ? (
                        <>
                          <LoaderIcon className="animate-spin size-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Notification Settings"
                      )}
                    </button>
                  </div>
                )}

                {activeTab === "language" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <GlobeIcon className="size-5" />
                      Language Preferences
                    </h2>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Preferred Language</span>
                      </label>
                      <select
                        value={languageSettings.preferredLanguage}
                        onChange={(e) =>
                          setLanguageSettings({
                            ...languageSettings,
                            preferredLanguage: e.target.value,
                          })
                        }
                        className="select select-bordered w-full"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ru">Russian</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                        <option value="ar">Arabic</option>
                        <option value="hi">Hindi</option>
                        <option value="gu">Gujarati</option>
                        <option value="bn">Bengali</option>
                      </select>
                      <label className="label">
                        <span className="label-text-alt opacity-70">
                          This sets your preferred language for the interface
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={handleLanguageSave}
                      className="btn btn-primary w-full sm:w-auto"
                      disabled={isUpdatingSettings}
                    >
                      {isUpdatingSettings ? (
                        <>
                          <LoaderIcon className="animate-spin size-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Language Settings"
                      )}
                    </button>
                  </div>
                )}

                {activeTab === "danger" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-error">
                      <TrashIcon className="size-5" />
                      Danger Zone
                    </h2>
                    <div className="alert alert-error">
                      <div>
                        <h3 className="font-bold">Delete Account</h3>
                        <div className="text-sm">
                          Once you delete your account, there is no going back. Please be certain. All your data,
                          friends, messages, and settings will be permanently deleted.
                        </div>
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Enter your password to confirm</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showDeletePassword ? "text" : "password"}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="input input-bordered w-full pr-10"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showDeletePassword ? (
                            <EyeOffIcon className="size-5 opacity-70" />
                          ) : (
                            <EyeIcon className="size-5 opacity-70" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="btn btn-error w-full sm:w-auto"
                      disabled={isDeletingAccount || !deletePassword}
                    >
                      {isDeletingAccount ? (
                        <>
                          <LoaderIcon className="animate-spin size-4 mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <TrashIcon className="size-4 mr-2" />
                          Delete My Account
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

