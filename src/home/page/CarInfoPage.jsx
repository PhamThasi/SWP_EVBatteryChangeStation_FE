import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";

const CarInfoPage = () => {
  const [cars, setCars] = useState([]);
  const [searchId, setSearchId] = useState("");
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
  const fetchCarById = async (carId) => {
    if (!carId.trim()) return fetchAllCars();
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/GetCarById?carId=${carId}`);
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

  useEffect(() => {
    fetchAllCars();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCarById(searchId);
  };

  if (loading) return <p>Loading car information...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="car-info-container">
      <h2>Car Information</h2>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Enter Vehicle ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Search</button>
        <button
          type="button"
          className="reset-btn"
          onClick={() => {
            setSearchId("");
            fetchAllCars();
          }}
        >
          Reset
        </button>
      </form>

      <table className="car-table">
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Model</th>
            <th>Battery Type</th>
            <th>Producer</th>
            <th>Create Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? (
            cars.map((car) => (
              <tr key={car.vehicleId}>
                <td>{car.vehicleId}</td>
                <td>{car.model}</td>
                <td>{car.batteryType}</td>
                <td>{car.producer}</td>
                <td>{new Date(car.createDate).toLocaleString()}</td>
                <td>{car.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No car data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CarInfoPage;
