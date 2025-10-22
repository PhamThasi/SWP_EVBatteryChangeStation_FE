import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer  } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import parseISO from "date-fns/parseISO";

const locales = {
  "en-US": undefined,
};
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

  const BASE_URL = "http://localhost:5204/api/Booking/SelectAll";

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to load bookings");
        const result = await res.json();
        const data = result.data || [];

        // Convert API data into calendar events
        const formattedEvents = data.map((b) => ({
          id: b.bookingId,
          title: b.notes || `Booking #${b.bookingId}`,
          start: parseISO(b.dateTime),
          end: parseISO(b.dateTime), // same day event
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

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ height: "80vh", padding: "20px" }}>
      <h2>Booking Schedule</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        style={{ height: "100%" }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#2d89ef",
            borderRadius: "5px",
            color: "white",
            border: "none",
          },
        })}
        onSelectEvent={(event) => {
          alert(
            `Booking ID: ${event.id}\nStation: ${event.resource.stationId}\nVehicle: ${event.resource.vehicleId}`
          );
        }}
      />
    </div>
  );
};

export default SchedulePage;
