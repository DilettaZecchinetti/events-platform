import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext.jsx";
import { signupForEvent } from "../services/api.js";
import { useNavigate } from "react-router-dom";

const ManualEventList = () => {
    const { user } = useUser(); // still using this to check if logged in
    const [events, setEvents] = useState([]);
    const [signupLoading, setSignupLoading] = useState({});
    const [calendarLoading, setCalendarLoading] = useState({});
    const [signupMessage, setSignupMessage] = useState('');
    const [calendarMessage, setCalendarMessage] = useState('');
    const [calendarError, setCalendarError] = useState('');

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/events/manual`, {
                    withCredentials: true,
                });

                const manualEvents = res.data.filter(event => event.source === "manual");
                setEvents(manualEvents);
            } catch (err) {
                console.error("Error fetching manual events:", err);
            }
        };

        fetchEvents();
    }, []);

    const handleSignUp = async (eventId) => {
        if (!user) {
            setSignupMessage("You need to log in to sign up for this event.");
            return;
        }

        setSignupLoading((prev) => ({ ...prev, [eventId]: true }));
        setSignupMessage("");

        try {
            const result = await signupForEvent(eventId);
            setSignupMessage(result.message || "Successfully signed up for the event!");
        } catch (err) {
            console.error("Signup failed:", err);
            setSignupMessage(err.response?.data?.error || "Failed to sign up. Please try again.");
        } finally {
            setSignupLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const handleAddToCalendar = async (eventData) => {
        if (!user) {
            setCalendarError("You need to log in to add this event to your calendar.");
            return;
        }

        const eventId = eventData._id;
        setCalendarLoading((prev) => ({ ...prev, [eventId]: true }));
        setCalendarMessage('');
        setCalendarError('');

        try {
            const res = await axios.post(
                `${API_BASE}/api/calendar/add-event`,
                {
                    eventId,
                    summary: eventData.title,
                    description: eventData.description,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                },
                {
                    withCredentials: true,
                }
            );

            if (res.data.msg && res.data.msg.toLowerCase().includes("successfully added")) {
                setCalendarMessage(res.data.msg);
            } else if (res.data.requiresAuth === true) {
                const oauthRes = await axios.get(`${API_BASE}/api/calendar/oauth`, {
                    withCredentials: true,
                });

                const oauthUrl = oauthRes.data.url;
                window.open(oauthUrl, "_blank", "width=500,height=600");
                setCalendarMessage("Please complete the calendar connection in the new window.");
            } else if (res.data.error) {
                setCalendarError(res.data.error);
            } else {
                setCalendarError("Unexpected response from server.");
            }
        } catch (err) {
            console.error("Error adding to calendar:", err);
            setCalendarError("Failed to add event to calendar.");
        } finally {
            setCalendarLoading((prev) => ({ ...prev, [eventId]: false }));
            window.scrollTo({ top: 0, behavior: "smooth" });
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
            {calendarMessage && (
                <div className="alert alert-success" role="alert">
                    {calendarMessage}
                </div>
            )}
            {calendarError && (
                <div className="alert alert-danger" role="alert">
                    {calendarError}
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
                                <p className="card-text">📍 {event.location}</p>
                                <p className="card-subtitle mb-2 text-muted">
                                    {(() => {
                                        const formatDateTime = (isoString) => {
                                            const date = new Date(isoString);
                                            const formattedDate = date.toLocaleDateString("en-GB").replaceAll("/", "-");
                                            const formattedTime = date.toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                            });
                                            return `${formattedDate} at ${formattedTime}`;
                                        };

                                        return `${formatDateTime(event.startDate)} – ${formatDateTime(event.endDate)}`;
                                    })()}
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
