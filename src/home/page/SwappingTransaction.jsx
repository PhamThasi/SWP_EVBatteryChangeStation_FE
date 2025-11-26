import React, { useEffect, useState } from "react";
import axios from "axios";

const SwappingManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

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
                  ownerName:ownerRes.data.data.fullName || ownerRes.data.data.accountName || "-",
                accountId: ownerRes.data.data.accountId,
              };
            } catch {
              return { ...swap, carModel: "-", ownerName: "-", accountId: null };
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
  const handleStatusChange = (id, newStatus) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.transactionId === id ? { ...t, status: newStatus } : t
      )
    );
  };

  const handleSaveStatus = async (tx) => {
    try {
      await axios.put("http://localhost:5204/api/Swapping/UpdateSwapping", {
        transactionId: tx.transactionId,
        notes: tx.notes,
        staffId: tx.staffId,
        oldBatteryId: tx.oldBatteryId,
        vehicleId: tx.vehicleId,
        newBatteryId: tx.newBatteryId,
        status: tx.status,
        createDate: tx.createDate,
      });
      alert("Status updated successfully.");
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  const handleViewPayment = async (transactionId) => {
    try {
      const res = await axios.get(
        `http://localhost:5204/api/Payment/get-by-transaction/${transactionId}`
      );
      setSelectedPayment(res.data.data);
      setPaymentModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch payment:", err);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Find the transaction that matches the selected payment
      const relatedTx = transactions.find(
        (t) => t.transactionId === selectedPayment.transactionId
      );

      if (!relatedTx) {
        console.error("Transaction not found for this payment");
        alert("Transaction not found.");
        return;
      }

      const updated = {
        paymentId: selectedPayment.paymentId,
        accountId: relatedTx.accountId, // use from the transaction
        status: "Successful",
      };

      // console.log(updated); // log all 3 fields

      await axios.put("http://localhost:5204/api/Payment/update", updated);

      alert("Payment marked as success.");
      setSelectedPayment({ ...selectedPayment, status: "Success" });
    } catch (err) {
      console.error("Failed to update payment:", err);
      alert("Failed to update payment status.");
    }
  };

  const closeModal = () => {
    setPaymentModalOpen(false);
    setSelectedPayment(null);
  };
  const sorted = [...transactions].sort(
          (a, b) => new Date(b.createDate) - new Date(a.createDate)
        );


  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-card" style={{ display: "grid", gap: "1rem" }}>
      <h1 className="dashboard-title">Swapping Transactions</h1>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (        
        sorted.map((tx)  => (
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
              <p><b>Status:</b> {tx.status}</p>
              <p><b>Date:</b> {new Date(tx.createDate).toLocaleString()}</p>
            </div>
             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
              <select
                value={tx.status}
                onChange={(e) => handleStatusChange(tx.transactionId, e.target.value)}
                style={{ padding: "0.5rem", borderRadius: "6px" }}
              >
                <option value="Active">Active</option>
                <option value="Finish">Finish</option>
                <option value="Cancel">Cancel</option>
              </select>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="update-btn"
                  onClick={() => handleSaveStatus(tx)}
                >
                  Save
                </button>
                <button
                  className="save-btn"
                  onClick={() => handleViewPayment(tx.transactionId)}
                >
                  💳 Payment
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedPayment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              minWidth: "300px",
            }}
          >
            <h3>Payment Details</h3>
            <p><b>Price:</b> {selectedPayment.price.toLocaleString()} VND</p>
            <p><b>Method:</b> {selectedPayment.method}</p>
            <p><b>Status:</b> {selectedPayment.status}</p>           
            <p><b>Date:</b> {new Date(selectedPayment.createDate).toLocaleString()}</p>
            {selectedPayment.status === "Pending" && (
              <button className="save-btn" onClick={handlePaymentSuccess}>
                ✅ Payment Success
              </button>
            )}
            
            <button className="delete-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwappingManagement;
