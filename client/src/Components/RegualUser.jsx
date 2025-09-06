import { useEffect, useState } from "react";
import { fetchMyEvents } from "../services/api.js";
import { useUser } from "../context/UserContext.jsx";
import { Link } from "react-router-dom";
import { Spinner, Card, Container, Row, Col } from "react-bootstrap";

const RegularUser = () => {
    const { user } = useUser();           // 🔹 logged-in user
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
        <Container className="py-4">
            <h2 className="mb-4 text-center">Welcome, {user.name || "User"}</h2>

            {events.length === 0 ? (
                <p className="text-center text-muted">
                    You haven’t signed up for any events yet.
                </p>
            ) : (
                <>
                    <h4 className="mb-4 text-center">You're going to:</h4>
                    <Row>
                        {events.map((ev) => (
                            <Col key={ev._id} xs={12} sm={6} md={3} className="mb-4">
                                <Card className="shadow-sm h-100 d-flex flex-column">
                                    {ev.image && (
                                        <Card.Img
                                            variant="top"
                                            src={ev.image}
                                            alt={ev.title}
                                            style={{ objectFit: "cover", height: "180px" }}
                                        />
                                    )}
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="fs-5">{ev.title}</Card.Title>
                                        <Card.Text className="text-dark mt-2" style={{ fontFamily: "Georgia, serif" }}>
                                            📍 {ev.location?.venue || "Unknown venue"}, {ev.location?.city || ""}
                                        </Card.Text>
                                        <Card.Text className="text-muted mb-3">
                                            {ev.startDate
                                                ? new Date(ev.startDate).toLocaleString("en-GB", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })
                                                : "TBA"}
                                        </Card.Text>
                                        <Link
                                            to={`/events/${ev._id}`}
                                            className="btn btn-outline-primary btn-sm mt-auto"
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
