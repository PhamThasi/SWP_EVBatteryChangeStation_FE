import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";

const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null); // also used for creating
  const [formData, setFormData] = useState({
    fullName: "",
    accountName: "",
    gender: "",
    address: "",
    phoneNumber: "",
    dateOfBirth: "",
    status: true,
  });

  const BASE_URL = "http://localhost:5204/api/Account";

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

  useEffect(() => {
    fetchAccounts();
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
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setEditingAccount(null);
  };

  // Save (Add or Update)
  const handleSave = async () => {
    const url = editingAccount
      ? `${BASE_URL}/Update`
      : `${BASE_URL}/Create`;

    const method = "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: editingAccount?.accountId,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to save account");

      closeModal();
      await fetchAccounts();
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
      </div>

      {/* Accounts Table */}
      <div className="dashboard-card">
        <h2>Account List</h2>
        {filteredAccounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Date of Birth</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => (
                <tr key={acc.accountId}>
                  <td>{acc.fullName}</td>
                  <td>{acc.accountName}</td>
                  <td>{acc.gender}</td>
                  <td>{acc.address}</td>
                  <td>{acc.phoneNumber}</td>
                  <td>
                    {acc.dateOfBirth
                      ? new Date(acc.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{acc.status ? "Active" : "Inactive"}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="update-btn"
                      // style={{ marginRight: "0.5rem" }}
                      onClick={() => openModal(acc)}
                    >
                      Update
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(acc.accountId)}
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
      {editingAccount !== null && (
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
              <input
                type="text"
                name="gender"
                placeholder="Gender"
                value={formData.gender}
                onChange={handleChange}
              />
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
