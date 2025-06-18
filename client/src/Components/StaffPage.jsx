import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import StaffEventManagement from "./StaffEventManagement";
import StaffCreatedEvents from "./StaffCreatedEvents";

function StaffPage() {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        startDateTime: "",
        endDateTime: "",
    });
    const [eventIdToEdit, setEventIdToEdit] = useState(null);

    // Example implementations - adjust accordingly

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            location: "",
            startDateTime: "",
            endDateTime: "",
        });
    };

    const handleCreate = () => {
        const newEvent = { ...formData, _id: Date.now().toString() };
        setEvents((prev) => [...prev, newEvent]);
        resetForm();
    };

    const handleUpdate = () => {
        setEvents((prev) =>
            prev.map((ev) => (ev._id === eventIdToEdit ? { ...ev, ...formData } : ev))
        );
        resetForm();
        setEventIdToEdit(null);
    };

    const handleDelete = (id) => {
        setEvents((prev) => prev.filter((ev) => ev._id !== id));
    };

    const startEditing = (event) => {
        setEventIdToEdit(event._id);
        setFormData({
            title: event.title,
            description: event.description,
            location: event.location,
            startDateTime: event.startDateTime,
            endDateTime: event.endDateTime,
        });
    };

    return (
        <>
            <nav className="navbar navbar-expand navbar-light bg-light mb-4">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        Event Platform
                    </Link>
                    <div className="navbar-nav">
                        <Link className="nav-link" to="/manage">
                            Manage Events
                        </Link>
                        <Link className="nav-link" to="/list">
                            View Events
                        </Link>
                    </div>
                </div>
            </nav>

            <Routes>
                <Route
                    path="/manage"
                    element={
                        <StaffEventManagement
                            formData={formData}
                            setFormData={setFormData}
                            eventIdToEdit={eventIdToEdit}
                            setEventIdToEdit={setEventIdToEdit}
                            handleCreate={handleCreate}
                            handleUpdate={handleUpdate}
                            resetForm={resetForm}
                        />
                    }
                />
                <Route
                    path="/list"
                    element={
                        <StaffCreatedEvents
                            events={events}
                            startEditing={startEditing}
                            handleDelete={handleDelete}
                        />
                    }
                />
                <Route
                    path="/"
                    element={
                        <div className="container py-5 text-center">
                            <h1>Welcome to the Event Platform</h1>
                            <p>
                                Use the navigation links above to manage or view staff events.
                            </p>
                        </div>
                    }
                />
            </Routes>
        </>
    );

}

export default StaffPage;
