import { useEffect, useState } from "react";
import { fetchMyEvents } from "../services/api.js";
import { useUser } from "../context/UserContext.jsx";
import { Link } from "react-router-dom";
import { Spinner, Card, Container, Row, Col } from "react-bootstrap";

const RegularUser = () => {
    const { user } = useUser();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchMyEvents();
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error loading my events:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!user) {
        return <p className="text-center mt-5">Please log in to view your profile.</p>;
    }

    return (
        <Container>
            <h2 className="mb-4 text-center fw-bold">
                Welcome{user?.name ? `, ${user.name}` : ""}!
            </h2>

            {(!events || events.length === 0) ? (
                <div className="text-center">
                    <p className="text-muted fs-5 mb-4">
                        You haven’t signed up for any events yet. Explore events and start planning!
                    </p>
                    <Link to="/events" className="btn btn-primary btn-lg">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <>
                    <h4 className="mb-4 text-center text-secondary pt-8">
                        Your Upcoming Events:
                    </h4>
                    <Row className="g-4">
                        {events.map((ev) => (
                            <Col key={ev._id} xs={12} sm={6} md={4} lg={3}>
                                <Card
                                    className="h-100 border-1 shadow-sm rounded-2 overflow-hidden hover-scale"
                                    style={{ transition: "transform 0.2s, box-shadow 0.2s", fontFamily: 'inherit' }}
                                >
                                    {ev.image ? (
                                        <Card.Img
                                            variant="top"
                                            src={ev.image}
                                            alt={ev.title || "Event image"}
                                            style={{ height: "180px", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-secondary text-white d-flex align-items-center justify-content-center"
                                            style={{ height: "180px", fontStyle: "italic" }}
                                        >
                                            No Image
                                        </div>
                                    )}

                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="mb-2" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111' }}>
                                            {ev.title || "Untitled Event"}
                                        </Card.Title>


                                        <Card.Text className="mb-4" style={{ fontSize: '0.9rem', color: '#888' }}>
                                            {ev.startDate
                                                ? new Date(ev.startDate).toLocaleString("en-GB", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })
                                                : "TBA"}
                                        </Card.Text>

                                        <Card.Text className="mb-2" style={{ fontSize: '1rem', color: '#555' }}>
                                            📍 {ev.location?.venue || "Unknown venue"}, {ev.location?.city || "Unknown city"}
                                        </Card.Text>

                                        <Link
                                            to={`/events/${ev._id}`}
                                            className="btn btn-primary btn-sm mt-auto"
                                            style={{ fontSize: '0.875rem', fontWeight: 500 }}
                                        >
                                            View Details
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>

    );
};

export default RegularUser;
