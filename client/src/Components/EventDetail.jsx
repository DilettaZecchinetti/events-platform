import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { fetchEventsById, signupForEvent, addEventToCalendar } from '../services/api.js';

import { useUser } from "../context/UserContext.jsx";

const EventDetail = () => {
    const { user } = useUser();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signupMessage, setSignupMessage] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [calendarMessage, setCalendarMessage] = useState('');
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [eventMessage, setEventMessage] = useState('');
    const hasHandledOAuth = useRef(false);

    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
        const handleMessage = (e) => {
            if (e.origin !== API_BASE) return;

            if (e.data === 'oauth-success' && !hasHandledOAuth.current) {
                hasHandledOAuth.current = true;

                const waitForEventThenAdd = async () => {
                    let attempts = 0;
                    while (!event && attempts < 10) {
                        await new Promise((res) => setTimeout(res, 300));
                        attempts++;
                    }
                    if (event) addEvent();
                    else setEventMessage("Event still not loaded after OAuth.");
                };

                waitForEventThenAdd();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [event]);

    const saveEventToDB = async (eventObj) => {
        const cleaned = {
            ...eventObj,
            startDate: new Date(eventObj.startDate).toISOString(),
            endDate: new Date(eventObj.endDate).toISOString(),
        };
        const res = await axios.post(`${API_BASE}/api/events`, cleaned, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res.data;
    };

    const addEvent = async () => {
        if (!event) {
            setEventMessage("Event data missing.");
            return;
        }

        if (!user || !user._id) {
            setEventMessage("You must be logged in.");
            return;
        }

        try {
            const start = event.startDate || event.dates?.start?.dateTime;
            const end = event.endDate || (start ? new Date(new Date(start).getTime() + 3600000) : null);

            const eventToSave = {
                externalId: event.externalId || event.id || `ext-${Date.now()}`,
                title: event.title || event.name || "Untitled Event",
                description: event.description || "",
                startDate: start,
                endDate: end,
                location: {
                    venue: event.venue || event._embedded?.venues?.[0]?.name || "",
                    city: event.city || event._embedded?.venues?.[0]?.city?.name || "",
                },
                image: event.image || event.images?.[0]?.url || "",
                createdBy: user._id,
                url: event.url || "",
                attendees: [],
            };

            const saved = await saveEventToDB(eventToSave);
            await addEventToCalendar(saved._id);
            setEventMessage("Event added to calendar!");
        } catch (err) {
            console.error(err);
            setEventMessage("Failed to add to calendar.");
        }
    };

    const handleSignUp = async () => {
        setSignupLoading(true);
        setSignupMessage('');

        if (!user || !user._id) {
            setSignupMessage("You must be logged in.");
            setSignupLoading(false);
            return;
        }

        try {
            await signupForEvent(id, user._id);
            setSignupMessage('Successfully signed up for the event!');
        } catch (error) {
            setSignupMessage('Failed to sign up. Please try again.');
        } finally {
            setSignupLoading(false);
        }
    };

    const handleAddToCalendar = async () => {
        if (!user) return setCalendarMessage("Log in to use calendar.");

        setCalendarLoading(true);
        setCalendarMessage("");
        try {
            const { data } = await axios.get(`${API_BASE}/api/calendar/oauth`, {
                withCredentials: true,
            });

            const oauthUrl = data.url;
            if (!oauthUrl) throw new Error("OAuth URL missing.");

            const width = 500, height = 600;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            window.open(
                oauthUrl,
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!event) return <p>Event not found.</p>;

    return (
        <div className="container mt-5">
            <div className="card shadow-lg mx-auto" style={{ maxWidth: '700px' }}>
                <div className="ratio ratio-16x9">
                    <img
                        src={
                            event.images?.[4]?.url ||
                            event.images?.[0]?.url ||
                            event.image ||
                            ""
                        }
                        alt={event.name || event.title}
                        className="object-fit-cover w-100 h-100"
                    />
                </div>
                <div className="card-body">
                    <h2 className="card-title">{event.name || event.title}</h2>

                    {event.classifications?.[0]?.genre?.name && (
                        <p className="card-text text-muted">
                            <strong>Genre:</strong> {event.classifications[0].genre.name}
                        </p>
                    )}

                    {event.dates?.start?.localDate && (
                        <p className="card-text text-muted">
                            <strong>Date:</strong>{" "}
                            {(() => {
                                const date = new Date(`${event.dates.start.localDate}T${event.dates.start.localTime}`);
                                const formattedDate = date.toLocaleDateString("en-GB").replaceAll("/", "-");
                                const formattedTime = date.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                });
                                return `${formattedDate} at ${formattedTime}`;
                            })()}
                        </p>
                    )}

                    {event.description && (
                        <p className="card-text">
                            <strong>Description:</strong>
                            <br />
                            {event.description.split("\n").map((line, i) => (
                                <span key={i}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    )}

                    {event.url && (
                        <p className="card-text">
                            <strong>More Info:</strong>{" "}
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-underline"
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
                                    disabled={signupLoading}
                                >
                                    {signupLoading ? "Signing up…" : "Sign Up"}
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

                    {signupMessage && (
                        <p className="text-success mt-3">{signupMessage}</p>
                    )}
                    {calendarMessage && (
                        <p className="text-primary mt-2">{calendarMessage}</p>
                    )}
                    {eventMessage && (
                        <p className="text-warning mt-3">{eventMessage}</p>
                    )}

                    <div className="mt-4">
                        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                            ← Go Back
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetail;