import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AccountMng.css";

const BatteryManagement = () => {
  const [batteries, setBatteries] = useState([]);
  const [filteredBatteries, setFilteredBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBattery, setEditingBattery] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [formData, setFormData] = useState({
    capacity: 0,
    status: true,
    stateOfHealth: 0,
    percentUse: 0,
    typeBattery: "",
    insuranceDate: "",
    stationId: "",
    batterySwapDate: "",
    lastUsed: "",
  });

  const BASE_URL = "http://localhost:5204/api/Battery";

  // Fetch all batteries with station address
  const fetchBatteries = async () => {
    setLoading(true);
    try {
      const batteryRes = await axios.get(`${BASE_URL}/GetAllBattery`);
      const batteriesData = batteryRes.data?.data || [];

      // Fetch stations
      let stationsData = [];
      try {
        const stationRes = await axios.get(
          "http://localhost:5204/api/Station/SelectAll"
        );
        stationsData = stationRes.data?.data || [];
      } catch (e) {
        console.warn("Station fetch failed:", e.message);
      }

      // Map stationId → address
      const stationMap = Array.isArray(stationsData)
        ? stationsData.reduce((acc, s) => {
            acc[s.stationId] = s.address;
            return acc;
          }, {})
        : {};

      // Merge address into batteries
      const merged = batteriesData.map((b) => ({
        ...b,
        stationAddress: stationMap[b.stationId] || "Unknown",
      }));

      setBatteries(merged);
      setFilteredBatteries(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  // Filter batteries by address
  useEffect(() => {
    const result = batteries.filter((b) =>
      b.stationAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBatteries(result);
  }, [searchTerm, batteries]);

  // Sort batteries
  const handleSort = (option) => {
  setSortOption(option);
  let sorted = [...filteredBatteries];

  switch (option) {
    case "percentUseDesc":
      sorted.sort((a, b) => b.percentUse - a.percentUse);
      break;

    case "percentUseAsc":
      sorted.sort((a, b) => a.percentUse - b.percentUse);
      break;

    case "batterySwapDateDesc":
      sorted.sort(
        (a, b) => new Date(b.batterySwapDate || 0) - new Date(a.batterySwapDate || 0)
      );
      break;

    case "batterySwapDateAsc":
      sorted.sort(
        (a, b) => new Date(a.batterySwapDate || 0) - new Date(b.batterySwapDate || 0)
      );
      break;

    default:
      break;
  }

  setFilteredBatteries(sorted);
};


  // Open modal for add/update
  const openModal = (battery = null) => {
    if (battery) {
      setEditingBattery(battery);
      setFormData({
        capacity: battery.capacity || 0,
        status: battery.status ?? true,
        stateOfHealth: battery.stateOfHealth || 0,
        percentUse: battery.percentUse || 0,
        typeBattery: battery.typeBattery || "",
        insuranceDate: battery.insuranceDate
          ? battery.insuranceDate.split("T")[0]
          : "",
        stationId: battery.stationId || "",
        batterySwapDate: battery.batterySwapDate
          ? battery.batterySwapDate.split("T")[0]
          : "",
        lastUsed: battery.lastUsed ? battery.lastUsed.split("T")[0] : "",
      });
    } else {
      setEditingBattery(null);
      setFormData({
        capacity: 0,
        status: true,
        stateOfHealth: 0,
        percentUse: 0,
        typeBattery: "",
        insuranceDate: "",
        stationId: "",
        batterySwapDate: "",
        lastUsed: "",
      });
    }
  };

  const closeModal = () => setEditingBattery(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "status"
          ? value === "true"
          : ["capacity", "stateOfHealth", "percentUse"].includes(name)
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      if (editingBattery) {
        await axios.put(`${BASE_URL}/UpdateBattery`, {
          batteryId: editingBattery.batteryId,
          capacity: formData.capacity,
          lastUsed: formData.lastUsed || new Date().toISOString(),
          status: formData.status,
          stateOfHealth: formData.stateOfHealth,
          percentUse: formData.percentUse,
          typeBattery: formData.typeBattery,
          batterySwapDate:
            formData.batterySwapDate || new Date().toISOString(),
          insuranceDate: formData.insuranceDate,
          stationId: formData.stationId,
        });
      } else {
        await axios.post(`${BASE_URL}/CreateBattery`, {
          capacity: formData.capacity,
          status: formData.status,
          stateOfHealth: formData.stateOfHealth,
          percentUse: formData.percentUse,
          typeBattery: formData.typeBattery,
          insuranceDate: formData.insuranceDate,
          stationId: formData.stationId,
        });
      }

      closeModal();
      await fetchBatteries();
    } catch (err) {
      alert("Failed to save battery: " + err.message);
    }
  };

  const handleDelete = async (batteryId) => {
    if (!window.confirm("Are you sure you want to delete this battery?")) return;
    try {
      await axios.delete(`${BASE_URL}/SoftDelete?batteryId=${batteryId}`);
      await fetchBatteries();
    } catch (err) {
      alert("Failed to delete battery: " + err.message);
    }
  };

  if (loading) return <p>Loading batteries...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Battery Management</h1>

      {/* Toolbar */}
      <div className="dashboard-card" style={{ display: "flex", justifyContent: "space-between" }}>
        <input
          type="text"
          placeholder="Search by station address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "6px", width: "250px" }}
        />
        <div>
          <select
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
            style={{ marginRight: "1rem", padding: "6px" }}
          >
            <option value="">Sort By</option>
            <option value="percentUseDesc">Percent Use (High → Low)</option>
            <option value="percentUseAsc">Percent Use (Low → High)</option>
            <option value="batterySwapDateDesc">Battery Swap Date (Newest → Oldest)</option>
            <option value="batterySwapDateAsc">Battery Swap Date (Oldest → Newest)</option>
          </select>
          <button className="save-btn" onClick={() => openModal()}>
            + Add Battery
          </button>
        </div>
      </div>

      {/* Battery Table */}
      <div className="dashboard-card">        
        {filteredBatteries.length === 0 ? (
          <p>No batteries found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>State of Health</th>
                <th>Percent Use</th>
                <th>Last Used</th>
                <th>Battery Swap Date</th>
                <th>Insurance Date</th>
                <th>Station Address</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatteries.map((battery) => (
                <tr key={battery.batteryId}>
                  <td>{battery.typeBattery}</td>
                  <td>{battery.capacity}</td>
                  <td>{battery.status ? "true" : "false"}</td>
                  <td>{battery.stateOfHealth}%</td>
                  <td>{battery.percentUse}%</td>
                  <td>
                    {battery.lastUsed
                      ? new Date(battery.lastUsed).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {battery.batterySwapDate
                      ? new Date(battery.batterySwapDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{battery.insuranceDate || "-"}</td>
                  <td>{battery.stationAddress}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="batupdate-btn"
                      
                      onClick={() => openModal(battery)}
                    >
                      Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(battery.batteryId)}
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
      {editingBattery !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingBattery ? "Update Battery" : "Add Battery"}</h2>
            <form className="modal-form">
              <label>Capacity (kWh)</label>
              <input 
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleChange}
              />
              <label>State of Health (%)</label>
              <input
                type="number"
                name="stateOfHealth"
                placeholder="State of Health (%)"
                value={formData.stateOfHealth}
                onChange={handleChange}
              />
              <label>Percent Use (%)</label>
              <input
                type="number"
                name="percentUse"
                placeholder="Percent Use (%)"
                value={formData.percentUse}
                onChange={handleChange}
              />
              <label>Type Battery</label>
              <input
                type="text"
                name="typeBattery"
                placeholder="Type Battery"
                value={formData.typeBattery}
                onChange={handleChange}
              />
              <label>Insurance Date</label>
              <input
                type="date"
                name="insuranceDate"
                placeholder="Insurance Date"
                value={formData.insuranceDate}
                onChange={handleChange}
              />
              <label>Station ID</label>
              <input
                type="text"
                name="stationId"
                placeholder="Station ID"
                value={formData.stationId}
                onChange={handleChange}
              />
              {editingBattery && (
                <>
                 <label>Last Used</label>
                  <input
                    type="date"
                    name="lastUsed"
                    placeholder="Last Used"
                    value={formData.lastUsed}
                    onChange={handleChange}
                  />
                  <label>Battery Swap Date</label>
                  <input
                    type="date"
                    name="batterySwapDate"
                    placeholder="Battery Swap Date"
                    value={formData.batterySwapDate}
                    onChange={handleChange}
                  />
                </>
              )}
              <label>Status</label>
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

export default BatteryManagement;
