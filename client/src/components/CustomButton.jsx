import React from "react";

const CustomButton = ({ title, containerStyles, iconRight, type, onClick, style }) => {
  return (
    <button
      onClick={onClick}
      type={type || "button"}
      style={style}
      className={`inline-flex items-center text-base transition-all duration-200 ${containerStyles}`}
    >
      {title}
      {iconRight && <div className="ml-2">{iconRight}</div>}
    </button>
  );
};

export default CustomButton;