import React, { useEffect, useState } from "react";
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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/SelectAll`);
      const json = await res.json();
      setSubscriptions(json.data || []);
    } catch {
      toast.error("Failed to load subscriptions");
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

      if (!res.ok) throw new Error();
      await fetchSubscriptions();
      toast.success(isEditing ? "Subscription updated" : "Subscription created");
      closeModal();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      const res = await fetch(`${API_BASE}/SoftDelete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchSubscriptions();
      toast.success("Subscription deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const resetForm = () =>
    setForm({
      subscriptionId: "",
      name: "",
      price: "",
      extraFee: "",
      description: "",
      durationPackage: "",
    });

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredSubs = subscriptions.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white px-6 md:px-32 pt-32 text-gray-800 font-inter">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Title */}
      <h1 className="text-3xl font-semibold text-center border-b-2 border-blue-600 pb-2 mb-10">
        Subscription Management
      </h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + Add Subscription
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubs.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No subscriptions found.
          </p>
        ) : (
          filteredSubs.map((sub) => (
            <div
              key={sub.subscriptionId}
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="space-y-1 mb-3">
                <h3 className="text-lg font-semibold">{sub.name}</h3>
                <p className="text-gray-700">Price: {sub.price}</p>
                <p className="text-gray-700">Extra Fee: {sub.extraFee}</p>
                <p className="text-gray-700">
                  Duration: {sub.durationPackage} days
                </p>
                <p
                  className={`font-medium ${
                    sub.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Status: {sub.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(sub)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sub.subscriptionId)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-semibold text-center mb-4">
              {isEditing ? "Edit Subscription" : "Create Subscription"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <lable>Name</lable>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <lable>Price</lable>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <lable>Extra Fee</lable>
              <input
                type="number"
                placeholder="Extra Fee"
                value={form.extraFee}
                onChange={(e) =>
                  setForm({ ...form, extraFee: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <lable>Duration</lable>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm"
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
