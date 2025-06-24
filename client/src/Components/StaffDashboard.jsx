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
        const [datePart, timePart] = localDateTime.split("T");
        return `${datePart}T${timePart}:00`;
    };

    const formatDateTimeRangeMultiline = (start, end) => {
        if (!start || !end) return "Time not available";

        const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
        const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };

        const startDate = new Date(start);
        const endDate = new Date(end);

        const formattedStart = `${startDate.toLocaleDateString('en-GB', optionsDate)} at ${startDate.toLocaleTimeString('en-GB', optionsTime)}`;
        const formattedEnd = `${endDate.toLocaleDateString('en-GB', optionsDate)} at ${endDate.toLocaleTimeString('en-GB', optionsTime)}`;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ marginBottom: 2 }}>🕒 {formattedStart}</span>
                <small
                    style={{
                        fontWeight: 'normal',
                        color: '#666',
                        alignSelf: 'center',
                        marginBottom: 2
                    }}
                >
                    until
                </small>
                <span>⏰ {formattedEnd}</span>
            </div>


        );
    };


    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            location: {
                venue: "",
                city: "",
            },
            startDateTime: "",
            endDateTime: "",
        });
    };

    const isDateRangeValid = (start, end) => {
        if (!start || !end) return false;
        return new Date(start) < new Date(end);
    };

    const isStartDateInFuture = (start) => {
        if (!start) return false;
        return new Date(start) >= new Date();
    };


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

        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) {
            setError("End date/time must be after start date/time.");
            return;
        }

        if (!isStartDateInFuture(formData.startDateTime)) {
            setError("Start date/time cannot be in the past.");
            return;
        }
        if (!formData.location.venue || !formData.location.city) {
            setError("Both venue and city are required.");
            return;
        }

        setLoading(true);
        try {
            await createEvent({
                title: formData.title,
                description: formData.description,
                location: {
                    venue: formData.location.venue,
                    city: formData.location.city,
                },
                startDate: convertLocalDateTimeToISO(formData.startDateTime),
                endDate: convertLocalDateTimeToISO(formData.endDateTime),
            });

            resetForm();
            setShowForm(false);
            setMessage("Event created successfully.");
            fetchEvents();
        } catch (err) {
            console.error("Create error:", err.message);
            setError("Failed to create event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
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

        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) {
            setError("End date/time must be after start date/time.");
            return;
        }

        if (!isStartDateInFuture(formData.startDateTime)) {
            setError("Start date/time cannot be in the past.");
            return;
        }
        if (!formData.location.venue || !formData.location.city) {
            setError("Both venue and city are required.");
            return;
        }

        setLoading(true);
        try {
            await updateEvent(
                eventIdToEdit,
                {
                    title: formData.title,
                    description: formData.description,
                    location: {
                        venue: formData.location.venue,
                        city: formData.location.city,
                    },
                    startDate: convertLocalDateTimeToISO(formData.startDateTime),
                    endDate: convertLocalDateTimeToISO(formData.endDateTime),
                },
                token
            );

            resetForm();
            setEventIdToEdit(null);
            setShowForm(false);
            setMessage("Event updated successfully.");
            fetchEvents();
        } catch (err) {
            console.error("Update error:", err.message);
            setError("Failed to update event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await deleteEvent(id, token);
            setMessage("Event deleted successfully.");
            fetchEvents();
        } catch (err) {
            console.error("Delete error:", err.message);
            setError("Failed to delete event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (event) => {
        setEventIdToEdit(event._id);
        setFormData({
            title: event.title || "",
            description: event.description || "",
            location: {
                venue: event.location?.venue || "",
                city: event.location?.city || "",
            },
            startDateTime: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
            endDateTime: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        });
        setShowForm(true);
        setError("");
        setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        resetForm();
        setEventIdToEdit(null);
        setShowForm(false);
        setError("");
        setMessage("");
    };

    return (
        <div className="container py-5">
            {(showForm || eventIdToEdit) && (
                <>
                    <h3 className="mb-4 text-center fw-semibold">Staff Event Management</h3>

                    <div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                eventIdToEdit ? handleUpdate() : handleCreate();
                            }}
                            noValidate
                        >
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    autoComplete="off"
                                    required
                                    aria-label="Event Title"
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-4">
                                <textarea
                                    className="form-control form-control-lg"
                                    placeholder="Description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    aria-label="Event Description"
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Venue"
                                    value={formData.location.venue}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: { ...formData.location, venue: e.target.value },
                                        })
                                    }
                                    autoComplete="off"
                                    required
                                    aria-label="Event Venue"
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="City"
                                    value={formData.location.city}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: { ...formData.location, city: e.target.value },
                                        })
                                    }
                                    autoComplete="off"
                                    required
                                    aria-label="Event City"
                                    disabled={loading}
                                />
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <label htmlFor="startDateTime" className="form-label fw-semibold">
                                        Start Date & Time
                                    </label>
                                    <input
                                        id="startDateTime"
                                        type="datetime-local"
                                        className="form-control form-control-lg"
                                        value={formData.startDateTime}
                                        onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                                        required
                                        aria-describedby="startDateTimeHelp"
                                        disabled={loading}
                                    />
                                    <div id="startDateTimeHelp" className="form-text">
                                        When the event starts
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="endDateTime" className="form-label fw-semibold">
                                        End Date & Time
                                    </label>
                                    <input
                                        id="endDateTime"
                                        type="datetime-local"
                                        className="form-control form-control-lg"
                                        value={formData.endDateTime}
                                        onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                                        required
                                        aria-describedby="endDateTimeHelp"
                                        disabled={loading}
                                    />
                                    <div id="endDateTimeHelp" className="form-text">
                                        When the event ends
                                    </div>
                                </div>

                                {error && <p className="form-error text-danger mt-2">{error}</p>}
                                {message && <p className="form-message text-success mt-2">{message}</p>}
                            </div>

                            <div className="d-flex gap-3">
                                <button type="submit" className="btn btn-primary btn-lg flex-grow-1 shadow-sm" disabled={loading}>
                                    {loading ? (eventIdToEdit ? "Updating..." : "Creating...") : eventIdToEdit ? "Update Event" : "Create Event"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-lg flex-grow-1"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    <hr />
                </>
            )}

            <h3 className="mb-4 text-center fw-semibold">Staff Created Events</h3>

            {!showForm && (
                <div className="text-center mb-4">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => {
                            resetForm();
                            setEventIdToEdit(null);
                            setShowForm(true);
                            setError("");
                            setMessage("");
                        }}
                        disabled={loading}
                    >
                        + Create new event
                    </button>
                </div>
            )}

            {loading && !showForm ? (
                <p className="text-center text-muted">Loading events...</p>
            ) : events.length === 0 ? (
                <p className="text-muted text-center fst-italic">No events created yet.</p>
            ) : (
                <ul className="event-list">
                    {events.map((event) => (
                        <li
                            key={event._id}
                            className="event-card"
                            role="listitem"
                            tabIndex={0}
                            aria-label={`Event titled ${event.title}`}
                        >
                            <div className="mt-3 d-flex gap-2 mb-4 justify-content-end">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => startEditing(event)}
                                    disabled={loading}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(event._id)}
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                            </div>

                            <h5>{event.title}</h5>
                            <p>{event.description}</p>
                            <p>📍 {event.location?.venue}, {event.location?.city}</p>
                            <div>{formatDateTimeRangeMultiline(event.startDate, event.endDate)}</div>

                        </li>
                    ))}
                </ul>
            )}
        </div>

    );
};

export default StaffDashboard;
