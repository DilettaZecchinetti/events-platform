import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext.jsx";
import { signupForEvent } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import "../../css/ManualEventsList.css";

const ManualEventList = () => {
    const { user } = useUser();
    const [events, setEvents] = useState([]);
    const [signupLoading, setSignupLoading] = useState({});
    const [calendarLoading, setCalendarLoading] = useState({});
    const [signupMessage, setSignupMessage] = useState("");
    const [calendarMessage, setCalendarMessage] = useState("");
    const [calendarError, setCalendarError] = useState("");

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/events/manual`, {
                    withCredentials: true,
                });

                const manualEvents = res.data.filter((event) => event.source === "manual");
                setEvents(manualEvents);
            } catch (err) {
                console.error("Error fetching manual events:", err);
            }
        };

        fetchEvents();
    }, []);

    const now = new Date();
    const upcomingEvents = events.filter((event) => new Date(event.endDate) >= now);
    const pastEvents = events.filter((event) => new Date(event.endDate) < now);

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

    const handleSignUp = async (eventId) => {
        if (!user) {
            setSignupMessage({ eventId, text: "You need to log in to sign up for this event." });
            return;
        }

        setSignupLoading((prev) => ({ ...prev, [eventId]: true }));
        setSignupMessage("");

        try {
            const result = await signupForEvent(eventId);
            setSignupMessage({ eventId, text: result.message || "Successfully signed up for the event!" });

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === eventId
                        ? { ...event, attendees: [...(event.attendees || []), user._id] }
                        : event
                )
            );
        } catch (err) {
            console.error("Signup failed:", err);
            setSignupMessage({ eventId, text: err.response?.data?.error || "Failed to sign up. Please try again." });
        } finally {
            setSignupLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const isUserSignedUp = (event) => {
        if (!user) return false;
        return event.attendees && event.attendees.includes(user._id);
    };

    const handleAddToCalendar = async (eventData) => {
        if (!user) {
            setCalendarError({ eventId, text: "You need to log in to add this event to your calendar." });
            return;
        }

        const eventId = eventData._id;
        setCalendarLoading((prev) => ({ ...prev, [eventId]: true }));
        setCalendarMessage("");
        setCalendarError("");

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
                setCalendarMessage({ eventId, text: res.data.msg });
            } else if (res.data.requiresAuth === true) {
                const oauthRes = await axios.get(`${API_BASE}/api/calendar/oauth`, {
                    withCredentials: true,
                });

                const oauthUrl = oauthRes.data.url;
                window.open(oauthUrl, "_blank", "width=500,height=600");
                setCalendarMessage({ eventId, text: "Please complete the calendar connection in the new window." });
            } else if (res.data.error) {
                setCalendarError({ eventId, text: res.data.error });
            } else {
                setCalendarError("Unexpected response from server.");
            }
        } catch (err) {
            console.error("Error adding to calendar:", err);
            setCalendarError({ eventId, text: "Failed to add event to calendar." });

        } finally {
            setCalendarLoading((prev) => ({ ...prev, [eventId]: false }));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const renderEventList = (eventsArray, showButtons = true) => (
        <ul className="event-list">
            {eventsArray.map((event) => (
                <li key={event._id} className="event-card">
                    <div className="event-header">
                        <h3 className="event-title">{event.title}</h3>
                    </div>

                    <p className="event-description">{event.description}</p>
                    <p className="event-location">
                        📍 {event.location?.venue}, {event.location?.city}
                    </p>
                    <br />
                    <div>{formatDateTimeRangeMultiline(event.startDate, event.endDate)}</div>
                    <br />
                    <p className="event-datetime">
                        👥 Attendees: {event.attendees ? event.attendees.length : 0}
                    </p>

                    {showButtons && (
                        <>
                            {/* Inline event messages */}
                            {signupMessage?.eventId === event._id && (
                                <div className="alert alert-success mt-2">{signupMessage.text}</div>
                            )}
                            {calendarMessage?.eventId === event._id && (
                                <div className="alert alert-success mt-2">{calendarMessage.text}</div>
                            )}
                            {calendarError?.eventId === event._id && (
                                <div className="alert alert-danger mt-2">{calendarError.text}</div>
                            )}

                            <div className="event-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSignUp(event._id)}
                                    disabled={signupLoading[event._id] || isUserSignedUp(event)}
                                >
                                    {isUserSignedUp(event)
                                        ? "Already Signed Up"
                                        : signupLoading[event._id]
                                            ? "Signing up..."
                                            : "Sign Up"}
                                </button>

                                <button
                                    className="btn btn-success"
                                    onClick={() => handleAddToCalendar(event)}
                                    disabled={calendarLoading[event._id]}
                                >
                                    {calendarLoading[event._id] ? "Adding..." : "Add to Calendar"}
                                </button>
                            </div>

                        </>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="container my-4">
            <h2 className="text-center mb-5" style={{ fontSize: "2rem", fontWeight: "bold" }}>
                Staff Curated Events
            </h2>

            <section className="mb-5">
                <h3 className="mb-3">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                    <p>No upcoming events available.</p>
                ) : (
                    renderEventList(upcomingEvents)
                )}
            </section>

            <section className="mb-5">
                <h3 className="mb-3">Past Events</h3>
                {pastEvents.length === 0 ? (
                    <p>No past events available.</p>
                ) : (
                    renderEventList(pastEvents, false)
                )}
            </section>

            <div className="text-center">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        </div>
    );

};

export default ManualEventList;
