import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AdminStyle.css";

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    address: "",
    phoneNumber: "",
    status: true,
    accountName: "",
    batteryQuantity: 0,
  });

  const BASE_URL = "http://localhost:5204/api/Station";

  // Fetch all stations
  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/SelectAll`);
      setStations(res.data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Open modal (add or update)
  const openModal = (station = null) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        address: station.address || "",
        phoneNumber: station.phoneNumber || "",
        status: station.status ?? true,
        accountName: station.accountName || "",
        batteryQuantity: station.batteryQuantity || 0,
      });
    } else {
      setEditingStation(null);
      setFormData({
        address: "",
        phoneNumber: "",
        status: true,
        accountName: "",
        batteryQuantity: 0,
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setEditingStation(null);
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "status"
          ? value === "true"
          : name === "batteryQuantity"
          ? parseInt(value) || 0
          : value,
    }));
  };

  // Save (Add or Update)
  const handleSave = async () => {
    const url = editingStation ? `${BASE_URL}/Update` : `${BASE_URL}/Create`;

    try {
      await axios.post(url, {
        stationId: editingStation?.stationId,
        ...formData,
      });
      closeModal();
      await fetchStations(); // Refresh table
    } catch (err) {
      alert("Failed to save station: " + err.message);
    }
  };
  const handleDelete = async (stationId) => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;
    try {
      await axios.delete(`${BASE_URL}/Delete?stationId=${stationId}`);
      await fetchStations();
    } catch (err) {
      alert("Failed to delete battery: " + err.message);
    }
  };

  if (loading) return <p>Loading stations...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Station Management</h1>

      {/* Toolbar */}
      <div
        className="dashboard-card"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <button className="save-btn" onClick={() => openModal()}>
          + Add Station
        </button>
      </div>

      {/* Station Table */}
      <div className="dashboard-card">
        <h2>Station List</h2>
        {stations.length === 0 ? (
          <p>No stations found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Account Name</th>
                <th>Battery Quantity</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.stationId}>
                  <td>{station.address}</td>
                  <td>{station.phoneNumber}</td>
                  <td>{station.status ? "Active" : "Inactive"}</td>
                  <td>{station.accountName}</td>
                  <td>{station.batteryQuantity}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="batupdate-btn"
                      // style={{ marginRight: "0.2rem" }}
                      onClick={() => openModal(station)}
                    >
                      Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(station.stationId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {editingStation !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingStation ? "Update Station" : "Add Station"}</h2>
            <form className="modal-form">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="accountName"
                placeholder="Account Name"
                value={formData.accountName}
                onChange={handleChange}
              />
              <input
                type="number"
                name="batteryQuantity"
                placeholder="Battery Quantity"
                value={formData.batteryQuantity}
                onChange={handleChange}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </form>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationManagement;
