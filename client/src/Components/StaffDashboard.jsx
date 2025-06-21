import React, { useState, useEffect } from "react";
import { createEvent, updateEvent, deleteEvent, getManualEvents } from "../services/api";
import { useUser } from "../context/UserContext";
import { v4 as uuidv4 } from "uuid";
import '../../css/StaffDashboard.css'

const StaffDashboard = () => {
    const { token } = useUser();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        location: "",
    });

    const [eventIdToEdit, setEventIdToEdit] = useState(null);
    const [error, setError] = useState("");
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const fetchEvents = async () => {
        try {
            const userEvents = await getManualEvents();
            console.log("Fetched events:", userEvents);
            const normalizedEvents = Array.isArray(userEvents)
                ? userEvents.map((event) => ({ ...event, _id: event._id }))
                : [];
            setEvents(normalizedEvents);
            return normalizedEvents;
        } catch (err) {
            console.error("Failed to fetch events:", err.response?.data || err.message);
            return [];
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const userEvents = await getManualEvents();
                console.log("Fetched events:", userEvents);
                setEvents(userEvents);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        fetchEvents();
    }, []);


    const convertLocalDateTimeToISO = (localDateTime) => {
        if (!localDateTime) return null;
        const date = new Date(localDateTime);
        return date.toISOString();
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            location: "",
            startDateTime: "",
            endDateTime: "",
        });
    };

    const isDateRangeValid = (start, end) => {
        if (!start || !end) return false;
        return new Date(start) < new Date(end);
    };


    const handleCreate = async () => {
        console.log("handleCreate called");

        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) {
            setError("End date/time must be after start date/time.");
            return;
        }

        try {
            await createEvent({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                startDate: convertLocalDateTimeToISO(formData.startDateTime),
                endDate: convertLocalDateTimeToISO(formData.endDateTime),
            });

            console.log("Event creation complete");

            resetForm();
            setShowForm(false);
            setError("");
            fetchEvents();
        } catch (err) {
            console.error("Create error:", err.message);
            setError("Failed to create event. Please try again.");
        }
    };




    const handleUpdate = async () => {
        if (!isDateRangeValid(formData.startDateTime, formData.endDateTime)) {
            setError("End date/time must be after start date/time.");
            return;
        }

        try {
            await updateEvent(
                eventIdToEdit,
                {
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    startDate: convertLocalDateTimeToISO(formData.startDateTime),
                    endDate: convertLocalDateTimeToISO(formData.endDateTime),
                },
                token
            );

            resetForm();
            setEventIdToEdit(null);
            setShowForm(false);
            fetchEvents();
            setError("");
        } catch (err) {
            setError("Failed to update event. Please try again.");
            console.error("Update error:", err.message);
        }
    };


    const handleDelete = async (id) => {
        try {
            await deleteEvent(id, token);
            fetchEvents();
        } catch (err) {
            console.error("Delete error:", err.message);
        }
    };

    const startEditing = (event) => {
        setEventIdToEdit(event._id);
        setFormData({
            title: event.title || "",
            description: event.description || "",
            location: event.location || "",
            startDateTime: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
            endDateTime: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        });
        setShowForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const handleCancel = () => {
        resetForm();
        setEventIdToEdit(null);
        setShowForm(false);
    };

    return (
        <div className="container py-5">
            {(showForm || eventIdToEdit) && (
                <>
                    <h3 className="mb-4 text-center fw-semibold">Staff Event Management</h3>

                    <div className="">
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
                                />
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="Location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    autoComplete="off"
                                    required
                                    aria-label="Event Location"
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
                                    />
                                    <div id="endDateTimeHelp" className="form-text">
                                        When the event ends
                                    </div>
                                </div>
                                {error && <p className="form-error">{error}</p>}

                            </div>

                            <div className="d-flex gap-3">
                                <button type="submit" className="btn btn-primary btn-lg flex-grow-1 shadow-sm">
                                    {eventIdToEdit ? "Update Event" : "Create Event"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-lg flex-grow-1"
                                    onClick={handleCancel}
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
                        }}
                    >
                        + Create new event
                    </button>
                </div>
            )}

            {events.length === 0 ? (
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
                            <div className="event-header">
                                <h4 className="event-title">{event.title}</h4>
                                <div className="event-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => startEditing(event)}
                                        aria-label={`Edit event titled ${event.title}`}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => handleDelete(event._id)}
                                        aria-label={`Delete event titled ${event.title}`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <p className="event-description">{event.description}</p>
                            <p className="event-location">
                                📍{" "}
                                {typeof event.location === "string"
                                    ? event.location
                                    : `${event.location?.venue || ""}, ${event.location?.city || ""}`}
                            </p>


                            <p className="event-datetime">
                                <span role="img" aria-label="calendar">
                                    📅
                                </span>{" "}
                                {event.startDate ? new Date(event.startDate).toLocaleString() : "N/A"} –{" "}
                                {event.endDate ? new Date(event.endDate).toLocaleString() : "N/A"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

};

export default StaffDashboard;
