import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import parseISO from "date-fns/parseISO";
import "../components/AdminStyle.css";

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

  useEffect(() => {
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
    fetchBookings();
  }, []);
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5204/api/Booking/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      alert("Booking created successfully");
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


  const handleEventClick = async (event) => {
  try {
    const bookingRes = await fetch(`${DETAIL_URL}${event.id}`);
    if (!bookingRes.ok) throw new Error("Failed to fetch booking details");
    const bookingResult = await bookingRes.json();
    const bookingData = bookingResult.data;

    // Fetch car and station details in parallel
    const [carRes, stationRes] = await Promise.all([
      fetch(`http://localhost:5204/api/Car/GetCarById?carId=${bookingData.vehicleId}`),
      fetch(`http://localhost:5204/api/Station/Select/${bookingData.stationId}`)
    ]);

    if (!carRes.ok || !stationRes.ok) throw new Error("Failed to fetch related data");

    const carData = (await carRes.json()).data;
    const stationData = (await stationRes.json()).data;

    // Combine all data for modal
    setSelectedBooking({
      ...bookingData,
      carModel: carData?.model || "Unknown",
      stationName: stationData?.address || `Station #${bookingData.stationId}`,
    });
    setModalOpen(true);
  } catch (err) {
    alert(err.message);
  }
};

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Booking Schedule
         <button className="save-btn" onClick={() => setIsCreating(true)}>+ Create Booking</button>
      </h2>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          style={{ height: "70vh" }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#2d89ef",
              borderRadius: "5px",
              color: "white",
              border: "none",
            },
          })}
          onSelectEvent={handleEventClick}
        />
      </div>

      {modalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Booking Details</h2>
            <p><strong>Station:</strong> {selectedBooking.stationName}</p>
            <p><strong>Vehicle:</strong> {selectedBooking.carModel}</p>
            <p><strong>Date:</strong> {selectedBooking.dateTime}</p>
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

              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <label>Station ID</label>
              <input
                type="text"
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                required
              />

              <label>Vehicle ID</label>
              <input
                type="text"
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                required
              />

              <label>Account ID</label>
              <input
                type="text"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
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
