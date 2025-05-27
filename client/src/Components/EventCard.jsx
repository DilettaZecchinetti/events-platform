import React from 'react';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import "../../css/EventCard.css";

function EventCard({ event }) {
    const venue = event._embedded?.venues?.[0];

    return (
        <Card bg="dark" text="white" className="event-card">
            <Card.Body className="event-card-body">
                <div className="event-card-image">
                    <Card.Img
                        variant="top"
                        src={event.images[1].url}
                        alt={`Image for ${event.name}`}
                    />
                </div>
                <div className="event-card-content">
                    <Card.Title className="event-title">{event.name}</Card.Title>
                    <Card.Text className='event-date'>    {new Date(event.dates.start.dateTime)
                        .toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Europe/London'
                        })
                        .replace('am', 'AM')
                        .replace('pm', 'PM')} </Card.Text>
                    <Card.Text className="event-venue"> {venue?.name}, {venue?.city?.name} </Card.Text>
                    <Link to={`/events/${event.id}`}>
                        <Button variant="primary" className="read-more-btn">
                            Read More
                        </Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
}

export default EventCard;
