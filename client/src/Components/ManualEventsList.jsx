import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import ManualEventCard from "./ManualEventCard.jsx";
import { useUser } from "../context/UserContext.jsx";
import { signupForEvent } from "../services/api.js";
import "../../css/ManualEventsList.css";

const ManualEventList = () => {
    const { user } = useUser();
    const [events, setEvents] = useState([]);
    const [signupLoading, setSignupLoading] = useState({});
    const [calendarLoading, setCalendarLoading] = useState({});
    const [signupMessage, setSignupMessage] = useState("");
    const [calendarMessage, setCalendarMessage] = useState("");
    const [calendarAdded, setCalendarAdded] = useState({});
    const [calendarError, setCalendarError] = useState("");

    const [showPastEvents, setShowPastEvents] = useState(false); // NEW

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

            setEvents((prev) =>
                prev.map((ev) =>
                    ev._id === eventId ? { ...ev, attendees: [...(ev.attendees || []), user._id] } : ev
                )
            );
        } catch (err) {
            console.error("Signup failed:", err);
            setSignupMessage({ eventId, text: err.response?.data?.error || "Failed to sign up. Please try again." });
        } finally {
            setSignupLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const handleAddToCalendar = async (eventData) => {
        if (!user) {
            setCalendarError({
                eventId: eventData._id,
                text: "You need to log in to add this event to your calendar.",
            });
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
                { withCredentials: true }
            );

            if (res.data.msg && res.data.msg.toLowerCase().includes("successfully added")) {
                setCalendarMessage({ eventId, text: res.data.msg });
                setCalendarAdded((prev) => ({ ...prev, [eventId]: true }));
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
        }
    };

    const renderEventList = (eventsArray) => (
        <div className="row">
            {eventsArray.map((event) => (
                <div className="col-md-4 mb-4" key={event._id}>
                    <ManualEventCard
                        event={event}
                        user={user}
                        handleSignUp={handleSignUp}
                        handleAddToCalendar={handleAddToCalendar}
                        signupLoading={signupLoading}
                        calendarLoading={calendarLoading}
                        signupMessage={signupMessage}
                        calendarAdded={calendarAdded}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div
                style={{
                    maxWidth: "90%",
                    width: "100%",
                    margin: "40px auto",
                    textAlign: "center",
                    lineHeight: "1.6",
                    color: "#1F2937",
                    padding: "0 20px",
                    boxSizing: "border-box",
                }}
            >
                <h3
                    style={{
                        marginBottom: "12px",
                        fontSize: "clamp(1.5rem, 4vw, 1.75rem)",
                        fontWeight: "600",
                        position: "relative",
                        display: "inline-block",
                    }}
                >
                    Specially Curated Events by Our Expert Team
                    <span
                        style={{
                            display: "block",
                            height: "3px",
                            width: "60px",
                            backgroundColor: "#4F46E5",
                            marginTop: "6px",
                            borderRadius: "2px",
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                    ></span>
                </h3>

                <p
                    style={{
                        fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                        marginTop: "20px",
                        lineHeight: "1.8",
                        textAlign: "justify",
                        textAlignLast: "center",
                        color: "#1F2937",
                    }}
                >
                    At the Events Platform, we believe that exceptional experiences stem from intentional design and meticulous planning.<br />
                    Our staff doesn't just organize events; we craft immersive journeys that resonate, inspire, and leave lasting impressions.
                </p>
            </div>


            <div className="manual-events container my-4">
                <section className="mb-5">
                    {upcomingEvents.length === 0 ? <p>No upcoming events available.</p> : renderEventList(upcomingEvents)}
                </section>

                <section className="my-4">
                    <div className="text-center mt-5">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowPastEvents((prev) => !prev)}
                        >
                            {showPastEvents ? "Hide Past Events" : "Show Past Events"}
                        </Button>
                    </div>

                    {showPastEvents && (
                        <h4 className="mb-4 text-center text-secondary pt-4">
                            Past Events:
                        </h4>
                    )}

                    {showPastEvents && (
                        pastEvents.length === 0 ? (
                            <p>No past events available.</p>
                        ) : (
                            renderEventList(pastEvents)
                        )
                    )}
                </section>
            </div>
        </>
    );


};

export default ManualEventList;
