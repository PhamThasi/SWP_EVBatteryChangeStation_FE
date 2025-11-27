import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AccountMng.css";
import { notifySuccess, notifyError } from "../../components/notification/notification";

const BatteryManagement = () => {
  const [batteries, setBatteries] = useState([]);
  const [filteredBatteries, setFilteredBatteries] = useState([]);
  const [stations, setStations] = useState([]);
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
        setStations(stationsData);
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

      // Merge address into batteries và chỉ giữ pin còn hoạt động
      const merged = batteriesData
        .map((b) => ({
          ...b,
          stationAddress: stationMap[b.stationId] || "Unknown",
        }))
        // .filter((b) => b.status === true)
        ;

        // ---------- ADD ID ASSIGNMENT HERE ----------
        setIdMap((prevMap) => {
          const newMap = { ...prevMap };
          let nextId = Object.keys(newMap).length + 1;

          merged.forEach((b) => {
            if (!newMap[b.batteryId]) {
              newMap[b.batteryId] = nextId++;
            }
          });

          return newMap;
        });

      // Sắp xếp mới nhất lên đầu (ưu tiên batterySwapDate, nếu không có thì dùng createDate)
      const sortedBatteries = merged.sort((a, b) => {
        const dateA = a.batterySwapDate 
          ? new Date(a.batterySwapDate).getTime() 
          : (a.createDate ? new Date(a.createDate).getTime() : 0);
        const dateB = b.batterySwapDate 
          ? new Date(b.batterySwapDate).getTime() 
          : (b.createDate ? new Date(b.createDate).getTime() : 0);
        return dateB - dateA; // Mới nhất lên đầu (giảm dần)
      });

      setBatteries(sortedBatteries);
      setFilteredBatteries(sortedBatteries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  // Filter batteries by address và áp dụng sort
  useEffect(() => {
    let result = batteries.filter((b) =>
      b.stationAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Áp dụng sort dựa trên sortOption
    if (sortOption) {
      switch (sortOption) {
        case "percentUseDesc":
          result.sort((a, b) => b.percentUse - a.percentUse);
          break;
        case "percentUseAsc":
          result.sort((a, b) => a.percentUse - b.percentUse);
          break;
        case "batterySwapDateDesc":
          result.sort(
            (a, b) => new Date(b.batterySwapDate || 0) - new Date(a.batterySwapDate || 0)
          );
          break;
        case "batterySwapDateAsc":
          result.sort(
            (a, b) => new Date(a.batterySwapDate || 0) - new Date(b.batterySwapDate || 0)
          );
          break;
        default:
          break;
      }
    } else {
      // Mặc định: sắp xếp mới nhất lên đầu
      result.sort((a, b) => {
        const dateA = a.batterySwapDate 
          ? new Date(a.batterySwapDate).getTime() 
          : (a.createDate ? new Date(a.createDate).getTime() : 0);
        const dateB = b.batterySwapDate 
          ? new Date(b.batterySwapDate).getTime() 
          : (b.createDate ? new Date(b.createDate).getTime() : 0);
        return dateB - dateA; // Mới nhất lên đầu
      });
    }
    
    setFilteredBatteries(result);
  }, [searchTerm, batteries, sortOption]);

  // Sort batteries - chỉ cập nhật sortOption, useEffect sẽ xử lý sort
  const handleSort = (option) => {
    setSortOption(option);
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
        stateOfHealth: 100,
        percentUse: 0,
        typeBattery: "Solid-state",
        insuranceDate: "",
        stationId: "",
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
        notifySuccess("Cập nhật pin thành công!");
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
        notifySuccess("Tạo pin thành công!");
      }

      closeModal();
      await fetchBatteries();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      notifyError(editingBattery ? "Cập nhật pin thất bại: " + errorMessage : "Tạo pin thất bại: " + errorMessage);
    }
  };

  const handleDelete = async (batteryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa pin này?")) return;
    try {
      await axios.delete(`${BASE_URL}/SoftDelete?batteryId=${batteryId}`);
      await fetchBatteries();
      notifySuccess("Xóa pin thành công!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      notifyError("Xóa pin thất bại: " + errorMessage);
    }
  };


  if (loading) return <p>Đang tải danh sách pin...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Quản lý pin</h1>

      {/* Toolbar */}
      <div className="dashboard-card" style={{ display: "flex", justifyContent: "space-between" }}>
        <input
          type="text"
          placeholder="Tìm theo địa chỉ trạm..."
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
          <button className="save-btn" onClick={() => openModal()}>
            + Thêm pin
          </button>
        </div>
      </div>

      {/* Battery Table */}
      <div className="dashboard-card">        
        {filteredBatteries.length === 0 ? (
          <p>Không tìm thấy pin phù hợp.</p>
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
                <th>Địa chỉ trạm</th>
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
                  <td>{battery.stationAddress}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="batupdate-btn"
                      
                      onClick={() => openModal(battery)}
                    >
                      Cập nhật
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(battery.batteryId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen  && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingBattery ? "Cập nhật pin" : "Thêm pin"}</h2>
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
              <label>Trạm</label>
              <select
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn trạm</option>
                {stations.map((s) => (
                  <option key={s.stationId} value={s.stationId}>
                    {s.address}
                  </option>
                ))}
              </select>
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

export default BatteryManagement;
