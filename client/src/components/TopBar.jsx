import { BsMoon, BsSunFill } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineGroups } from "react-icons/md";
import { Link } from "react-router-dom";
import CustomButton from "./CustomButton";
import TextInput from "./TextInput";
import NotificationDropdown from "./NotificationDropdown";
import { useSelector, useDispatch } from "react-redux";
import { SetTheme } from "../redux/theme";
import { Logout, SetNotifications } from "../redux/userSlice";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../utils";

const TopBar = () => {
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const { user, notifications } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm({ mode: "onChange" });
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.token) return;
    const res = await apiRequest({
      url: "/users/get-friend-request",
      token: user?.token,
      method: "POST",
    });
    if (res?.data) dispatch(SetNotifications(res.data));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleTheme = () => {
    dispatch(SetTheme(theme === "light" ? "dark" : "light"));
  };

  const handleSearch = (data) => {
    if (data.search.trim() === "") return;
    navigate(`/search?q=${encodeURIComponent(data.search)}`);
  };

  return (
    <div className="topbar w-full flex items-center justify-between py-3 md:py-4 px-6 bg-white/20 border-b border-white/20 shadow-sm">
      {/* LOGO */}
      <Link to="/" className="flex gap-2 items-center">
        <div className="p-2 bg-blue rounded-xl text-white shadow-lg">
          <MdOutlineGroups size={22} />
        </div>
        <span
          className="text-xl md:text-2xl font-bold hidden sm:block"
          style={{
            backgroundImage: "linear-gradient(to right, var(--logo-gradient-from), var(--logo-gradient-to))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          PlacedIn
        </span>
      </Link>

      {/* SEARCH */}
      <form
        className="hidden md:flex items-center"
        onSubmit={handleSubmit(handleSearch)}
      >
        <TextInput
          placeholder="Search people, posts..."
          styles="w-[16rem] lg:w-[28rem] rounded-l-full py-2.5"
          register={register("search")}
        />
        <CustomButton
          title="Search"
          type="submit"
          containerStyles="bg-blue text-white px-5 py-2.5 mt-2 rounded-r-full hover:opacity-90"
        />
      </form>

      {/* RIGHT */}
      <div className="flex gap-3 items-center text-ascent-1 text-lg md:text-xl">
        <button
          onClick={handleTheme}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 transition"
        >
          {theme === "light" ? (
            <BsMoon size={18} />
          ) : (
            <BsSunFill size={18} className="text-yellow-300" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative hidden lg:flex">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 transition"
          >
            <IoMdNotificationsOutline size={18} />
            {notifications?.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ background: "linear-gradient(to right, #A35139, #FFB162)" }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <CustomButton
          onClick={() => dispatch(Logout())}
          title="Log Out"
          containerStyles="text-sm text-ascent-1 px-4 py-1.5 bg-white/20 border border-white/25 rounded-full hover:bg-blue hover:text-white hover:border-blue transition"
        />
      </div>
    </div>
  );
};

export default TopBar;