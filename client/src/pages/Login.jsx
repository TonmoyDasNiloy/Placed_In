import React, { useState } from "react";
import { MdOutlineGroups } from "react-icons/md";
import { ImConnection } from "react-icons/im";
import { BsShare } from "react-icons/bs";
import { AiOutlineInteraction } from "react-icons/ai";
import { CustomButton, Loading, TextInput } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils";
import { useDispatch } from "react-redux";
import { UserLogin } from "../redux/userSlice";

const Login = () => {
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");
    try {
      const res = await apiRequest({ url: "/auth/login", data, method: "POST" });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        dispatch(UserLogin({ token: res?.token, ...res?.user }));
        window.location.replace("/");
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-bgColor flex items-center justify-center p-6">
      <div className="w-full md:w-2/3 lg:h-[85vh] flex rounded-2xl overflow-hidden shadow-2xl glass">
        {/* LEFT — Form */}
        <div className="w-full lg:w-1/2 h-full p-10 2xl:px-16 flex flex-col justify-center">
          <div className="flex gap-2 items-center mb-8">
            <div className="p-2 bg-blue rounded-xl text-white shadow-lg">
              <MdOutlineGroups size={22} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">
              BRACU Connect
            </span>
          </div>

          <h2 className="text-2xl font-bold text-ascent-1 mb-1">Welcome back</h2>
          <p className="text-sm text-ascent-2 mb-6">Sign in to your account to continue</p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              name="email" label="Email Address" placeholder="email@example.com"
              type="email" styles="w-full rounded-xl"
              register={register("email", { required: "Email Address is required!" })}
              error={errors.email ? errors.email.message : ""}
            />
            <TextInput
              name="password" label="Password" placeholder="Password"
              type="password" styles="w-full rounded-xl"
              register={register("password", { required: "Password is required!" })}
              error={errors.password ? errors.password?.message : ""}
            />

            <Link to="/reset-password" className="text-sm text-right text-blue font-medium hover:underline">
              Forgot Password?
            </Link>

            {errMsg?.message && (
              <span className={`text-sm ${errMsg?.status === "failed" ? "text-red-500" : "text-green-500"}`}>
                {errMsg?.message}
              </span>
            )}

            {isSubmitting ? <Loading /> : (
              <CustomButton type="submit"
                containerStyles="w-full justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] py-3 text-sm font-semibold text-white hover:opacity-90 transition shadow-lg"
                title="Sign In" />
            )}
          </form>

          <p className="text-ascent-2 text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue font-semibold ml-1 hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* RIGHT — Branding */}
        <div className="hidden lg:flex w-1/2 h-full flex-col items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />

          <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-xl">
              <MdOutlineGroups size={48} className="text-white" />
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: <ImConnection />, label: "Connect with peers" },
                { icon: <BsShare />, label: "Share your thoughts" },
                { icon: <AiOutlineInteraction />, label: "Engage & Interact" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/15 backdrop-blur px-5 py-2.5 rounded-full border border-white/20 text-white text-sm">
                  {icon} <span>{label}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-white font-semibold text-lg">BRACU Connect</p>
              <p className="text-white/70 text-sm mt-1">Your campus social network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;