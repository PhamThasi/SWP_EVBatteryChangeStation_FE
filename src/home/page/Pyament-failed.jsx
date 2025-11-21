import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const FailedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const latestBookingId = JSON.parse(sessionStorage.getItem("latestBooking"));
  // const transactionId = location.state?.transactionId;
  const [message, setMessage] = useState("Processing failure result...");
  const transactionId = sessionStorage.getItem("transactionId");

  useEffect(() => {
    if (!transactionId) {
      setMessage("Missing transaction ID. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    const processFailure = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5204/api/Swapping/GetSwappingById?transactionId=${transactionId}`
        );

        const tx = res.data.data;
        if (!tx) {
          setMessage("Transaction not found. Redirecting...");
          return setTimeout(() => navigate("/"), 2000);
        }
        if (latestBookingId) {
          await axios.delete(
            `http://localhost:5204/api/Booking/HardDelete/${latestBookingId}`
          );
          console.log("Deleted booking:", latestBookingId);
        }

        //
        // 4️⃣ Delete swapping record
        //
        await axios.delete(
          `http://localhost:5204/api/Swapping/DeleteSwapping?transactionId=${transactionId}`
        );
        console.log("Deleted swapping:", transactionId);

        setMessage("Payment failed. Data removed. Redirecting...");
      } catch (err) {
        console.error(err);
        setMessage("Error occurred. Redirecting...");
      } finally {
        // Delay so user sees the message
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
