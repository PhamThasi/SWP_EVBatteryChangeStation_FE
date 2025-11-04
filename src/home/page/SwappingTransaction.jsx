import React, { useEffect, useState } from "react";
import axios from "axios";

const SwappingManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const swapRes = await axios.get("http://localhost:5204/api/Swapping/GetAllSwapping");
        const swaps = swapRes.data.data;

        // Fetch car + owner details for each swap
        const enriched = await Promise.all(
          swaps.map(async (swap) => {
            try {
              const carRes = await axios.get(
                `http://localhost:5204/api/Car/GetCarById?carId=${swap.vehicleId}`
              );
              const ownerRes = await axios.get(
                `http://localhost:5204/api/Car/GetOwnerByCarIdAsync?carId=${swap.vehicleId}`
              );
              return {
                ...swap,
                carModel: carRes.data.data.model,
                ownerName: ownerRes.data.data.fullName,
              };
            } catch {
              return { ...swap, carModel: "-", ownerName: "-" };
            }
          })
        );

        setTransactions(enriched);
      } catch (err) {
        console.error("Failed to load swaps:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-card" style={{ display: "grid", gap: "1rem" }}>
      <h1 className="dashboard-title">Swapping Transactions</h1>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        transactions.map((tx) => (
          <div
            key={tx.transactionId}
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "10px",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p><b>Car:</b> {tx.carModel}</p>
              <p><b>Owner:</b> {tx.ownerName}</p>
              <p><b>Date:</b> {new Date(tx.createDate).toLocaleString()}</p>
            </div>
            <button
              className="update-btn"
              onClick={() => handleStatusUpdate(tx.transactionId)}
            >
              {tx.status}
            </button>
          </div>
        ))
      )}
    </div>
  );

  async function handleStatusUpdate(id) {
    try {
      await axios.put(`http://localhost:5204/api/Swapping/UpdateStatus/${id}`);
      setTransactions((prev) =>
        prev.map((t) =>
          t.transactionId === id ? { ...t, status: "Updated" } : t
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }
};

export default SwappingManagement;
