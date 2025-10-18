import "../components/AccountMng.css";
import React, { useState } from "react";

const AdminSubManage = () => {
    const [search, setSearch] = useState("");
    
      // In future you’ll fetch this list from backend
      const [subscription, setSubscription] = useState([
        // placeholder for structure only
        // { id: 1, name: "John Doe", role: "Employee", email: "john@example.com" },
      ]);
    
      // Search filter
      const filteredAccounts = subscription.filter((acc) =>
        acc.name?.toLowerCase().includes(search.toLowerCase())
      );
    
      // CRUD handler placeholders
      const handleCreate = () => {
        console.log("Create new sub");
      };
    
      const handleUpdate = (id) => {
        console.log("Update sub", id);
      };
    
      const handleDelete = (id) => {
        console.log("Delete sub", id);
      };


    return (
    <div className="home-frame">
      <h1>Subscription Management</h1>

      {/* --- Search Bar --- */}
      <div className="account-toolbar">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="create-btn" onClick={handleCreate}>
          + Add Subscription
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
                <h3>Subscription name</h3>
                <p>price</p>
                <p>status</p>
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

export default AdminSubManage;