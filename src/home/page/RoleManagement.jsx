import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AdminStyle.css"; // reuse same style

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5204/api/Role/GetAll")
      .then((res) => {
        if (res.data && res.data.data) setRoles(res.data.data);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  }, []);

  return (
    <div className="home-frame">
      <h1>Role Management</h1>

      <div className="inventory-section">
        <h2>Role List</h2>
        <table>
          <thead>
            <tr>
              <th>Role ID</th>
              <th>Role Name</th>
              <th>Status</th>
              <th>Create Date</th>
              <th>Update Date</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.roleId}>
                <td>{role.roleId}</td>
                <td>{role.roleName}</td>
                <td>{role.status ? "Active" : "Inactive"}</td>
                <td>{new Date(role.createDate).toLocaleString()}</td>
                <td>{role.updateDate ? new Date(role.updateDate).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;
