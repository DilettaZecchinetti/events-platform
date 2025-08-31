import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import axios from "axios";

const EventBanner = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL;
                const { data } = await axios.get(`${API_BASE}/api/events/banner`);
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching banner events:", err.response?.data || err.message);
                setEvents([]);
            }
        };
        loadEvents();
    }, []);

    if (!events.length) return null;

    return (
        <div style={{ backgroundColor: "#222", color: "#fff", padding: "15px 0" }}>
            <Marquee gradient={false} speed={50}>
                {events.map((event) => (
                    <Link
                        to={`/events/${event.id}`}
                        key={event.id}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            marginRight: "50px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        🎵 {event.name} –{" "}
                        {event.dates?.start?.dateTime
                            ? new Date(event.dates.start.dateTime).toLocaleDateString()
                            : "TBA"}
                    </Link>
                ))}
            </Marquee>
        </div>
    );
};

export default EventBanner;
