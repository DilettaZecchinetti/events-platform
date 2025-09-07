import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { fetchEventsById, signupForEvent } from "../services/api.js";
import { useUser } from "../context/UserContext.jsx";
import "../../css/EventDetail.css";

const EventDetail = () => {
    const { user } = useUser();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signupMessage, setSignupMessage] = useState("");
    const [signupLoading, setSignupLoading] = useState(false);
    const [calendarMessage, setCalendarMessage] = useState("");
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);

    const eventRef = useRef(null);
    const hasHandledOAuth = useRef(false);
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        eventRef.current = event;
    }, [event]);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const data = await fetchEventsById(id);
                setEvent(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [id]);

    useEffect(() => {
        if (event && user) {
            const signedUp = event.attendees?.some((a) => a._id === user._id);
            setIsSignedUp(signedUp);
        } else {
            setIsSignedUp(false);
        }
    }, [event, user]);

    useEffect(() => {
        const handleMessage = async (e) => {
            if (e.origin !== API_BASE) return;
            if (e.data !== "oauth-success" || hasHandledOAuth.current) return;

            hasHandledOAuth.current = true;
            const currentEvent = eventRef.current;
            if (!currentEvent || !user) {
                setCalendarMessage("Event or user missing.");
                return;
            }

            try {
                const eventToSave = {
                    externalId: currentEvent.id,
                    title: currentEvent.name || currentEvent.title || "Untitled Event",
                    description: currentEvent.description || "",
                    startDate: new Date(currentEvent.startDate).toISOString(),
                    endDate: new Date(currentEvent.endDate).toISOString(),
                    venue: currentEvent.venue || currentEvent.location?.venue || "",
                    city: currentEvent.city || currentEvent.location?.city || "",
                    image: currentEvent.images?.[0]?.url || currentEvent.image || "",
                    createdBy: user._id,
                    url: currentEvent.url || "",
                    attendees: [],
                    source: "ticketmaster",
                };

                const saved = await axios.post(`${API_BASE}/api/events`, eventToSave, {
                    withCredentials: true,
                });

                await axios.post(
                    `${API_BASE}/api/calendar/add-event`,
                    { eventId: saved.data._id },
                    { withCredentials: true }
                );

                setCalendarMessage("Event added to calendar!");
            } catch (err) {
                console.error(
                    "Failed to add event to calendar:",
                    err.response?.data || err.message
                );
                setCalendarMessage("Failed to add event to calendar.");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [user]);

    const handleAddToCalendar = async () => {
        if (!user) return setCalendarMessage("Log in to use calendar.");

        setCalendarLoading(true);
        setCalendarMessage("");

        try {
            const { data: oauthUrl } = await axios.get(
                `${API_BASE}/api/calendar/oauth`,
                { withCredentials: true }
            );

            if (!oauthUrl?.url) throw new Error("OAuth URL missing.");

            const width = 500,
                height = 600;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            window.open(
                oauthUrl.url,
                "GoogleOAuth",
                `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
            );
        } catch (err) {
            console.error(err);
            setCalendarMessage("OAuth failed.");
        } finally {
            setCalendarLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!user) {
            setSignupMessage("You must be logged in.");
            return;
        }

        setSignupLoading(true);
        setSignupMessage("");

        try {
            await signupForEvent(id, user._id);
            setSignupMessage("Successfully signed up!");
            setIsSignedUp(true);
        } catch (err) {
            setSignupMessage("Failed to sign up. Please try again.");
        } finally {
            setSignupLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    function getBestImage(images = []) {
        if (!images.length) return "";
        const sorted = [...images].sort((a, b) => b.width - a.width);
        return sorted[0]?.url || "";
    }


    function buildLargeTMUrl(url, width = 1200, height = 675) {
        if (!url) return "";
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}width=${width}&height=${height}&crop=fit`;
    }

    const raw = getBestImage(event.images);
    const imageUrl = raw ? buildLargeTMUrl(raw) : event.image || null;


    return (
        <div className="container mt-5">
            <div className="card shadow-lg mx-auto" style={{ maxWidth: "700px" }}>
                <div className="ratio ratio-16x9">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={event.name || event.title}
                            className="object-fit-cover w-100 h-100"
                            loading="lazy"
                        />
                    )}
                </div>


                <div className="card-body">
                    <h2 className="card-title">{event.name || event.title}</h2>
                    {event.startDate && (
                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(event.startDate).toLocaleString("en-GB", {
                                dateStyle: "long",
                                timeStyle: "short",
                            })}
                        </p>
                    )}
                    {event.venue && (
                        <p>
                            <strong>Venue:</strong> {event.venue}
                        </p>
                    )}
                    {event.city && (
                        <p>
                            <strong>City:</strong> {event.city}
                        </p>
                    )}
                    {event.url && (
                        <p>
                            <strong>More Info:</strong>{" "}
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {event.url}
                            </a>
                        </p>
                    )}

                    <div className="mt-4 d-flex flex-wrap gap-2">
                        {user ? (
                            <>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSignUp}
                                    disabled={signupLoading || isSignedUp}
                                >
                                    {isSignedUp
                                        ? "Already Signed Up"
                                        : signupLoading
                                            ? "Signing up…"
                                            : "Sign Up"}
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={handleAddToCalendar}
                                    disabled={calendarLoading}
                                >
                                    {calendarLoading ? "Connecting…" : "Add to Calendar"}
                                </button>
                            </>
                        ) : (
                            <p className="text-danger">
                                You must log in to sign up or add to calendar.
                            </p>
                        )}
                    </div>

                    {signupMessage && <p className="text-success mt-3">{signupMessage}</p>}
                    {calendarMessage && (
                        <p className="text-primary mt-2">{calendarMessage}</p>
                    )}

                    <div className="mt-4">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(-1)}
                        >
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
