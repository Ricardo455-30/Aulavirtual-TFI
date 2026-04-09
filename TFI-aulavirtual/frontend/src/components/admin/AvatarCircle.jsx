import React from "react";

const AvatarCircle = ({ name = "" }) => {
  const iniciales = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: 45,
        height: 45,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "14px",
      }}
    >
      {iniciales || "U"}
    </div>
  );
};

export default AvatarCircle;