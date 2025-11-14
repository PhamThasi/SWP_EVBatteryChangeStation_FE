import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const FailedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const transactionId = location.state?.transactionId;
  const [message, setMessage] = useState("Processing failure result...");

  useEffect(() => {
    if (!transactionId) {
      setMessage("Missing transaction ID. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    const processFailure = async () => {
      try {
        // 1. Get the record
        const res = await axios.get(
          `http://localhost:5204/api/Swapping/GetSwappingById?transactionId=${transactionId}`
        );

        const tx = res.data.data;

        if (!tx) {
          setMessage("Transaction not found. Redirecting...");
          return setTimeout(() => navigate("/"), 2000);
        }

        // 2. Update status → Failed
        await axios.put("http://localhost:5204/api/Swapping/UpdateSwapping", {
          transactionId: tx.transactionId,
          notes: tx.notes,
          staffId: tx.staffId,
          oldBatteryId: tx.oldBatteryId,
          vehicleId: tx.vehicleId,
          newBatteryId: tx.newBatteryId,
          status: "Failed",      // changed here
          createDate: tx.createDate,
        });

        setMessage("Payment failed. Redirecting to home...");
      } catch (err) {
        setMessage("Error occurred. Redirecting...");
      } finally {
        // small delay to show the message
        setTimeout(() => navigate("/"), 2000);
      }
    };

    processFailure();
  }, [transactionId, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px", fontSize: "20px" }}>
      {message}
    </div>
  );
};

export default FailedPage;
