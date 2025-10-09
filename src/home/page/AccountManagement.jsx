import React, { useState } from "react";
import "../components/AccountMng.css";

const AccountManagement = () => {
  const [search, setSearch] = useState("");

  // In future you’ll fetch this list from backend
  const [accounts, setAccounts] = useState([
    // placeholder for structure only
    // { id: 1, name: "John Doe", role: "Employee", email: "john@example.com" },
  ]);

  // Search filter
  const filteredAccounts = accounts.filter((acc) =>
    acc.name?.toLowerCase().includes(search.toLowerCase())
  );

  // CRUD handler placeholders
  const handleCreate = () => {
    console.log("Create new account");
  };

  const handleUpdate = (id) => {
    console.log("Update account", id);
  };

  const handleDelete = (id) => {
    console.log("Delete account", id);
  };

  return (
    <div className="home-frame">
      <h1>Account Management</h1>

      {/* --- Search Bar --- */}
      <div className="account-toolbar">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="create-btn" onClick={handleCreate}>
          + Add Account
        </button>
      </div>

      {/* --- Account List --- */}
      <div className="account-list">
        {filteredAccounts.length === 0 ? (
          <p className="no-data">No accounts found.</p>
        ) : (
          filteredAccounts.map((acc) => (
            <div className="account-card" key={acc.id}>
              <div className="account-info">
                <h3>{acc.name}</h3>
                <p>Email: {acc.email}</p>
                <p>Role: {acc.role}</p>
              </div>
              <div className="account-actions">
                <button
                  className="update-btn"
                  onClick={() => handleUpdate(acc.id)}
                >
                  Update
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(acc.id)}
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
