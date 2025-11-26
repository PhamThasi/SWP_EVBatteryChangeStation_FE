import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AdminStyle.css"

const RevenueReport = () => {
  const [stations, setStations] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationRes, revenueRes] = await Promise.all([
          axios.get("http://localhost:5204/api/Station/SelectAll"),
          axios.get("https://localhost:7071/api/report/revenue-by-station"),
        ]);

        setStations(stationRes.data.data || []);
        setRevenues(revenueRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Merge station info with revenue
  const reportData = stations.map((station) => {
    const revenue = revenues.find((r) => r.stationId === station.stationId);
    return {
      ...station,
      totalRevenue: revenue ? revenue.totalRevenue : 0,
      totalTransaction: revenue ? revenue.totalTransaction : 0,
    };
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Revenue Report</h1>

      <div className="summary-section">
        {reportData.map((item) => (
          <div key={item.stationId} className="summary-card">
            <h3>{item.stationName}</h3>
            <p>{item.address}</p>
            <p>Total Revenue: <strong>{item.totalRevenue.toLocaleString()}</strong></p>
            <p>Total Transactions: <strong>{item.totalTransaction}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueReport;