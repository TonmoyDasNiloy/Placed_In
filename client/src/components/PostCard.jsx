import React, { useState } from "react";
import moment from "moment";
import { BiSolidLike, BiLike, BiComment, BiShare } from "react-icons/bi";
import { MdOutlineDeleteOutline, MdDeleteForever } from "react-icons/md";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import { apiRequest } from "../utils";
import Loading from "./Loading";
import { toast } from "react-toastify";

const getPostComments = async (id) => {
  try {
    const res = await apiRequest({ url: "/posts/comments/" + id, method: "GET" });
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

const ReplyCard = ({ reply, user, handleLike }) => (
  <div className="w-full py-3">
    <div className="flex gap-3 items-center mb-1">
      <Link to={"/profile/" + reply?.userId?._id}>
        <img src={reply?.userId?.profileUrl ?? NoProfile} alt={reply?.userId?.firstName}
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
      </Link>
      <div>
        <Link to={"/profile/" + reply?.userId?._id}>
          <p className="font-medium text-sm text-ascent-1">{reply?.userId?.firstName} {reply?.userId?.lastName}</p>
        </Link>
        <span className="text-ascent-2 text-xs">{moment(reply?.created_At ?? "2023-05-25").fromNow()}</span>
      </div>
    </div>
    <div className="ml-11">
      <p className="text-ascent-2 text-sm">{reply?.comment}</p>
      <p className="flex gap-2 items-center text-sm text-ascent-2 cursor-pointer mt-1" onClick={handleLike}>
        {reply?.likes?.includes(user?._id) ? <BiSolidLike size={16} color="#7c3aed" /> : <BiLike size={16} />}
        {reply?.likes?.length} Likes
      </p>
    </div>
  </div>
);

const CommentForm = ({ user, id, replyAt, getComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrMsg("");
    try {
      const URL = !replyAt ? "/posts/comment/" + id : "/posts/reply-comment/" + id;
      const newData = { comment: data?.comment, from: user?.firstName + " " + user.lastName, replyAt };
      const res = await apiRequest({ url: URL, data: newData, token: user?.token, method: "POST" });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        reset({ comment: "" });
        setErrMsg("");
        await getComments();
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <form className="w-full border-b border-white/15 pb-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full flex items-center gap-2 py-3">
        <img src={user?.profileUrl} alt="User" className="w-9 h-9 rounded-full object-cover border-2 border-white/20" />
        <TextInput
          name="comment"
          styles="w-full rounded-full py-2 text-sm"
          placeholder={replyAt ? `Reply @${replyAt}` : "Add a comment..."}
          register={register("comment", { required: "Comment cannot be empty" })}
          error={errors.comment ? errors.comment.message : ""}
        />
      </div>
      {errMsg?.message && (
        <span className={`text-xs ${errMsg?.status === "failed" ? "text-red-500" : "text-green-500"}`}>
          {errMsg?.message}
        </span>
      )}
      <div className="flex justify-end">
        {loading ? <Loading /> : (
          <CustomButton title="Post" type="submit"
            containerStyles="bg-blue text-white py-1 px-4 rounded-full text-sm hover:opacity-90 transition" />
        )}
      </div>
    </form>
  );
};

const PostCard = ({ post, user, deletePost, likePost }) => {
  const [showAll, setShowAll] = useState(0);
  const [showReply, setShowReply] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showComments, setShowComments] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const handleSaveEdit = async (commentId) => {
    try {
      const res = await apiRequest({
        url: `/posts/edit-comment/${commentId}`,
        method: "PATCH",
        data: { comment: editedCommentText, user: { userId: user?._id } },
        token: user?.token,
      });
      if (res?.status === "success") {
        toast.success("Comment updated");
        setComments((prev) => prev.map((c) => c._id === commentId ? { ...c, comment: editedCommentText } : c));
        setEditingCommentId(null);
        setEditedCommentText("");
      } else toast.error("Failed to update comment");
    } catch (error) {
      toast.error("Error updating comment");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await apiRequest({ url: `/posts/delete-comment/${commentId}`, method: "DELETE", token: user?.token });
      if (res?.status === "success") {
        toast.success("Comment deleted");
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const getComments = async (id) => {
    setReplyComments(0);
    const result = await getPostComments(id);
    setComments(result);
    setLoading(false);
  };

  const handleLike = async (uri) => {
    await likePost(uri);
    await getComments(post?._id);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden mb-3">
      {/* Post Header */}
      <div className="flex gap-3 items-center p-4 pb-3">
        <Link to={"/profile/" + post?.userId?._id}>
          <img src={post?.userId?.profileUrl ?? NoProfile} alt={post?.userId?.firstName}
            className="w-12 h-12 object-cover rounded-full border-2 border-white/20" />
        </Link>
        <div className="flex-1">
          <Link to={"/profile/" + post?.userId?._id}>
            <p className="font-semibold text-ascent-1 hover:text-blue transition">
              {post?.userId?.firstName} {post?.userId?.lastName}
            </p>
          </Link>
          <div className="flex items-center gap-2 text-xs text-ascent-2">
            <span>{post?.userId?.location}</span>
            {post?.userId?.location && <span>·</span>}
            <span>{moment(post?.createdAt ?? "2023-05-25").fromNow()}</span>
          </div>
        </div>
        {user?._id === post?.userId?._id && (
          <button onClick={() => deletePost(post?._id)}
            className="p-2 rounded-full hover:bg-red-500/20 text-ascent-2 hover:text-red-400 transition">
            <MdOutlineDeleteOutline size={18} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-ascent-2 text-sm leading-relaxed">
          {showAll === post?._id ? post?.description : post?.description.slice(0, 300)}
          {post?.description?.length > 300 && (
            showAll === post?._id ? (
              <span className="text-blue ml-2 cursor-pointer font-medium" onClick={() => setShowAll(0)}>Show Less</span>
            ) : (
              <span className="text-blue ml-2 cursor-pointer font-medium" onClick={() => setShowAll(post?._id)}>...Show More</span>
            )
          )}
        </p>
        {post?.image && (
          <img src={post?.image} alt="post" className="w-full mt-3 rounded-xl object-cover max-h-96" />
        )}
      </div>

      {/* Like / Comment counts */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-ascent-2 border-b border-white/15">
        <span>{post?.likes?.length} likes</span>
        <span>{post?.comments?.length} comments</span>
      </div>

      {/* Action Buttons — LinkedIn style */}
      <div className="px-2 py-1 flex items-center justify-around border-b border-white/15">
        <button
          onClick={() => handleLike("/posts/like/" + post?._id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-white/15 ${post?.likes?.includes(user?._id) ? "text-blue" : "text-ascent-2"}`}
        >
          {post?.likes?.includes(user?._id) ? <BiSolidLike size={20} /> : <BiLike size={20} />}
          <span className="hidden sm:block">Like</span>
        </button>

        <button
          onClick={() => { setShowComments(showComments === post._id ? null : post._id); getComments(post?._id); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-ascent-2 hover:bg-white/15 transition"
        >
          <BiComment size={20} />
          <span className="hidden sm:block">Comment</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-ascent-2 hover:bg-white/15 transition">
          <BiShare size={20} />
          <span className="hidden sm:block">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments === post?._id && (
        <div className="px-4 pt-3">
          <CommentForm user={user} id={post?._id} getComments={() => getComments(post?._id)} />

          {loading ? <Loading /> : comments?.length > 0 ? (
            comments?.map((comment) => (
              <div className="w-full py-3 border-b border-white/10" key={comment?._id}>
                <div className="flex gap-3 items-start">
                  <Link to={"/profile/" + comment?.userId?._id}>
                    <img src={comment?.userId?.profileUrl ?? NoProfile} alt={comment?.userId?.firstName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white/20 mt-0.5" />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-white/10 rounded-2xl px-3 py-2">
                      <Link to={"/profile/" + comment?.userId?._id}>
                        <p className="font-medium text-sm text-ascent-1">{comment?.userId?.firstName} {comment?.userId?.lastName}</p>
                      </Link>
                      {editingCommentId === comment?._id ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <input
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-ascent-1 outline-none focus:border-blue"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(comment?._id)}
                              className="text-xs bg-blue text-white px-3 py-1 rounded-full hover:opacity-90">Save</button>
                            <button onClick={() => setEditingCommentId(null)}
                              className="text-xs text-red-400 border border-red-400/40 px-3 py-1 rounded-full hover:bg-red-400/10">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-ascent-2 text-sm mt-0.5">{comment?.comment}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-2">
                      <span className="text-xs text-ascent-2">{moment(comment?.createdAt ?? "2023-05-25").fromNow()}</span>
                      <button
                        className={`flex items-center gap-1 text-xs font-medium transition ${comment?.likes?.includes(user?._id) ? "text-blue" : "text-ascent-2 hover:text-blue"}`}
                        onClick={() => handleLike("/posts/like-comment/" + comment?._id)}
                      >
                        {comment?.likes?.includes(user?._id) ? <BiSolidLike size={14} /> : <BiLike size={14} />}
                        Like {comment?.likes?.length > 0 && `· ${comment?.likes?.length}`}
                      </button>
                      <button className="text-xs font-medium text-ascent-2 hover:text-blue transition"
                        onClick={() => setReplyComments(comment?._id)}>Reply</button>
                      {user?._id === comment?.userId?._id && (
                        <>
                          <button className="text-xs text-blue hover:opacity-80"
                            onClick={() => { setEditingCommentId(comment?._id); setEditedCommentText(comment?.comment); }}>Edit</button>
                          <button onClick={() => handleDelete(comment?._id)}>
                            <MdDeleteForever size={15} className="text-red-400 hover:opacity-80" />
                          </button>
                        </>
                      )}
                    </div>

                    {replyComments === comment?._id && (
                      <div className="mt-2 ml-2">
                        <CommentForm user={user} id={comment?._id} replyAt={comment?.from} getComments={() => getComments(post?._id)} />
                      </div>
                    )}

                    {comment?.replies?.length > 0 && (
                      <div className="mt-2 ml-2">
                        <button className="text-xs text-blue font-medium"
                          onClick={() => setShowReply(showReply === comment?.replies?._id ? 0 : comment?.replies?._id)}>
                          Show Replies ({comment?.replies?.length})
                        </button>
                        {showReply === comment?.replies?._id && comment?.replies.map((reply) => (
                          <ReplyCard reply={reply} user={user} key={reply?._id}
                            handleLike={() => handleLike("/posts/like-comment/" + comment?._id + "/" + reply?._id)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ascent-2 text-center py-4">No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;