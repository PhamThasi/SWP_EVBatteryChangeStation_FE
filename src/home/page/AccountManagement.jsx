import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";
import authService from "../../api/authService";

const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sortRole, setSortRole] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null); // also used for creating
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    accountName: "",
    email: "",
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

      console.log(result);
      setAccounts(result.data || []);
      console.log(result);
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
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  // Open modal for Add / Update
  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        fullName: account.fullName || "",
        accountName: account.accountName || "",
        email: account.email || "",
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
        email: "",
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
    setFormErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  // Save (Add or Update)
  const handleSave = async () => {
    const isUpdate = !!editingAccount;
    // Basic validation for create
    if (!isUpdate) {
      const errors = {};
      if (!formData.accountName?.trim()) errors.accountName = "Username is required";
      if (!formData.fullName?.trim()) errors.fullName = "Full name is required";
      if (!formData.roleId) errors.roleId = "Role is required";
      if (!formData.stationId) errors.stationId = "Station is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = "Phone is required";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    } else {
      const errors = {};
      if (!formData.accountName?.trim()) errors.accountName = "Username is required";
      if (!formData.fullName?.trim()) errors.fullName = "Full name is required";
      if (!formData.roleId) errors.roleId = "Role is required";
      if (!formData.stationId) errors.stationId = "Station is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = "Phone is required";
      if (!formData.email?.trim()) errors.email = "Email is required";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }
    try {
      if (isUpdate) {
        // Centralized update via service; password included only if provided
        await authService.updateProfile({
          accountId: editingAccount?.accountId,
          roleId: formData.roleId,
          accountName: formData.accountName,
          fullName: formData.fullName,
          email: formData.email,
          gender: formData.gender,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth || null,
          stationId: formData.stationId || null,
          status: formData.status,
          password: formData.password || undefined,
        });
      } else {
        // Use service for create; it handles date formatting
        await authService.createAccount({
          roleId: formData.roleId,
          accountName: formData.accountName,
          password: "default@123",
          fullName: formData.fullName,
          email: `${formData.accountName}@gmail.com`,
          gender: formData.gender,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          createDate: new Date().toISOString(),
          dateOfBirth: formData.dateOfBirth || null,
          stationId: formData.stationId || null,
          status: formData.status,
        });
      }

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
      // Backend expects /Account/SoftDelete?encode=...
      await authService.softDeleteAccounts(accountId);
      await fetchAccounts();
      alert("Account deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAccounts = accounts
    .filter((acc) => acc.status === true)
    .filter((acc) => acc.accountName?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Account Management</h1>

      {/* Toolbar */}
      <div
        className="dashboard-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
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
            marginLeft: "8px",
          }}
        >
          <option value="">All</option>
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
              {filteredAccounts
                .filter((acc) => !sortRole || acc.roleId == sortRole)
                .map((acc) => {
                  const roleName =
                    roles.find((r) => r.roleId === acc.roleId)?.roleName || "-";
                  const stationName =
                    stations.find((s) => s.stationId === acc.stationId)
                      ?.stationName ||
                    stations.find((s) => s.stationId === acc.stationId)
                      ?.address ||
                    "-";
                  return (
                    <tr key={acc.accountId}>
                      <td>{acc.fullName}</td>
                      <td>{acc.gender}</td>
                      <td>{acc.address}</td>
                      <td>{acc.phoneNumber}</td>
                      <td>{roleName}</td>
                      <td>{stationName}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="update-btn"
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
                  );
                })}
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
              {/* Full Name */}
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {formErrors.fullName && <span className="field-error">{formErrors.fullName}</span>}

              {/* Username */}
              <label>Username *</label>
              <input
                type="text"
                name="accountName"
                placeholder="Enter username"
                value={formData.accountName}
                onChange={handleChange}
              />
              {formErrors.accountName && <span className="field-error">{formErrors.accountName}</span>}

              {/* Gender */}
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value={"Male"}>Male</option>
                <option value={"Female"}>Female</option>
              </select>
              {formErrors.gender && <span className="field-error">{formErrors.gender}</span>}

              {/* Address */}
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
              />

              {/* Phone */}
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {formErrors.phoneNumber && <span className="field-error">{formErrors.phoneNumber}</span>}

              {/* Date of birth */}
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              {/* Role dropdown */}
              <label>Role *</label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>
              {formErrors.roleId && <span className="field-error">{formErrors.roleId}</span>}

              {/* Station dropdown */}
              <label>Station *</label>
              <select
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
              >
                <option value="">Select station</option>
                {stations.map((s) => (
                  <option key={s.stationId} value={s.stationId}>
                    {s.address}
                  </option>
                ))}
              </select>
              {formErrors.stationId && <span className="field-error">{formErrors.stationId}</span>}

              {/* Email (auto) and Password (default) for create; Email/Password editable for update */}
              {!editingAccount ? (
                <>
                  <label>Email (auto)</label>
                  <input
                    type="email"
                    value={formData.accountName ? `${formData.accountName}@gmail.com` : ""}
                    readOnly
                  />
                  <label>Password (default)</label>
                  <input type="text" value="default@123" readOnly />
                </>
              ) : (
                <>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <span className="field-error">{formErrors.email}</span>
                  )}
                  <label>New Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.password || ""}
                    onChange={handleChange}
                  />
                </>
              )}

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
