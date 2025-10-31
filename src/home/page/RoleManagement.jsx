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

  if (loading) return <p>Loading roles...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Role Management</h1>

      {/* Toolbar */}
      <div
        className="dashboard-card"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <button className="save-btn" onClick={() => openModal()}>
          + Add Role
        </button>
      </div>

      {/* Role Table */}
      <div className="dashboard-card">
        <h2>Role List</h2>

        {roles.length === 0 ? (
          <p>No roles found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Status</th>
                <th>Create Date</th>
                <th>Update Date</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.roleId}>
                  <td>{role.roleName}</td>
                  <td>{role.status ? "Active" : "Inactive"}</td>
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
                      Update
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
            <h2>{editingRole ? "Update Role" : "Add Role"}</h2>
            <form className="modal-form">
              <input
                type="text"
                name="roleName"
                placeholder="Role Name"
                value={formData.roleName}
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

export default RoleManagement;
