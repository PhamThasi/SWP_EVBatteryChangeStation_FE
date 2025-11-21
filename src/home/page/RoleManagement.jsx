import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AdminStyle.css"; 


const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: "",
    status: true,
  });

  const BASE_URL = "http://localhost:5204/api/Role";

  // Fetch all roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/GetAll`);
      setRoles(res.data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Open modal (add or update)
  const openModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        roleName: role.roleName || "",
        status: role.status ?? true,
      });
    } else {
      setEditingRole(null);
      setFormData({
        roleName: "",
        status: true,
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setEditingRole(null);
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  // Save (add or update)
  const handleSave = async () => {
    const url = editingRole ? `${BASE_URL}/Update` : `${BASE_URL}/Create`;

    try {
      await axios.post(url, {
        roleId: editingRole?.roleId,
        ...formData,
      });
      closeModal();
      await fetchRoles(); // refresh table automatically
    } catch (err) {
      alert("Failed to save role: " + err.message);
    }
  };

  if (loading) return <p>Đang tải danh sách vai trò...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Quản lý vai trò</h1>

      {/* Toolbar */}
      <div
        className="dashboard-card"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <button className="save-btn" onClick={() => openModal()}>
          + Thêm vai trò
        </button>
      </div>

      {/* Role Table */}
      <div className="dashboard-card">
        <h2>Danh sách vai trò</h2>

        {roles.length === 0 ? (
          <p>Chưa có vai trò nào.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Tên vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Ngày cập nhật</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.roleId}>
                  <td>{role.roleName}</td>
                  <td>{role.status ? "Đang hoạt động" : "Ngừng kích hoạt"}</td>
                  <td>
                    {role.createDate
                      ? new Date(role.createDate).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    {role.updateDate
                      ? new Date(role.updateDate).toLocaleString()
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="save-btn"
                      style={{ marginRight: "0.5rem" }}
                      onClick={() => openModal(role)}
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {editingRole !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingRole ? "Cập nhật vai trò" : "Thêm vai trò"}</h2>
            <form className="modal-form">
              <input
                type="text"
                name="roleName"
                placeholder="Tên vai trò"
                value={formData.roleName}
                onChange={handleChange}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={true}>Đang hoạt động</option>
                <option value={false}>Ngừng kích hoạt</option>
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

export default RoleManagement;
