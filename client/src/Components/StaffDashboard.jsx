import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { getManualEvents, createEvent, updateEvent, deleteEvent } from "../services/api.js";
import '../../css/StaffDashboard.css';

const StaffDashboard = () => {
    const { token } = useUser();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        location: { venue: "", city: "" },
        image: null
    });
    const [eventIdToEdit, setEventIdToEdit] = useState(null);
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await getManualEvents();
            const manualEvents = res
                .filter(e => e.source === "manual")
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            setEvents(manualEvents);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch events.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", location: { venue: "", city: "" }, startDateTime: "", endDateTime: "", image: null });
        setEventIdToEdit(null);
    };

    const convertLocalDateTimeToISO = (localDateTime) => localDateTime ? new Date(localDateTime).toISOString() : null;
    const isDateRangeValid = (start, end) => start && end && new Date(start) < new Date(end);
    const isStartDateInFuture = (start) => start && new Date(start) >= new Date();

    const formatDateTimeRangeMultiline = (start, end) => {
        if (!start || !end) return "Time not available";
        const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
        const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };
        const startDate = new Date(start);
        const endDate = new Date(end);
        return (
            <div className="event-datetime">
                <span>🕒 {startDate.toLocaleDateString('en-GB', optionsDate)} at {startDate.toLocaleTimeString('en-GB', optionsTime)}</span>
                <small>until</small>
                <span>⏰ {endDate.toLocaleDateString('en-GB', optionsDate)} at {endDate.toLocaleTimeString('en-GB', optionsTime)}</span>
            </div>
        );
    };

    const handleCreate = async () => {
        setError(""); setMessage("");

        if (!formData.title.trim()) return setError("Title is required.");
        if (!formData.description.trim()) return setError("Description is required.");
        if (!formData.location.venue || !formData.location.city) return setError("Venue and city required.");
        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) return setError("End must be after start.");
        if (!isStartDateInFuture(formData.startDateTime)) return setError("Start cannot be in the past.");
        if (!formData.image) return setError("Image is required.");
        if (formData.description.length > 200) return setError("Description cannot exceed 200 chars.");

        setLoading(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("startDate", convertLocalDateTimeToISO(formData.startDateTime));
            data.append("endDate", convertLocalDateTimeToISO(formData.endDateTime));
            data.append("venue", formData.location.venue);
            data.append("city", formData.location.city);
            data.append("source", "manual");
            data.append("image", formData.image);

            await createEvent(data, token);

            resetForm();
            setShowForm(false);
            setMessage("Event created successfully.");
            fetchEvents();
        } catch (err) {
            console.error(err);
            setError("Failed to create event.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setError(""); setMessage("");

        if (!formData.title.trim()) return setError("Title is required.");
        if (!formData.description.trim()) return setError("Description is required.");
        if (!formData.location.venue || !formData.location.city) return setError("Venue and city required.");
        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) return setError("End must be after start.");
        if (!isStartDateInFuture(formData.startDateTime)) return setError("Start cannot be in the past.");

        setLoading(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("startDate", convertLocalDateTimeToISO(formData.startDateTime));
            data.append("endDate", convertLocalDateTimeToISO(formData.endDateTime));
            data.append("venue", formData.location.venue);
            data.append("city", formData.location.city);
            if (formData.image) data.append("image", formData.image);

            await updateEvent(eventIdToEdit, data);
            fetchEvents();
            resetForm();
            setShowForm(false);
            setMessage("Event updated successfully.");
        } catch (err) {
            console.error(err);
            setError("Failed to update event.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setError(""); setMessage(""); setLoading(true);
        try {
            await deleteEvent(id);
            setMessage("Event deleted successfully.");
            fetchEvents();
        } catch (err) {
            console.error(err);
            setError("Failed to delete event.");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (event) => {
        const eventStart = new Date(event.startDate);
        const now = new Date();

        if (eventStart < now) {
            setError("Cannot edit an event that has already occurred.");
            return;
        }

        setEventIdToEdit(event._id);
        setFormData({
            title: event.title || "",
            description: event.description || "",
            location: { venue: event.location?.venue || "", city: event.location?.city || "" },
            startDateTime: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
            endDateTime: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
            image: null
        });
        setShowForm(true); setError(""); setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => { resetForm(); setShowForm(false); setError(""); setMessage(""); };

    return (
        <div className="dashboard-container">
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100px",
                    width: "100%",
                    maxWidth: "12000px",
                    backgroundColor: "#f0f8ff",
                    borderRadius: "8px",
                    textAlign: "center",
                    margin: "20px auto",
                    padding: "10px 15px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                }}
            >
                <h2 style={{ fontSize: "1.2rem", marginBottom: "5px", color: "#333" }}>
                    Welcome to Event Platform Dashboard
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#555", margin: 0 }}>
                    Manage your events, check attendees, and keep everything organized!
                </p>
            </div>


            {(showForm || eventIdToEdit) && (
                <div className="event-form-container">
                    <h3>{eventIdToEdit ? "Edit Event" : "Create Event"}</h3>
                    <form onSubmit={e => { e.preventDefault(); eventIdToEdit ? handleUpdate() : handleCreate(); }}>
                        <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <textarea placeholder="Description" value={formData.description} maxLength={200} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <small>{formData.description.length}/200</small>
                        <input type="text" placeholder="Venue" value={formData.location.venue} onChange={e => setFormData({ ...formData, location: { ...formData.location, venue: e.target.value } })} />
                        <input type="text" placeholder="City" value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                        <input type="datetime-local" value={formData.startDateTime} onChange={e => setFormData({ ...formData, startDateTime: e.target.value })} />
                        <input type="datetime-local" value={formData.endDateTime} onChange={e => setFormData({ ...formData, endDateTime: e.target.value })} />
                        <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} required={!eventIdToEdit} />
                        {error && <p className="error">{error}</p>}
                        {message && <p className="success">{message}</p>}
                        <div className="form-buttons">
                            <button type="submit">{loading ? (eventIdToEdit ? "Updating..." : "Creating...") : (eventIdToEdit ? "Update Event" : "Create Event")}</button>
                            <button type="button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="event-list-container">
                {!showForm && (
                    <button className="btn-new" onClick={() => { resetForm(); setShowForm(true); setError(""); setMessage(""); }}>+ Create new event</button>
                )}
                {loading && !showForm ? <p>Loading events...</p> :
                    events.length === 0 ? <p>No events created yet.</p> :
                        <ul className="event-list my-event-list">
                            {events.map(event => {
                                const isPast = new Date(event.startDate) < new Date();
                                return (
                                    <li key={event._id} className="event-card">
                                        <div className="event-actions">
                                            <button
                                                onClick={() => startEditing(event)}
                                                disabled={isPast}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                disabled={isPast}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <img src={event.image || "/placeholder.jpg"} alt={event.title} className="event-image" />
                                        <h5>{event.title}</h5>
                                        <p style={{ marginBottom: '10px' }}>{event.description}</p>
                                        <p style={{ marginBottom: '10px' }}>📍 {event.location?.venue}, {event.location?.city}</p>
                                        {formatDateTimeRangeMultiline(event.startDate, event.endDate)}
                                        <p>Attendees: {event.attendees?.length || 0}</p>
                                    </li>
                                );
                            })}
                        </ul>
                }
            </div>
        </div>
    );
};

export default StaffDashboard;
