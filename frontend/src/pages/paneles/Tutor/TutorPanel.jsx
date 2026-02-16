// src/pages/tutor/TutorPanel.jsx
import React, { useState } from "react";
import TutorSidebar from "../../../components/tutor/TutorSidebar";
import Dashboard from "../../../components/tutor/Dashboard";
import MyChildren from "../../../components/tutor/MyChildren";
import "../../../css/tutor/tutorPanel.css";

const TutorPanel = () => {
  const [section, setSection] = useState("dashboard");

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <Dashboard />;
      case "myChildren":
        return <MyChildren />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="tutor-panel-container">
      <TutorSidebar setSection={setSection} activeSection={section} />
      <main className="tutor-main">{renderSection()}</main>
    </div>
  );
};

export default TutorPanel;
