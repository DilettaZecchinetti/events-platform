import React, { useState, useEffect } from "react";
import { createEvent, updateEvent, deleteEvent, getManualEvents } from "../services/api";
import { useUser } from "../context/UserContext";

const StaffDashboard = () => {
    const { token } = useUser();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
    });
    const [eventIdToEdit, setEventIdToEdit] = useState(null);
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const userEvents = await getManualEvents();
            const normalizedEvents = Array.isArray(userEvents)
                ? userEvents.map(event => ({ ...event, _id: event._id }))
                : [];

            setEvents(normalizedEvents);
        } catch (err) {
            console.error("Failed to fetch events:", err.message);
        }
    };

    useEffect(() => {
        if (token) fetchEvents();
    }, [token]);

    const handleCreate = async () => {
        try {
            const payload = {
                ...formData,
                startDate: formData.startDateTime,
                endDate: formData.endDateTime,
                externalId: "some-unique-id"
            };

            console.log("Creating event with payload:", payload);
            console.log("Using token:", token);

            const newEvent = await createEvent(payload, token);

            console.log("Created:", newEvent);
            resetForm();
            fetchEvents();
        } catch (err) {
            if (err.response) {
                console.error("Create error response:", err.response.data);
            } else {
                console.error("Create error:", err.message);
            }
        }
    };


    const handleUpdate = async () => {
        try {
            const updated = await updateEvent(
                eventIdToEdit,
                {
                    ...formData,
                    startDate: formData.startDateTime,
                    endDate: formData.endDateTime,
                },
                token
            );
            console.log("Updated:", updated);
            resetForm();
            setEventIdToEdit(null);
            fetchEvents();
        } catch (err) {
            console.error("Update error:", err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteEvent(id, token);
            console.log("Deleted event:", id);
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
            startDateTime: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
            endDateTime: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        });
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            startDateTime: "",
            endDateTime: "",
        });
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Staff Event Management</h2>

            <div className="mb-5">
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <textarea
                        className="form-control"
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.startDateTime}
                        onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.endDateTime}
                        onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                    />
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary"
                        onClick={eventIdToEdit ? handleUpdate : handleCreate}
                    >
                        {eventIdToEdit ? "Update Event" : "Create Event"}
                    </button>

                    {eventIdToEdit && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                resetForm();
                                setEventIdToEdit(null);
                            }}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </div>

            <hr />

            <h3 className="mb-3">Staff Created Events</h3>

            {events.length === 0 ? (
                <p className="text-muted">No events created yet.</p>
            ) : (
                <ul className="list-group">
                    {events.map((event) => (
                        <li key={event._id} className="list-group-item">
                            <div className="fw-bold">{event.title}</div>
                            <div>{event.description}</div>
                            <div className="text-muted small">
                                {new Date(event.startDate).toLocaleString()} –{" "}
                                {new Date(event.endDate).toLocaleString()}
                            </div>
                            <div className="mt-2 d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => startEditing(event)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(event._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

};

export default StaffDashboard;
