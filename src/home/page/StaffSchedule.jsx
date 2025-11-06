import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import parseISO from "date-fns/parseISO";
import "../components/AdminStyle.css";
import { formatDateTime } from "@/utils/dateFormat"; 
import axios from "axios";

const locales = { "en-US": undefined };
const localizer = dateFnsLocalizer({
  format,
  parse: (value, formatString) => parse(value, formatString, new Date()),
  startOfWeek,
  getDay,
  locales,
});


const SchedulePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [cars, setCars] = useState([]);
  const [accountSearch, setAccountSearch] = useState("");

  const BASE_URL = "http://localhost:5204/api/Booking/SelectAll";
  const DETAIL_URL = "http://localhost:5204/api/Booking/Select/";
  const [formData, setFormData] = useState({
    dateTime: "",
    notes: "",
    status: true,
    createdDate: new Date().toISOString(),
    stationId: "",
    vehicleId: "",
    accountId: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridDate, setGridDate] = useState(null);
  const [gridEvents, setGridEvents] = useState([]);
  
  const grouped = events.reduce((acc, e) => {
  const date = e.start.toISOString().split("T")[0];
    acc[date] = acc[date] || [];
    acc[date].push(e);
    return acc;
  }, {});
  const handleShowMore = (dayEvents, date) => {
    setGridEvents(dayEvents);
    setGridDate(date);
    setShowGrid(true);
  };
  const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to load bookings");
        const result = await res.json();
        const data = result.data || [];

        const formattedEvents = data.map((b) => ({
          id: b.bookingId,
          title: b.notes || `Booking #${b.bookingId}`,
          start: parseISO(b.dateTime),
          end: parseISO(b.dateTime),
          allDay: false,
          resource: b,
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {    
    fetchBookings();
  }, []);
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
    //   const payload = {
    //     ...formData,
    //     dateTime: new Date(formData.dateTime).toISOString(),
    //     createdDate: new Date().toISOString(),
    //   };

    //   console.log("Booking payload:", payload); // log the object
    //  console.log("JSON body:", JSON.stringify(payload, null, 2)); 
      const res = await fetch("http://localhost:5204/api/Booking/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
        createdDate: new Date().toISOString(),
      }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      alert("Booking created successfully");
      fetchBookings();
      setIsCreating(false);
      
    } catch (err) {
      alert(err.message);
    }
  };
  const handleUpdateBooking = async () => {
    try {
      const res = await fetch(`http://localhost:5204/api/Booking/Update/${selectedBooking.bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedBooking,
          createdDate: selectedBooking.createdDate || new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      alert("Booking updated successfully");
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAccountSearch = (query) => {
    if (!query) return setFilteredAccounts([]);
    const filtered = accounts.filter(acc =>
      acc.fullName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAccounts(filtered);
  };
  const handleFetchCars = async (accountId) => {
    try {
      const res = await axios.get(`http://localhost:5204/api/Car/GetCarByOwner?ownerId=${accountId}`);
      setCars(res.data.data || []);
    } catch {
      setCars([]);
    }
  };

  const handleOpenCreateModal = async () => {
    setIsCreating(true);
    try {
      const [stationRes, accountRes] = await Promise.all([
        axios.get("http://localhost:5204/api/Station/SelectAll"),
        axios.get("http://localhost:5204/api/Account/GetAll"),
      ]);
      setStations(stationRes.data.data || []);
      setAccounts(accountRes.data.data || []);
    } catch {
      setStations([]);
      setAccounts([]);
    }
  };


  const handleEventClick = async (event) => {
    try {
      const bookingRes = await fetch(`${DETAIL_URL}${event.id}`);
      if (!bookingRes.ok) throw new Error("Failed to fetch booking details");
      const bookingResult = await bookingRes.json();
      const bookingData = bookingResult.data;

      // Fetch car, station, and owner in parallel
      const [carRes, stationRes, ownerRes] = await Promise.all([
        fetch(`http://localhost:5204/api/Car/GetCarById?carId=${bookingData.vehicleId}`),
        fetch(`http://localhost:5204/api/Station/Select/${bookingData.stationId}`),
        fetch(`http://localhost:5204/api/Car/GetOwnerByCarIdAsync?carId=${bookingData.vehicleId}`),
      ]);

      if (!carRes.ok || !stationRes.ok || !ownerRes.ok)
        throw new Error("Failed to fetch related data");

      const carData = (await carRes.json()).data;
      const stationData = (await stationRes.json()).data;
      const ownerData = (await ownerRes.json()).data;

      // Combine all data for modal
      setSelectedBooking({
        ...bookingData,
        carModel: carData?.model || "Unknown",
        stationName: stationData?.address || `Station #${bookingData.stationId}`,
        customerName: ownerData?.fullName || "Unknown Customer",
      });

      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Error loading booking details");
    }
  };


  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Booking Schedule        
      </h2>
      <button className="save-btn" onClick={handleOpenCreateModal}>+ Create Booking</button>
      {showGrid ? (
    <div className="event-box-view">
      <button className="cancel-btn" onClick={() => setShowGrid(false)}>← Back to Calendar</button>
      <h3>Events on {gridDate.toDateString()}</h3>
      <div className="grid-container">
        {gridEvents.map((e, i) => (
          <div key={i} className="event-item" onClick={() => handleEventClick(e)}>
            <h4>{e.title}</h4>
            <p>{e.start.toLocaleTimeString()} - {e.end.toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month"]}
        style={{ height: "70vh" }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#2d89ef",
            borderRadius: "5px",
            color: "white",
            border: "none",
            padding: "2px",
          },
        })}
        onSelectEvent={handleEventClick}
        onShowMore={handleShowMore}
      />
    </div>)}
  

      {modalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Booking Details</h2>
            <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
            <p><strong>Station:</strong> {selectedBooking.stationName}</p>
            <p><strong>Vehicle:</strong> {selectedBooking.carModel}</p>
            <p><strong>Time and Date:</strong> {formatDateTime(selectedBooking.dateTime)}</p>
            <p><strong>Notes:</strong> {selectedBooking.notes || "None"}</p>
            <div className="modal-actions">              
              <button className="batupdate-btn" onClick={handleUpdateBooking}>Update</button>
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Booking</h2>
            <form className="modal-form" onSubmit={handleCreateBooking}>
              <label>Date Time</label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                required
              />
              {/* Account search */}
              <label>Account</label>
              <input
                type="text"
                placeholder="Search by full name"
                value={accountSearch}
                onChange={(e) => {
                  setAccountSearch(e.target.value);
                  handleAccountSearch(e.target.value);
                }}
                required
              />
              {filteredAccounts.length > 0 && (
                <ul className="dropdown-list">
                  {filteredAccounts.map((acc) => (
                    <li
                      key={acc.accountId}
                      onClick={() => {
                        setFormData({ ...formData, accountId: acc.accountId });
                        setAccountSearch(acc.fullName);
                        setFilteredAccounts([]);
                        handleFetchCars(acc.accountId);
                      }}
                    >
                      {acc.fullName}
                    </li>
                  ))}
                </ul>
              )}

              {/* Car selection */}
              <label>Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                required
              >
                <option value="">Select a Car</option>
                {cars.map((car) => (
                  <option key={car.vehicleId} value={car.vehicleId}>
                    {car.model}
                  </option>
                ))}
              </select>
              
              {/* Station selection */}
              <label>Station</label>
              <select
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                required
              >
                <option value="">Select a Station</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.address}
                  </option>
                ))}
              </select>
              

              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div className="modal-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SchedulePage;
