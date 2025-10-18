import '../components/HomeFrame.css' ;
import '../components/AdminStyle.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";


const AdminDash = () => {
  // --- Placeholder data ---
  const salesData = [
    { date: "01", orders: 4, customers: 3 },
    { date: "02", orders: 6, customers: 5 },
    { date: "03", orders: 8, customers: 6 },
    { date: "04", orders: 5, customers: 4 },
    { date: "05", orders: 10, customers: 9 },
    { date: "06", orders: 7, customers: 6 },
    { date: "07", orders: 9, customers: 7 },
  ];

  const recentActivity = [
    { id: 1, action: "Employee John updated battery stock", date: "09/10/2025" },
    { id: 2, action: "New station added: Downtown Branch", date: "08/10/2025" },
    { id: 3, action: "Battery #12 marked as damaged", date: "07/10/2025" },
  ];

  const incomingInventory = [
    { id: 1, name: "Battery Pack A", quantity: 50, arrival: "10/10/2025" },
    { id: 2, name: "Battery Pack B", quantity: 30, arrival: "12/10/2025" },
  ];

  const summaryStats = [
    { title: "Total Swaps (Today)", value: 128 },
    { title: "Active Stations", value: 14 },
    { title: "Charged Batteries", value: 420 },
    { title: "Pending Deliveries", value: 5 },
  ];
  return (
    <div className="home-frame">
      <h1>Admin Dashboard</h1>

      {/* --- Summary Section --- */}
      <div className="summary-section">
        {summaryStats.map((stat, i) => (
          <div className="summary-card" key={i}>
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* --- Sales Chart --- */}
      <div className="chart-section">
        <h2>Sales Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#00b4d8" />
            <Line type="monotone" dataKey="customers" stroke="#90e0ef" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* --- Recent Activity --- */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <ul>
          {recentActivity.map((item) => (
            <li key={item.id}>
              <strong>{item.action}</strong> <span>({item.date})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Incoming Inventory --- */}
      <div className="inventory-section">
        <h2>Incoming Inventory</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Arrival Date</th>
            </tr>
          </thead>
          <tbody>
            {incomingInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.arrival}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDash;

