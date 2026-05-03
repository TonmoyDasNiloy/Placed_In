import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NoProfile } from "../assets";
import { apiRequest } from "../utils";
import { SetNotifications } from "../redux/userSlice";

const NotificationDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user, notifications } = useSelector((state) => state.user);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (requestId) => {
    await apiRequest({
      url: "/users/accept-request",
      token: user?.token,
      method: "POST",
      data: { rid: requestId, status: "Accepted" },
    });
    dispatch(
      SetNotifications(notifications.filter((n) => n._id !== requestId))
    );
  };

  const handleDecline = async (requestId) => {
    await apiRequest({
      url: "/users/accept-request",
      token: user?.token,
      method: "POST",
      data: { rid: requestId, status: "Declined" },
    });
    dispatch(
      SetNotifications(notifications.filter((n) => n._id !== requestId))
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/20"
      style={{
        background: "var(--dropdown-bg, rgba(245, 241, 234, 0.97))",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between">
        <h3 className="font-semibold text-ascent-1 text-sm">Notifications</h3>
        {notifications?.length > 0 && (
          <span className="text-xs text-ascent-2">{notifications.length} pending</span>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications?.length === 0 ? (
          <div className="px-4 py-8 text-center text-ascent-2 text-sm">
            No new notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/10 hover:bg-white/10 transition"
            >
              <img
                src={notif?.requestFrom?.profileUrl ?? NoProfile}
                alt={notif?.requestFrom?.firstName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ascent-1 font-medium truncate">
                  {notif?.requestFrom?.firstName} {notif?.requestFrom?.lastName}
                </p>
                <p className="text-xs text-ascent-2">Sent you a friend request</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleAccept(notif._id)}
                  className="text-xs px-2.5 py-1 rounded-full text-white transition"
                  style={{ background: "linear-gradient(to right, #A35139, #FFB162)" }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(notif._id)}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/25 text-ascent-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;