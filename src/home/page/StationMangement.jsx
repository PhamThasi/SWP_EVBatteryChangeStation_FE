import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AdminStyle.css";

const StationManagement = () => {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5204/api/Station/SelectAll")
      .then((res) => {
        if (res.data && res.data.data) setStations(res.data.data);
      })
      .catch((err) => console.error("Error fetching stations:", err));
  }, []);

  return (
    <div className="home-frame">
      <h1>Station Management</h1>

      <div className="inventory-section">
        <h2>Station List</h2>
        <table>
          <thead>
            <tr>
              <th>Station ID</th>
              <th>Address</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Account Name</th>
              <th>Battery Quantity</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.stationId}>
                <td>{station.stationId}</td>
                <td>{station.address}</td>
                <td>{station.phoneNumber}</td>
                <td>{station.status ? "Active" : "Inactive"}</td>
                <td>{station.accountName}</td>
                <td>{station.batteryQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StationManagement;
