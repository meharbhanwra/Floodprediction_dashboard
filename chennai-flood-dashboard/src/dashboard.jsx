// src/Dashboard.jsx
import React from "react";
import "leaflet/dist/leaflet.css"; // Leaflet CSS

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h1>Chennai Flood Dashboard</h1>
      <div id="map" style={{ height: "500px", width: "100%" }}>
        {/* You can render your MapDisplay component here */}
      </div>
    </div>
  );
}

export default Dashboard;
