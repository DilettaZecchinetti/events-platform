import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useUser } from "../context/UserContext";
import "../../css/Header.css";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="border-bottom bg-light">
            <div className="container d-flex justify-content-between align-items-center py-1">
                <Link to="/" className="d-flex align-items-center text-decoration-none">
                    <img src={logo} width={120} height={100} alt="Logo" />
                </Link>

                {/* Desktop Nav */}

                <nav className="d-none d-md-flex align-items-center gap-3">
                    {user?.role === "user" && (
                        <>
                            <Link to="/staff-events" className="btn btn-outline-primary me-2">
                                Staff Created Events
                            </Link>
                            <Link to="/events" className="btn btn-outline-primary me-2">
                                Events
                            </Link>
                        </>
                    )}

                    {user?.role === "staff" && (
                        <>
                            {/* <Link to="/events" className="btn btn-outline-primary me-2">
                                Events
                            </Link> */}
                            <Link to="/staff-dashboard" className="btn btn-outline-primary me-2">
                                Your Events
                            </Link>
                        </>
                    )}

                    {user ? (
                        <button onClick={handleLogout} className="btn btn-danger me-2">
                            Log Out
                        </button>
                    ) : (
                        <Link to="/" className="btn btn-success me-2" onClick={() => setMenuOpen(false)}>
                            Login/Register
                        </Link>
                    )}

                    <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle border"
                        style={{ width: "40px", height: "40px", fontSize: "20px" }}
                    >
                        👤
                    </span>
                </nav>



                {/* Mobile Nav Toggle */}
                <div className="d-flex d-md-none align-items-center gap-2">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="btn btn-outline-secondary"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? "✖" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="d-md-none bg-white border-top py-3 px-4">
                    {user?.role === "user" && (
                        <>
                            <Link
                                to="/events"
                                className="btn btn-outline-primary w-100 mb-3"
                                onClick={() => setMenuOpen(false)}
                            >
                                Events
                            </Link>
                            <Link
                                to="/staff-events"
                                className="btn btn-outline-primary w-100 mb-3"
                                onClick={() => setMenuOpen(false)}
                            >
                                Staff Created Events
                            </Link>
                        </>
                    )}

                    {user?.role === "staff" && (
                        <>
                            <Link
                                to="/events"
                                className="btn btn-outline-primary w-100 mb-3"
                                onClick={() => setMenuOpen(false)}
                            >
                                Events
                            </Link>
                            <Link
                                to="/staff-dashboard"
                                className="btn btn-outline-primary w-100 mb-3"
                                onClick={() => setMenuOpen(false)}
                            >
                                Your Events
                            </Link>
                        </>
                    )}

                    {user ? (
                        <button
                            className="btn btn-danger w-100 mb-3"
                            onClick={() => {
                                handleLogout();
                                setMenuOpen(false);
                            }}
                        >
                            Log Out
                        </button>
                    ) : (
                        <Link
                            to="/"
                            className="btn btn-success w-100 mb-3"
                            onClick={() => setMenuOpen(false)}
                        >
                            Login/Register
                        </Link>
                    )}

                    <div className="d-flex align-items-center gap-3">
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded-circle border"
                            style={{ width: "40px", height: "40px", fontSize: "20px" }}
                        >
                            👤
                        </span>
                        <span className="text-muted">{user?.name ?? "User"}</span>
                    </div>
                </div>
            )}

        </header>
    );
}

export default Header;
