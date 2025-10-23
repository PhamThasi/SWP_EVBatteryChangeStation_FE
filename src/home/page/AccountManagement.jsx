import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";

const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const BASE_URL = "http://localhost:5204/api/Account";

  // Load all accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/GetAll`);
      if (!response.ok) throw new Error("Failed to fetch accounts list");
      const result = await response.json();
      setAccounts(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Soft delete
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter((acc) =>
    acc.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="home-frame">
      <h1>Account Management</h1>

      {/* Search */}
      <div className="account-toolbar">
        <input
          type="text"
          placeholder="Search by full name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Account list */}
      <div className="account-list">
        {filteredAccounts.length === 0 ? (
          <p className="no-data">No accounts found.</p>
        ) : (
          filteredAccounts.map((acc) => (
            <div className="account-card" key={acc.accountId}>
              <div className="account-info">
                <h3>{acc.fullName}</h3>
                <p><strong>Account ID:</strong> {acc.accountId}</p>
                <p><strong>Username:</strong> {acc.accountName}</p>
                <p><strong>Gender:</strong> {acc.gender}</p>
                <p><strong>Address:</strong> {acc.address}</p>
                <p><strong>Phone:</strong> {acc.phoneNumber}</p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {acc.dateOfBirth
                    ? new Date(acc.dateOfBirth).toLocaleDateString()
                    : "-"}
                </p>
                <p>
                  <strong>Status:</strong> {acc.status ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="account-actions">
                <button
                  className="update-btn"
                  onClick={() => setEditingAccount(acc)}
                >
                  Update
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(acc.accountId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountManagement;
