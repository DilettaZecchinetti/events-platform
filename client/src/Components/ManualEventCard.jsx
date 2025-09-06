import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "../../css/ManualEventCard.css";


const ManualEventCard = ({
    event,
    user,
    handleSignUp,
    handleAddToCalendar,
    signupLoading,
    calendarLoading,
    signupMessage,
    calendarAdded,
}) => {
    const isSignedUp = user && event.attendees?.includes(user._id);

    return (
        <Card bg="light" text="dark" className="mb-4 shadow-sm h-100">
            <div style={{ height: "200px", overflow: "hidden" }}>
                <Card.Img
                    variant="top"
                    src={event.image || "/placeholder.jpg"}
                    alt={`Image for ${event.title}`}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
            </div>

            <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                    <Card.Title className="fw-bold">{event.title}</Card.Title>
                    <Card.Text className="text-muted">
                        {new Date(event.startDate).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Europe/London",
                        })}
                    </Card.Text>
                    <Card.Text className="text-black mb-4" style={{ fontSize: "1rem", fontStyle: "italic", margin: "0.25rem 0" }}>{event.description}</Card.Text>
                    <Card.Text className="text-secondary" style={{ marginTop: "0.5 rem" }}>
                        📍 {event.location?.venue}, {event.location?.city}
                    </Card.Text>

                </div>

                <div className="mt-3 d-flex flex-column gap-2">
                    <Button
                        variant={isSignedUp ? "secondary" : "primary"}
                        onClick={() => handleSignUp(event._id)}
                        disabled={signupLoading[event._id] || isSignedUp}
                    >
                        {signupLoading[event._id]
                            ? "Signing up..."
                            : isSignedUp
                                ? "Already Signed Up"
                                : "Sign Up"}
                    </Button>

                    <Button
                        variant={calendarAdded[event._id] ? "secondary" : "success"}
                        onClick={() => handleAddToCalendar(event)}
                        disabled={calendarLoading[event._id] || calendarAdded[event._id]}
                    >
                        {calendarLoading[event._id]
                            ? "Adding..."
                            : calendarAdded[event._id]
                                ? "Added to Calendar"
                                : "Add to Calendar"}
                    </Button>

                    {signupMessage?.eventId === event._id && (
                        <div className="alert alert-success mt-2">{signupMessage.text}</div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ManualEventCard;

