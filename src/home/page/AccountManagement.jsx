import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";

const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sortRole, setSortRole] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null); // also used for creating
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    accountName: "",
    gender: "",
    address: "",
    phoneNumber: "",
    dateOfBirth: "",
    status: true,
    roleId: "",
    stationId: "",
  });

  const BASE_URL = "http://localhost:5204/api/Account"; 
  const ROLE_URL = "http://localhost:5204/api/Role/GetAll";
  const STATION_URL = "http://localhost:5204/api/Station/SelectAll";

  // Fetch all accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/GetAll`);
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const result = await res.json();
      setAccounts(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
    try {
      const res = await fetch(ROLE_URL);
      const data = await res.json();
      setRoles(data.data || []);
    } catch (err) {
      console.error("Fetch roles failed:", err);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch(STATION_URL);
      const data = await res.json();
      setStations(data.data || []);
    } catch (err) {
      console.error("Fetch stations failed:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchRoles();
    fetchStations();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "status"
          ? value === "true"
          : value,
    }));
  };

  // Open modal for Add / Update
  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        fullName: account.fullName || "",
        accountName: account.accountName || "",
        gender: account.gender || "",
        address: account.address || "",
        phoneNumber: account.phoneNumber || "",
        dateOfBirth: account.dateOfBirth
          ? new Date(account.dateOfBirth).toISOString().split("T")[0]
          : "",
        status: account.status ?? true,
        roleId: account.roleId || "",
        stationId: account.stationId || "",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        fullName: "",
        accountName: "",
        gender: "",
        address: "",
        phoneNumber: "",
        dateOfBirth: "",
        status: true,
        roleId: "",
        stationId: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  // Save (Add or Update)
  const handleSave = async () => {
    const isUpdate = !!editingAccount;
    const url = isUpdate ? `${BASE_URL}/Update` : `${BASE_URL}/Create`;

    const payload = {
      ...formData,
      accountId: editingAccount?.accountId,
      email: isUpdate
        ? editingAccount.email
        : `${formData.accountName}@gmail.com`,
      password: isUpdate ? editingAccount.password : "default@123",
      createDate: new Date().toISOString(),
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save account");

      await fetchAccounts();
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete
  const handleDelete = async (accountId) => {
    if (!window.confirm("Confirm delete this account?")) return;
    try {
      const res = await fetch(`${BASE_URL}/SoftDelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      await fetchAccounts();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAccounts = accounts.filter((acc) =>
    acc.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Account Management</h1>

      {/* Toolbar */}
      <div
        className="dashboard-card"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Search by full name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            marginRight: "1rem",
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        />
        <button className="save-btn" onClick={() => openModal()}>
          + Add Account
        </button>
         <select
          value={sortRole}
          onChange={(e) => setSortRole(e.target.value)}
          style={{
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            backgroundColor: "white",
          }}
        >
          <option value="">Sort by Role</option>
          {roles.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
        </select>
      </div>

      {/* Accounts Table */}
      <div className="dashboard-card">
        {filteredAccounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Station</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => (
                <tr key={acc.accountId}>
                  <td>{acc.fullName}</td>
                  <td>{acc.gender}</td>
                  <td>{acc.address}</td>
                  <td>{acc.phoneNumber}</td>
                  <td>
                    {roles.find((r) => r.roleId === acc.roleId)?.roleName || "-"}
                  </td>
                  <td>
                    {stations.find((s) => s.stationId === acc.stationId)?.address ||
                      "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="update-btn"
                      // style={{ marginRight: "0.5rem" }}
                      onClick={() => openModal(acc)}
                    >
                      ✎
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(acc.accountId)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingAccount ? "Update Account" : "Add Account"}</h2>
            <form className="modal-form">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="accountName"
                placeholder="Username"
                value={formData.accountName}
                onChange={handleChange}
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Gender</option>
                <option value={'Male'}>Male</option>
                <option value={'Female'}>Female</option>
              </select>
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
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              {/* Role dropdown */}
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>

              {/* Station dropdown */}
              <select
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
              >
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.stationId} value={s.stationId}>
                    {s.address}
                  </option>
                ))}
              </select>

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

export default AccountManagement;
