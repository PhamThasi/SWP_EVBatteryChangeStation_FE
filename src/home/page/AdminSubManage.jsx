import React, { useEffect, useState } from "react";
import "../components/AdminStyle.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5204/api/Subscription";

const AdminSubManage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    subscriptionId: "",
    name: "",
    price: "",
    extraFee: "",
    description: "",
    durationPackage: "",
    accountId: "da44578a-ef06-4c4c-a64c-947460c4d3b2",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/SelectAll`);
      const json = await res.json();
      setSubscriptions(json.data || []);
    } catch (err) {
      toast.error("Failed to load subscriptions");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (sub) => {
    setForm(sub);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     const method = isEditing ? "PUT" : "POST";
    const url = isEditing
    ? `${API_BASE}/Update/${form.subscriptionId}`
    : `${API_BASE}/Create`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchSubscriptions();
        toast.success(isEditing ? "Subscription updated" : "Subscription created");
        closeModal();
      } else {
        const msg = await res.text();
        toast.error(`Operation failed: ${msg}`);
      }
    } catch (err) {
      toast.error("Network error");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      const res = await fetch(`${API_BASE}/SoftDelete/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSubscriptions();
        toast.success("Subscription deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({
      subscriptionId: "",
      name: "",
      price: "",
      extraFee: "",
      description: "",
      durationPackage: "",
      accountId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    });
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredSubs = subscriptions.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <ToastContainer position="top-right" autoClose={2500} />

      <h1>Subscription Management</h1>
      {/* Toolbar */}
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

      

      {/* List */}
      <div className="account-list">
        {filteredSubs.length === 0 ? (
          <p className="no-data">No subscriptions found.</p>
        ) : (
          filteredSubs.map((sub) => (
            <div className="account-card" key={sub.subscriptionId}>
              <div className="account-info">
                <h3>{sub.name}</h3>
                <p>Price: {sub.price}</p>
                <p>Extra Fee: {sub.extraFee}</p>
                <p>Duration: {sub.durationPackage} days</p>
                <p>Status: {sub.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="account-actions">
                <button
                  className="update-btn"
                  onClick={() => handleEdit(sub)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(sub.subscriptionId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="">
            <h2>{isEditing ? "Edit Subscription" : "Create Subscription"}</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                required
              />
              <input
                type="number"
                placeholder="Extra Fee"
                value={form.extraFee}
                onChange={(e) =>
                  setForm({ ...form, extraFee: Number(e.target.value) })
                }
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={form.durationPackage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationPackage: Number(e.target.value),
                  })
                }
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {isEditing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubManage;