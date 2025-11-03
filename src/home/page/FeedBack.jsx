import React, { useEffect, useState } from "react";
import { formatDateTime } from "@/utils/dateFormat"; 

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FEEDBACK_URL = "http://localhost:5204/api/FeedBack/SelectAll";
  const ACCOUNT_URL = "http://localhost:5204/api/Account/GetAll";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [feedbackRes, accountRes] = await Promise.all([
          fetch(FEEDBACK_URL),
          fetch(ACCOUNT_URL),
        ]);
        if (!feedbackRes.ok || !accountRes.ok) throw new Error("Failed to load data");

        const feedbackData = (await feedbackRes.json()).data?.data || [];
        const accountData = (await accountRes.json()).data || [];

        // map feedback with account full name
        const mergedData = feedbackData.map((fb) => {
          const acc = accountData.find((a) => a.accountId === fb.accountId);
          return {
            ...fb,
            fullName: acc?.fullName || "Unknown User",
          };
        });

        setFeedbacks(mergedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading feedback...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Customer Feedback</h2>
      <div className="dashboard-card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <tr key={fb.feedbackId}>
                  <td>{fb.fullName}</td>
                  <td>{fb.rating} ★</td>
                  <td>{fb.comment}</td>
                  <td>{formatDateTime(fb.createDate)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No feedback found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackPage;
