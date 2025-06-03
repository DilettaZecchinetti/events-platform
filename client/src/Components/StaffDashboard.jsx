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
            const newEvent = await createEvent(
                {
                    ...formData,
                    startDate: formData.startDateTime,
                    endDate: formData.endDateTime,
                },
                token
            );
            console.log("Created:", newEvent);
            resetForm();
            fetchEvents();
        } catch (err) {
            console.error("Create error:", err.message);
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
        <div>
            <h2>Staff Event Management</h2>
            <div>
                <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                />
                <input
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                />
                <button onClick={eventIdToEdit ? handleUpdate : handleCreate}>
                    {eventIdToEdit ? "Update Event" : "Create Event"}
                </button>
                {eventIdToEdit && (
                    <button onClick={() => {
                        resetForm();
                        setEventIdToEdit(null);
                    }}>
                        Cancel Edit
                    </button>
                )}
            </div>

            <hr />

            <h3>Staff Events</h3>
            {events.length === 0 ? (
                <p>No events created yet.</p>
            ) : (
                <ul>
                    {events.map((event) => (
                        <li key={event._id}>
                            <strong>{event.title}</strong> - {event.description}
                            <br />
                            <em>
                                {new Date(event.startDate).toLocaleString()} to {new Date(event.endDate).toLocaleString()}
                            </em>
                            <br />
                            <button onClick={() => startEditing(event)}>Edit</button>
                            <button onClick={() => handleDelete(event._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StaffDashboard;
