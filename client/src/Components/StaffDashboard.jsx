import React, { useState, useEffect } from "react";
import { createEvent, updateEvent, deleteEvent, getManualEvents } from "../services/api";
import { useUser } from "../context/UserContext";
import '../../css/StaffDashboard.css';

const StaffDashboard = () => {
    const { token } = useUser();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        location: {
            venue: "",
            city: "",
        },
        image: null
    });

    const [eventIdToEdit, setEventIdToEdit] = useState(null);
    const [error, setError] = useState("");
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchEvents = async () => {
        setLoading(true);
        setError("");
        try {
            const userEvents = await getManualEvents();
            setEvents(Array.isArray(userEvents) ? userEvents : []);
        } catch (err) {
            console.error("Failed to fetch events:", err.response?.data || err.message);
            setError("Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const convertLocalDateTimeToISO = (localDateTime) => {
        if (!localDateTime) return null;
        return new Date(localDateTime).toISOString();
    };

    const formatDateTimeRangeMultiline = (start, end) => {
        if (!start || !end) return "Time not available";

        const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
        const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };

        const startDate = new Date(start);
        const endDate = new Date(end);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ marginBottom: 2 }}>🕒 {startDate.toLocaleDateString('en-GB', optionsDate)} at {startDate.toLocaleTimeString('en-GB', optionsTime)}</span>
                <small style={{ fontWeight: 'normal', color: '#666', alignSelf: 'center', marginBottom: 2 }}>until</small>
                <span>⏰ {endDate.toLocaleDateString('en-GB', optionsDate)} at {endDate.toLocaleTimeString('en-GB', optionsTime)}</span>
            </div>
        );
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            location: { venue: "", city: "" },
            startDateTime: "",
            endDateTime: "",
            image: null
        });
    };

    const isDateRangeValid = (start, end) => start && end && new Date(start) < new Date(end);
    const isStartDateInFuture = (start) => start && new Date(start) >= new Date();

    const handleCreate = async () => {
        setError("");
        setMessage("");

        if (!formData.title.trim()) {
            setError("Title is required.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Description is required.");
            return;
        }

        if (!formData.location.venue || !formData.location.city) {
            setError("Both venue and city are required.");
            return;
        }

        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) {
            setError("End date/time must be after start date/time.");
            return;
        }

        if (!isStartDateInFuture(formData.startDateTime)) {
            setError("Start date/time cannot be in the past.");
            return;
        }

        if (!formData.image) {  // Ensure image is provided
            setError("Image is required for manual events.");
            return;
        }

        setLoading(true);

        try {
            const eventFormData = new FormData();
            eventFormData.append("title", formData.title);
            eventFormData.append("description", formData.description);
            eventFormData.append("startDate", convertLocalDateTimeToISO(formData.startDateTime));
            eventFormData.append("endDate", convertLocalDateTimeToISO(formData.endDateTime));
            eventFormData.append("city", formData.location.city);
            eventFormData.append("venue", formData.location.venue);
            eventFormData.append("source", "manual");
            eventFormData.append("image", formData.image); // The File object from input

            await createEvent(eventFormData, token);

            resetForm();
            setShowForm(false);
            setMessage("Event created successfully.");
            fetchEvents();
        } catch (err) {
            console.error("Create error:", err.response?.data || err.message);
            setError("Failed to create event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setError(""); setMessage("");

        if (!formData.title.trim()) { setError("Title is required."); return; }
        if (!formData.description.trim()) { setError("Description is required."); return; }
        if (!formData.location.venue || !formData.location.city) { setError("Both venue and city are required."); return; }
        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) { setError("End date/time must be after start date/time."); return; }
        if (!isStartDateInFuture(formData.startDateTime)) { setError("Start date/time cannot be in the past."); return; }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("location", JSON.stringify(formData.location));
            data.append("startDate", convertLocalDateTimeToISO(formData.startDateTime));
            data.append("endDate", convertLocalDateTimeToISO(formData.endDateTime));
            if (formData.image) data.append("image", formData.image); // optional for update

            await updateEvent(eventIdToEdit, data, token);

            resetForm();
            setEventIdToEdit(null);
            setShowForm(false);
            setMessage("Event updated successfully.");
            fetchEvents();
        } catch (err) {
            console.error("Update error:", err);
            setError(err.response?.data?.message || "Failed to update event. Please try again.");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        setError(""); setMessage(""); setLoading(true);
        try { await deleteEvent(id, token); setMessage("Event deleted successfully."); fetchEvents(); }
        catch (err) { console.error("Delete error:", err); setError("Failed to delete event. Please try again."); }
        finally { setLoading(false); }
    };

    const startEditing = (event) => {
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

    const handleCancel = () => { resetForm(); setEventIdToEdit(null); setShowForm(false); setError(""); setMessage(""); };

    return (
        <div className="container py-5">
            {(showForm || eventIdToEdit) && (
                <>
                    <h3 className="mb-4 text-center fw-semibold">Staff Event Management</h3>
                    <form onSubmit={(e) => { e.preventDefault(); eventIdToEdit ? handleUpdate() : handleCreate(); }} noValidate>
                        <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required disabled={loading} className="form-control mb-3" />
                        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required disabled={loading} className="form-control mb-3" />
                        <input type="text" placeholder="Venue" value={formData.location.venue} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, venue: e.target.value } })} required disabled={loading} className="form-control mb-3" />
                        <input type="text" placeholder="City" value={formData.location.city} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} required disabled={loading} className="form-control mb-3" />
                        <input type="datetime-local" value={formData.startDateTime} onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })} required disabled={loading} className="form-control mb-3" />
                        <input type="datetime-local" value={formData.endDateTime} onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })} required disabled={loading} className="form-control mb-3" />
                        <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} required={!eventIdToEdit} className="form-control mb-3" />

                        {error && <p className="text-danger">{error}</p>}
                        {message && <p className="text-success">{message}</p>}

                        <div className="d-flex gap-3">
                            <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>{loading ? (eventIdToEdit ? "Updating..." : "Creating...") : eventIdToEdit ? "Update Event" : "Create Event"}</button>
                            <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={handleCancel} disabled={loading}>Cancel</button>
                        </div>
                    </form>
                    <hr />
                </>
            )}

            <h3 className="mb-4 text-center fw-semibold">Staff Created Events</h3>

            {!showForm && (
                <div className="text-center mb-4">
                    <button className="btn btn-primary btn-lg" onClick={() => { resetForm(); setEventIdToEdit(null); setShowForm(true); setError(""); setMessage(""); }} disabled={loading}>+ Create new event</button>
                </div>
            )}

            {loading && !showForm ? <p className="text-center text-muted">Loading events...</p> :
                events.length === 0 ? <p className="text-muted text-center fst-italic">No events created yet.</p> :
                    <ul className="event-list">
                        {events.map((event) => (
                            <li key={event._id} className="event-card">
                                <div className="mt-3 d-flex gap-2 mb-4 justify-content-end">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => startEditing(event)} disabled={loading}>Edit</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(event._id)} disabled={loading}>Delete</button>
                                </div>
                                <h5>{event.title}</h5>
                                <p>{event.description}</p>
                                <p>📍 {event.location?.venue}, {event.location?.city}</p>
                                <div>{formatDateTimeRangeMultiline(event.startDate, event.endDate)}</div>
                                {event.image && <img src={`http://localhost:5000/uploads/${event.image}`} alt={event.title} style={{ maxWidth: "100%", marginTop: "10px" }} />}
                            </li>
                        ))}
                    </ul>
            }
        </div>
    );
};

export default StaffDashboard;

