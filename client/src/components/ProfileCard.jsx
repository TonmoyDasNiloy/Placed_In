import moment from "moment";
import React, { useEffect } from "react";
import { BsBriefcase, BsFacebook, BsInstagram, BsPersonFillAdd } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";
import { LiaEditSolid } from "react-icons/lia";
import { CiLocationOn } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { NoProfile } from "../assets";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProfile } from "../redux/userSlice";
import { sendFriendRequest, handleUnfriend, handleProfileView, apiRequest } from "../utils";

const ProfileCard = ({ user, onUnfriend }) => {
  const { user: data } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id !== data?._id) {
      handleProfileView(user?._id);
    }
  }, [user?._id, data?._id]);

  const handleMessageUser = async () => {
    const res = await apiRequest({
      url: "/messages/conversation",
      token: data?.token,
      method: "POST",
      data: { receiverId: user._id },
    });
    if (res?.success) navigate("/messages");
  };

  return (
    <div className="w-full glass rounded-2xl overflow-hidden">
      {/* Banner */}
      <div className="h-16 bg-gradient-to-r from-[#7c3aed] to-[#a855f7]" />

      <div className="px-5 pb-5">
        {/* Avatar + Buttons */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <Link to={"/profile/" + user?._id}>
            <img
              src={user?.profileUrl ?? NoProfile}
              alt={user?.email}
              className="w-16 h-16 object-cover rounded-full border-4 border-white/30 shadow-lg"
            />
          </Link>

          <div className="flex items-center gap-2">
            {user?._id === data?._id ? (
              <button
                onClick={() => dispatch(UpdateProfile(true))}
                className="flex items-center gap-1 text-xs bg-blue text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-all duration-200"
              >
                <LiaEditSolid size={14} /> Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleMessageUser}
                  className="flex items-center gap-1 text-xs border border-white/25 text-ascent-1 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-blue hover:text-white hover:border-blue hover:shadow-md"
                >
                  Message
                </button>

                {data?.friends?.some(
                  (f) => f._id?.toString() === user?._id?.toString()
                ) ? (
                  <button
                    style={{
                      transition: "background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s",
                    }}
                    className="flex items-center gap-1 text-xs border border-white/25 text-ascent-1 px-3 py-1.5 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-md"
                    onClick={async () => {
                      await handleUnfriend(data?.token, user?._id, data?._id);
                      if (onUnfriend) onUnfriend();
                    }}
                  >
                    Unfriend
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-1 text-xs border border-white/25 text-ascent-1 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-blue hover:text-white hover:border-blue hover:shadow-md"
                    onClick={() => sendFriendRequest(data.token, user._id)}
                  >
                    <BsPersonFillAdd size={14} /> Connect
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Name & Profession */}
        <Link to={"/profile/" + user?._id}>
          <p className="text-lg font-bold text-ascent-1 hover:text-blue transition">
            {user?.firstName} {user?.lastName}
          </p>
        </Link>
        <p className="text-sm text-ascent-2">{user?.profession ?? "No Profession"}</p>

        {/* Location & Job */}
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex gap-2 items-center text-ascent-2 text-sm">
            <CiLocationOn className="text-blue" />
            <span>{user?.location ?? "Add Location"}</span>
          </div>
          <div className="flex gap-2 items-center text-ascent-2 text-sm">
            <BsBriefcase className="text-blue" />
            <span>{user?.profession ?? "Add Profession"}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 text-center gap-2">
          <div>
            <p className="text-lg font-bold text-ascent-1">
              {user?.friends?.length ?? 0}
            </p>
            <p className="text-xs text-ascent-2">Friends</p>
          </div>
          <div>
            <p className="text-lg font-bold text-ascent-1">
              {user?.views ?? 0}
            </p>
            <p className="text-xs text-ascent-2">Views</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue pt-1">
              {user?.verified ? "✓ Verified" : "Unverified"}
            </p>
            <p className="text-xs text-ascent-2">
              {moment(user?.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <p className="text-sm font-semibold text-ascent-1 mb-3">
            Social Profiles
          </p>
          <div className="flex gap-4">
            <a
              href={user?.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-pink-500/30 transition text-ascent-1"
            >
              <BsInstagram size={16} />
            </a>
            <a
              href={user?.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-blue/30 transition text-ascent-1"
            >
              <BsFacebook size={16} />
            </a>
            <a
              href={user?.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-blue/30 transition text-ascent-1"
            >
              <FaLinkedin size={16} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileCard;