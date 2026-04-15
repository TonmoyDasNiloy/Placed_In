import React from "react";
import { NoProfile } from "../assets";
import { Link } from "react-router-dom";

const FriendsCard = ({ friends }) => {
  return (
    <div className="w-full glass rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-3">
        <span className="font-semibold text-ascent-1">Connections</span>
        <span className="text-xs bg-blue text-white px-2 py-0.5 rounded-full">
          {friends?.length ?? 0}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {friends?.map((friend) => (
          <Link
            to={"/profile/" + friend?._id}
            key={friend?._id}
            className="flex gap-3 items-center hover:bg-white/10 rounded-xl px-2 py-1.5 transition"
          >
            <img
              src={friend?.profileUrl ?? NoProfile}
              alt={friend?.firstName}
              className="w-10 h-10 object-cover rounded-full border-2 border-white/20"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-ascent-1">
                {friend?.firstName} {friend?.lastName}
              </p>
              <span className="text-xs text-ascent-2">
                {friend?.profession ?? "No Profession"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FriendsCard;