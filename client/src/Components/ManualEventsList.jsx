import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext.jsx";
import { signupForEvent } from "../services/api.js";
import { useNavigate } from "react-router-dom";

const ManualEventList = () => {
    const { token } = useUser();
    const [events, setEvents] = useState([]);
    const [signupLoading, setSignupLoading] = useState({});
    const [calendarLoading, setCalendarLoading] = useState({});
    const [signupMessage, setSignupMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/events/manual", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching manual events:", err);
            }
        };

        fetchEvents();
    }, [token]);

    const handleSignUp = async (eventId) => {
        if (!token) {
            setSignupMessage("You need to log in to sign up for this event.");
            return;
        }

        setSignupLoading((prev) => ({ ...prev, [eventId]: true }));
        setSignupMessage("");

        try {
            const result = await signupForEvent(eventId, token);
            setSignupMessage(result.message || "Successfully signed up for the event!");
        } catch (err) {
            console.error("Signup failed:", err);
            setSignupMessage(err.response?.data?.error || "Failed to sign up. Please try again.");
        } finally {
            setSignupLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const handleAddToCalendar = async (eventData) => {
        if (!token) {
            alert("You need to log in to add this event to your calendar.");
            return;
        }

        const eventId = eventData._id;
        setCalendarLoading((prev) => ({ ...prev, [eventId]: true }));

        try {
            const res = await axios.post(
                "http://localhost:5000/api/calendar/add-event",
                {
                    eventId,
                    summary: eventData.title,
                    description: eventData.description,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            if (res.data.success) {
                alert("Event successfully added to your Google Calendar!");
            } else if (res.data.requiresAuth) {
                const oauthRes = await axios.get("http://localhost:5000/api/calendar/oauth", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });

                const oauthUrl = oauthRes.data.url;
                window.open(oauthUrl, "_blank", "width=500,height=600");
                alert("Please complete the calendar connection.");
            }
        } catch (err) {
            console.error("Error adding to calendar:", err);
            alert("Failed to add event to calendar.");
        } finally {
            setCalendarLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    return (
        <div className="container my-4">
            <h2 className="h4 mb-4">Staff Curated Events</h2>

            {signupMessage && (
                <div className="alert alert-success" role="alert">
                    {signupMessage}
                </div>
            )}

            {events.length === 0 ? (
                <p>No manual events available.</p>
            ) : (
                <ul className="list-unstyled">
                    {events.map((event) => (
                        <li key={event._id} className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{event.title}</h5>
                                <p className="card-text">{event.description}</p>
                                <p className="card-subtitle mb-2 text-muted">
                                    {new Date(event.startDate).toLocaleString()} –{" "}
                                    {new Date(event.endDate).toLocaleString()}
                                </p>

                                <div className="mt-3 d-flex gap-2">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleSignUp(event._id)}
                                        disabled={signupLoading[event._id]}
                                    >
                                        {signupLoading[event._id] ? "Signing up..." : "Sign Up"}
                                    </button>

                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleAddToCalendar(event)}
                                        disabled={calendarLoading[event._id]}
                                    >
                                        {calendarLoading[event._id] ? "Adding..." : "Add to Calendar"}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        </div>
    );

};

export default ManualEventList;
