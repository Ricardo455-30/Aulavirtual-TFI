import React from "react";
import "../../css/directivo/panelDirectivo.css";

const StatCard = ({ icon, title, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
