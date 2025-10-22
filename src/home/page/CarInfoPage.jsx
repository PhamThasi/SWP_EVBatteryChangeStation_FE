import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";

const CarInfoPage = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:5204/api/Car";

  // Load all cars
  const fetchAllCars = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/GetAllCars`);
      if (!response.ok) throw new Error("Failed to fetch car list");
      const result = await response.json();
      setCars(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search by carId
  const fetchCarByModel = async (model) => {
    if (!model.trim()) return fetchAllCars();
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/GetCarById?model=${model}`);
      if (!response.ok) throw new Error("Car not found");
      const result = await response.json();
      if (result.data) setCars([result.data]);
      else setCars([]);
    } catch (err) {
      setError(err.message);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm("Confirm delete this account?")) return;
    try {
      const res = await fetch(`${BASE_URL}/SoftDelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      await fetchAllCars();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchAllCars();
  }, []);

  const filteredCars = cars.filter((acc) =>
    acc.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading car information...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="car-info-container">
      <h2>Car Information</h2>

      {/* Search */}
      <div className="account-toolbar">
        <input
          type="text"
          placeholder="Search by full name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Car model list */}
      <div className="account-list">
        {filteredCars.length === 0 ? (
          <p className="no-data">No accounts found.</p>
        ) : (
          filteredCars.map((acc) => (
            <div className="account-card" key={acc.accountId}>
              <div className="account-info">
                <h3>{acc.fullName}</h3>
                <p><strong>Account ID:</strong> {acc.accountId}</p>
                <p><strong>Username:</strong> {acc.accountName}</p>
                <p><strong>Gender:</strong> {acc.gender}</p>
                <p><strong>Address:</strong> {acc.address}</p>
                <p><strong>Phone:</strong> {acc.phoneNumber}</p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {acc.dateOfBirth
                    ? new Date(acc.dateOfBirth).toLocaleDateString()
                    : "-"}
                </p>
                <p>
                  <strong>Status:</strong> {acc.status ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="account-actions">              
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(acc.accountId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>


    
    </div>
  );
};

export default CarInfoPage;
