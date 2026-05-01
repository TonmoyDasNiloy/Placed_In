import React, { useEffect, useState } from "react";
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TextInput,
  TopBar,
} from "../components";
import { Link } from "react-router-dom";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  apiRequest,
  deletePost,
  fetchPosts,
  getUserInfo,
  handleFileUpload,
  likePost,
  sendFriendRequest,
} from "../utils";
import { useForm } from "react-hook-form";
import { NoProfile } from "../assets";
import { UserLogin } from "../redux/userSlice";

const Home = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const dispatch = useDispatch();
  const { user, edit } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);

  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);

  const fetchPost = async () => {
    await fetchPosts(user.token, dispatch);
    setLoading(false);
  };

  const onSubmitPost = async (data) => {
    setPosting(true);
    setErrMsg("");
    try {
      const uri = file && (await handleFileUpload(file));

      const newData = uri ? { ...data, image: uri } : data;

      const res = await apiRequest({
        url: "/posts/create-post",
        data: newData,
        token: user?.token,
        method: "POST",
      });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        reset({
          description: "",
        });
        setFile(null);
        setErrMsg("");
        await fetchPost();
      }
      setPosting(false);
    } catch (error) {
      console.log(error);
      setPosting(false);
    }
  };

  const handleLikePost = async (uri) => {
    await likePost({ uri: uri, token: user?.token });

    await fetchPost();
  };

  const handleDelete = async (id) => {
    await deletePost(id, user.token);
    await fetchPost();
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST",
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });
      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFriendRequest = async (id) => {
    try {
      const res = await sendFriendRequest(user.token, id);
      await fetchSuggestedFriends();
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token: user?.token,
        method: "POST",
        data: { rid: id, status },
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    const res = await getUserInfo(user?.token);
    const newData = { token: user?.token, ...res };
    dispatch(UserLogin(newData));
  };

  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequests();
    fetchSuggestedFriends();
  }, []);

  return (
    <>
      <div className="w-full px-0 lg:px-10 pb-5 2xl:px-40 bg-bgColor h-screen overflow-hidden">
        <TopBar />
        <div className="w-full flex gap-3 lg:gap-5 pt-5 pb-10 h-full">

          {/* LEFT */}
          <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-4 overflow-y-auto md:pl-4 lg:pl-0">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex-1 h-full px-2 flex flex-col gap-4 overflow-y-auto">
            {/* Post Composer */}
            <form className="glass rounded-2xl px-5 py-4" onSubmit={handleSubmit(onSubmitPost)}>
              <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                <img src={user?.profileUrl ?? NoProfile} alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                <TextInput
                  styles="w-full rounded-full py-3 text-sm"
                  placeholder="Share something with your network..."
                  name="description"
                  register={register("description", { required: "Write something about post" })}
                  error={errors.description ? errors.description.message : ""}
                />
              </div>

              {errMsg?.message && (
                <span className={`text-sm ${errMsg?.status === "failed" ? "text-red-500" : "text-green-500"} mt-1 block`}>
                  {errMsg?.message}
                </span>
              )}

              <div className="flex items-center justify-between pt-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm text-ascent-2 hover:text-blue cursor-pointer transition" htmlFor="imgUpload">
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="imgUpload" accept=".jpg,.png,.jpeg" />
                    <BiImages size={20} /> <span className="hidden sm:block">Photo</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-ascent-2 hover:text-blue cursor-pointer transition" htmlFor="videoUpload">
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="videoUpload" accept=".mp4,.wav" />
                    <BiSolidVideo size={20} /> <span className="hidden sm:block">Video</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-ascent-2 hover:text-blue cursor-pointer transition" htmlFor="vgifUpload">
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="vgifUpload" accept=".gif" />
                    <BsFiletypeGif size={20} /> <span className="hidden sm:block">GIF</span>
                  </label>
                </div>

                {posting ? <Loading /> : (
                  <CustomButton type="submit" title="Post" containerStyles="text-white py-1.5 px-6 rounded-full font-semibold text-sm hover:opacity-90 transition shadow"
                  style={{ background: "linear-gradient(to right, #A35139, #FFB162)" }} />
                )}
              </div>
            </form>

            {/* Posts Feed */}
            {loading ? <Loading /> : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard post={post} key={post?._id} user={user} deletePost={handleDelete} likePost={handleLikePost} />
              ))
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-lg text-ascent-2">No Posts Yet</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="hidden w-1/4 h-full lg:flex flex-col gap-4 overflow-y-auto">
            {/* Friend Requests */}
            <div className="glass rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-3">
                <span className="font-semibold text-ascent-1">Friend Requests</span>
                <span className="text-xs bg-blue text-white px-2 py-0.5 rounded-full">{friendRequest?.length}</span>
              </div>
              <div className="flex flex-col gap-4">
                {friendRequest?.map(({ _id, requestFrom: from }, index) => (
                  <div className="flex items-center justify-between" key={index + _id}>
                    <Link to={"/profile/" + from._id} className="flex gap-3 items-center flex-1">
                      <img src={from?.profileUrl ?? NoProfile} alt={from?.firstName}
                        className="w-10 h-10 object-cover rounded-full border-2 border-white/20" />
                      <div>
                        <p className="text-sm font-medium text-ascent-1">{from?.firstName} {from?.lastName}</p>
                        <span className="text-xs text-ascent-2">{from?.profession ?? "No Profession"}</span>
                      </div>
                    </Link>
                    <div className="flex gap-1">
                      <CustomButton onClick={() => acceptFriendRequest(_id, "Accepted")} title="Accept"
                        containerStyles="bg-blue text-xs text-white px-2.5 py-1 rounded-full hover:opacity-90 transition" />
                      <CustomButton title="Deny" onClick={() => acceptFriendRequest(_id, "Denied")}
                        containerStyles="bg-white/15 border border-white/20 text-xs text-ascent-1 px-2.5 py-1 rounded-full hover:bg-white/25 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Friends */}
            <div className="glass rounded-2xl px-5 py-4">
              <div className="pb-3 border-b border-white/15 mb-3">
                <span className="font-semibold text-ascent-1">People You May Know</span>
              </div>
              <div className="flex flex-col gap-4">
                {suggestedFriends?.map((friend, index) => (
                  <div className="flex items-center justify-between" key={index + friend?._id}>
                    <Link to={"/profile/" + friend?._id} className="flex gap-3 items-center flex-1">
                      <img src={friend?.profileUrl ?? NoProfile} alt={friend?.firstName}
                        className="w-10 h-10 object-cover rounded-full border-2 border-white/20" />
                      <div>
                        <p className="text-sm font-medium text-ascent-1">{friend?.firstName} {friend?.lastName}</p>
                        <span className="text-xs text-ascent-2">{friend?.profession ?? "No Profession"}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFriendRequest(friend?._id)}
                      className="flex items-center gap-1 text-xs border border-blue text-blue px-2.5 py-1 rounded-full hover:bg-blue hover:text-white transition"
                    >
                      <BsPersonFillAdd size={14} /> Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      {edit && <EditProfile />}
    </>
  );
};

export default Home;
