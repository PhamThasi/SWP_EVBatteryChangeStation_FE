import React, { useEffect, useState } from "react";
import batteryService from "../../api/batteryService";
import axiosClient from "../../api/axiosClient";
import { notifySuccess, notifyError } from "../../components/notification/notification";
import "../components/AccountMng.css";

const StaffBatteryManagement = () => {
  const [batteries, setBatteries] = useState([]);
  const [filteredBatteries, setFilteredBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBattery, setEditingBattery] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [idMap, setIdMap] = useState({});
  const [formData, setFormData] = useState({
    capacity: 0,
    status: true,
    stateOfHealth: 100,
    percentUse: 0,
    typeBattery: "Solid-state",
    insuranceDate: "",
    batterySwapDate: "",
    lastUsed: "",
  });

  // Fetch batteries của station mà staff đang làm việc
  const fetchBatteries = async () => {
    setLoading(true);
    try {
      const response = await batteryService.getMyStationBatteries();
      // Đảm bảo batteriesData luôn là array
      const batteriesData = Array.isArray(response) ? response : [];

      // Gán ID hiển thị
      setIdMap((prevMap) => {
        const newMap = { ...prevMap };
        let nextId = Object.keys(newMap).length + 1;

        batteriesData.forEach((b) => {
          if (!newMap[b.batteryId]) {
            newMap[b.batteryId] = nextId++;
          }
        });

        return newMap;
      });

      setBatteries(batteriesData);
      setFilteredBatteries(batteriesData);
    } catch (err) {
      console.error("Fetch batteries error:", err);
      setError(err.message || "Không thể tải danh sách pin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  // Filter batteries by type
  useEffect(() => {
    const result = batteries.filter((b) =>
      (b.typeBattery || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        status: battery.status,
        stateOfHealth: battery.stateOfHealth || 100,
        percentUse: battery.percentUse || 0,
        typeBattery: battery.typeBattery || "Solid-state",
        insuranceDate: battery.insuranceDate
          ? battery.insuranceDate.split("T")[0]
          : "",
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
        stateOfHealth: 100,
        percentUse: 0,
        typeBattery: "Solid-state",
        insuranceDate: "",
        batterySwapDate: "",
        lastUsed: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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
        // Update battery - giữ nguyên stationId của battery
        await axiosClient.put("/Battery/UpdateBattery", {
          batteryId: editingBattery.batteryId,
          capacity: formData.capacity,
          lastUsed: formData.lastUsed || new Date().toISOString(),
          status: formData.status,
          stateOfHealth: formData.stateOfHealth,
          percentUse: formData.percentUse,
          typeBattery: formData.typeBattery,
          batterySwapDate: formData.batterySwapDate || new Date().toISOString(),
          insuranceDate: formData.insuranceDate,
          stationId: editingBattery.stationId, // Giữ nguyên stationId
        });
        notifySuccess("Cập nhật pin thành công!");
      } else {
        // Create battery - backend sẽ tự gán stationId của staff
        await axiosClient.post("/Battery/staff/create-battery", {
          capacity: formData.capacity,
          status: formData.status,
          stateOfHealth: formData.stateOfHealth,
          percentUse: formData.percentUse,
          typeBattery: formData.typeBattery,
          insuranceDate: formData.insuranceDate,
        });
        notifySuccess("Thêm pin thành công!");
      }

      closeModal();
      await fetchBatteries();
    } catch (err) {
      notifyError(err.response?.data?.message || "Lưu pin thất bại!");
    }
  };

  if (loading) return <p>Đang tải danh sách pin của trạm...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Quản lý pin của trạm</h1>

      {/* Toolbar */}
      <div className="dashboard-card" style={{ display: "flex", justifyContent: "space-between" }}>
        <input
          type="text"
          placeholder="Tìm theo loại pin..."
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
            <option value="">Sắp xếp theo</option>
            <option value="percentUseDesc">% sử dụng (Cao → Thấp)</option>
            <option value="percentUseAsc">% sử dụng (Thấp → Cao)</option>
            <option value="batterySwapDateDesc">Ngày đổi pin (Mới → Cũ)</option>
            <option value="batterySwapDateAsc">Ngày đổi pin (Cũ → Mới)</option>
          </select>
        </div>
      </div>

      {/* Battery Table */}
      <div className="dashboard-card">
        {filteredBatteries.length === 0 ? (
          <p>Không tìm thấy pin trong trạm của bạn.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Mã Pin</th>
                <th>Loại pin</th>
                <th>Dung lượng</th>
                <th>Trạng thái</th>
                <th>Độ bền</th>
                <th>% sử dụng</th>
                <th>Lần dùng cuối</th>
                <th>Ngày đổi pin</th>
                <th>Ngày bảo hiểm</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatteries.map((battery) => (
                <tr key={battery.batteryId}>
                  <td>{idMap[battery.batteryId]}</td>
                  <td>{battery.typeBattery}</td>
                  <td>{battery.capacity}</td>
                  <td>{battery.status ? "Đang dùng" : "Ngưng"}</td>
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
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="batupdate-btn"
                      onClick={() => openModal(battery)}
                    >
                      Cập nhật
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
            <h2>{editingBattery ? "Cập nhật pin" : "Thêm pin mới"}</h2>
            <form className="modal-form">
              <label>Dung lượng (kWh)</label>
              <input
                type="number"
                name="capacity"
                placeholder="Dung lượng"
                value={formData.capacity}
                onChange={handleChange}
              />
              <label>Độ bền (%)</label>
              <input
                type="number"
                name="stateOfHealth"
                placeholder="Độ bền (%)"
                value={formData.stateOfHealth}
                onChange={handleChange}
              />
              <label>% sử dụng</label>
              <input
                type="number"
                name="percentUse"
                placeholder="% sử dụng"
                value={formData.percentUse}
                onChange={handleChange}
              />
              <label>Loại pin</label>
              <select
                name="typeBattery"
                value={formData.typeBattery}
                onChange={handleChange}
              >
                <option value="Solid-state">Solid-state</option>
                <option value="Lithium-ion">Lithium-ion</option>
              </select>
              <label>Ngày bảo hiểm</label>
              <input
                type="date"
                name="insuranceDate"
                placeholder="Ngày bảo hiểm"
                value={formData.insuranceDate}
                onChange={handleChange}
              />
              {editingBattery && (
                <>
                  <label>Lần dùng cuối</label>
                  <input
                    type="date"
                    name="lastUsed"
                    placeholder="Lần dùng cuối"
                    value={formData.lastUsed}
                    onChange={handleChange}
                  />
                  <label>Ngày đổi pin</label>
                  <input
                    type="date"
                    name="batterySwapDate"
                    placeholder="Ngày đổi pin"
                    value={formData.batterySwapDate}
                    onChange={handleChange}
                  />
                </>
              )}
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="true">Đang dùng</option>
                <option value="false">Ngưng</option>
              </select>
            </form>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Lưu
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBatteryManagement;

