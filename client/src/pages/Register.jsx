import React, { useState } from "react";
import { MdOutlineGroups } from "react-icons/md";
import { ImConnection } from "react-icons/im";
import { BsShare } from "react-icons/bs";
import { AiOutlineInteraction } from "react-icons/ai";
import { CustomButton, Loading, TextInput } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils";

const Register = () => {
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest({ url: "/auth/register", data, method: "POST" });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        setErrMsg(res);
        setInterval(() => window.location.replace("/login"), 5000);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-bgColor flex items-center justify-center p-6">
      <div className="w-full md:w-2/3 lg:h-[90vh] flex flex-row-reverse rounded-2xl overflow-hidden shadow-2xl glass">
        {/* RIGHT — Form */}
        <div className="w-full lg:w-1/2 h-full px-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
          <div className="flex gap-2 items-center mb-6">
            <div className="p-2 bg-blue rounded-xl text-white shadow-lg">
              <MdOutlineGroups size={22} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">
              PlacedIn
            </span>
          </div>

          <h2 className="text-2xl font-bold text-ascent-1 mb-1">Create account</h2>
          <p className="text-sm text-ascent-2 mb-5">Join your professional network today</p>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-3">
              <TextInput name="firstName" label="First Name" placeholder="First Name" type="text" styles="w-full rounded-xl"
                register={register("firstName", { required: "First Name is required!" })}
                error={errors.firstName ? errors.firstName?.message : ""} />
              <TextInput label="Last Name" placeholder="Last Name" type="text" styles="w-full rounded-xl"
                register={register("lastName", { required: "Last Name is required!" })}
                error={errors.lastName ? errors.lastName?.message : ""} />
            </div>

            <TextInput name="email" label="Email Address" placeholder="email@example.com" type="email" styles="w-full rounded-xl"
              register={register("email", { required: "Email Address is required!" })}
              error={errors.email ? errors.email.message : ""} />

            <div className="flex gap-3">
              <TextInput name="password" label="Password" placeholder="Password" type="password" styles="w-full rounded-xl"
                register={register("password", { required: "Password is required!" })}
                error={errors.password ? errors.password?.message : ""} />
              <TextInput label="Confirm Password" placeholder="Confirm Password" type="password" styles="w-full rounded-xl"
                register={register("cPassword", {
                  validate: (value) => {
                    const { password } = getValues();
                    if (password !== value) return "Passwords do not match";
                  }
                })}
                error={errors.cPassword && errors.cPassword.type === "validate" ? errors.cPassword?.message : ""} />
            </div>

            {errMsg?.message && (
              <span className={`text-sm ${errMsg?.status === "failed" ? "text-red-500" : "text-green-500"}`}>
                {errMsg?.message}
              </span>
            )}

            {isSubmitting ? <Loading /> : (
              <CustomButton type="submit"
                containerStyles="w-full justify-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] py-3 text-sm font-semibold text-white hover:opacity-90 transition shadow-lg mt-3"
                title="Create Account" />
            )}
          </form>

          <p className="text-ascent-2 text-sm text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue font-semibold ml-1 hover:underline">Sign In</Link>
          </p>
        </div>

        {/* LEFT — Branding */}
        <div className="hidden lg:flex w-1/2 h-full flex-col items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />
          <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-xl">
              <MdOutlineGroups size={48} className="text-white" />
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: <ImConnection />, label: "Build your network" },
                { icon: <BsShare />, label: "Share experiences" },
                { icon: <AiOutlineInteraction />, label: "Engage with Professionals" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/15 backdrop-blur px-5 py-2.5 rounded-full border border-white/20 text-white text-sm">
                  {icon} <span>{label}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Join PlacedIn</p>
              <p className="text-white/70 text-sm mt-1">Your Network is Your NetWorth.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;