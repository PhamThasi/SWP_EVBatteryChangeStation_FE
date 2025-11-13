import React, { useCallback, useEffect, useState } from "react";
import { notifyError, notifySuccess } from "@/components/notification/notification";
import stationSevice from "@/api/stationService";
import batteryService from "@/api/batteryService";
import "../components/AdminStyle.css";

const StationManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStation, setEditingStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    phoneNumber: "",
    status: true,
    accountName: "",
  });
  const [batteryCounts, setBatteryCounts] = useState({});

  const extractMessage = useCallback(
    (error, fallback) =>
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      (typeof error?.response?.data === "string" ? error.response.data : "") ||
      error?.message ||
      fallback,
    []
  );

  const resolveMessage = useCallback((response, fallback) => {
    if (!response) return fallback;
    if (typeof response === "string") return response || fallback;
    return (
      response?.message ||
      response?.Message ||
      response?.data?.message ||
      response?.data?.Message ||
      fallback
    );
  }, []);

  // Fetch all stations và tính số pin động
  const fetchStations = useCallback(
    async (suppressError = false) => {
      setLoading(true);
      try {
        const data = await stationSevice.getStationList();
        setStations(data || []);

        // Tính số pin cho mỗi trạm
        const counts = {};
        for (const station of data || []) {
          try {
            const count = await batteryService.getBatteryCountByStationId(station.stationId);
            counts[station.stationId] = count;
          } catch (err) {
            console.warn(`Không thể đếm pin cho trạm ${station.stationId}:`, err);
            counts[station.stationId] = 0;
          }
        }
        setBatteryCounts(counts);
      } catch (err) {
        console.error("Fetch stations failed", {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
        if (!suppressError) {
          setError(err.message);
          notifyError(extractMessage(err, "Không thể tải danh sách trạm!"));
        }
      } finally {
        setLoading(false);
      }
    },
    [extractMessage]
  );

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Open modal (add or update)
  const openModal = (station = null) => {
    setIsModalOpen(true);
    if (station) {
      setEditingStation(station);
      setFormData({
        address: station.address || "",
        phoneNumber: station.phoneNumber || "",
        status: station.status ?? true,
        accountName: station.accountName || "",
      });
    } else {
      setEditingStation(null);
      setFormData({
        address: "",
        phoneNumber: "",
        status: true,
        accountName: "",
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setEditingStation(null);
    setIsModalOpen(false);
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  // Save (Add or Update)
  const handleSave = async () => {
    const payload = editingStation
      ? { stationId: editingStation.stationId, ...formData }
      : { ...formData };

    // Không gửi batteryQuantity vì nó được tính động từ BatteryManagement
    delete payload.batteryQuantity;

    try {
      const result = editingStation
        ? await stationSevice.updateStation(editingStation.stationId, payload)
        : await stationSevice.createStation(payload);

      notifySuccess(
        resolveMessage(
          result,
          editingStation ? "Cập nhật trạm thành công" : "Thêm trạm thành công"
        )
      );
    } catch (err) {
      console.error("Save station failed", {
        payload,
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      const message = extractMessage(
        err,
        editingStation ? "Cập nhật trạm thất bại!" : "Thêm trạm thất bại!"
      );
      notifyError(
        `${editingStation ? "Update" : "Create"} station: ${
          err?.response?.status ? `${err.response?.status} ` : ""
        }${message}`
      );
    } finally {
      // Even if server replied 400 but actually inserted, still refresh list
      closeModal();
      await fetchStations(true);
    }
  };
  const handleDelete = async (stationId) => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;
    try {
      const result = await stationSevice.deleteStation(stationId);
      notifySuccess(resolveMessage(result, "Xóa trạm thành công"));
      await fetchStations();
    } catch (err) {
      console.error("Delete station failed", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      notifyError(
        "Xóa trạm thất bại: " +
          (err?.response?.status ? `${err.response.status} ` : "") +
          extractMessage(err, err.message)
      );
    }
  };

  if (loading) return <p>Loading stations...</p>;

  return (
    <div className="admin-dashboard">
      {error && (
        <div className="dashboard-card" style={{ background: "#fff4f4", color: "#b00020", marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}
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
                  <td>{batteryCounts[station.stationId] ?? "Đang tải..."}</td>
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
      {isModalOpen && (
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
              <select
                name="status"
                value={formData.status ? "true" : "false"}
                onChange={handleChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
