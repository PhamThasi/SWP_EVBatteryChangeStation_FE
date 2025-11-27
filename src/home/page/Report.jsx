import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/AdminStyle.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const CombinedReport = () => {
  const [stations, setStations] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [bookingChartData, setBookingChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [stationRes, revenueRes, bookingRes] = await Promise.all([
          axios.get("http://localhost:5204/api/Station/SelectAll"),
          axios.get("https://localhost:7071/api/report/revenue-by-station"),
          axios.get("http://localhost:5204/api/Booking/SelectAll"),
        ]);

        // Station & Revenue
        setStations(stationRes.data.data || []);
        setRevenues(revenueRes.data || []);

        // Booking Chart Process
        const bookings = bookingRes.data.data || [];

        const approved = bookings.filter(
          (b) => b.isApproved?.toLowerCase() === "approve"
        );

        const counts = {};
        approved.forEach((b) => {
          const date = new Date(b.dateTime);
          const key = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          counts[key] = (counts[key] || 0) + 1;
        });

        const formatted = Object.keys(counts)
          .sort()
          .map((key) => ({
            month: key,
            bookings: counts[key],
          }));

        setBookingChartData(formatted);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Merge revenue + station info
  const reportData = stations.map((station) => {
    const revenue = revenues.find((r) => r.stationId === station.stationId);
    return {
      ...station,
      totalRevenue: revenue ? revenue.totalRevenue : 0,
      totalTransaction: revenue ? revenue.totalTransaction : 0,
    };
  });

  const totalAllRevenue = reportData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Reports</h1>

      {/* Revenue Report Section */}
      <h2 className="section-title">Revenue Report</h2>

      <div className="summary-section">
        <div className="summary-card total-card">
          <h3>Total Revenue (All Stations)</h3>
          <p>
            <strong>{totalAllRevenue.toLocaleString()}</strong>
          </p>
        </div>

        {reportData.map((item) => (
          <div key={item.stationId} className="summary-card">
            <h3>{item.stationName}</h3>
            <p>{item.address}</p>
            <p>
              Total Revenue:{" "}
              <strong>{item.totalRevenue.toLocaleString()}</strong>
            </p>
            <p>
              Total Transactions:{" "}
              <strong>{item.totalTransaction}</strong>
            </p>
          </div>
        ))}
      </div>

      {/* Booking Chart Section */}
      <h2 className="section-title">Booking Report (Approved Only)</h2>

      <div style={{ width: "100%", height: 400, marginTop: "20px" }}>
        <ResponsiveContainer>
          <LineChart data={bookingChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke="#007bff"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CombinedReport;
