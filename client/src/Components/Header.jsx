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
        <header
            style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #dee2e6",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
        >
            <div className="container d-flex justify-content-between align-items-center py-2" style={{ maxWidth: "1500px" }}>
                <Link to="/" className="d-flex align-items-center text-decoration-none">
                    <img src={logo} width={120} height={80} alt="Logo" />
                </Link>

                {/* Desktop Nav */}
                <nav className="d-none d-md-flex align-items-center gap-2">
                    {user?.role === "user" && (
                        <>
                            <Link
                                to="/staff-events"
                                className="gradient-btn"
                                style={{ background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)" }}
                            >
                                Staff Curated Events
                            </Link>
                            <Link
                                to="/events"
                                className="gradient-btn"
                                style={{ background: "linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)" }}
                            >
                                Events
                            </Link>
                        </>
                    )}

                    {user?.role === "staff" && (
                        <Link
                            to="/staff-dashboard"
                            className="gradient-btn"
                            style={{ background: "linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)" }}
                        >
                            Your Events
                        </Link>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="gradient-btn"
                            style={{ background: "linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)" }}
                        >
                            Log Out
                        </button>
                    ) : (
                        <Link
                            to="/"
                            className="gradient-btn"
                            style={{ background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)" }}
                        >
                            Login/Register
                        </Link>
                    )}

                    {user?.role === "user" && (
                        <Link to="/my-events" className="d-flex align-items-center text-decoration-none ms-2">
                            <span
                                className="d-inline-flex align-items-center justify-content-center rounded-circle border"
                                style={{ width: "40px", height: "40px", fontSize: "20px" }}
                            >
                                👤
                            </span>
                        </Link>
                    )}
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
                <div className="d-md-none bg-light border-top py-3 px-4 shadow-sm">
                    {user?.role === "user" && (
                        <>
                            <Link to="/events" className="gradient-btn w-100 mb-2" style={{ background: "linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)" }} onClick={() => setMenuOpen(false)}>
                                Events
                            </Link>
                            <Link to="/staff-events" className="gradient-btn w-100 mb-2" style={{ background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)" }} onClick={() => setMenuOpen(false)}>
                                Staff Created Events
                            </Link>
                        </>
                    )}

                    {user?.role === "staff" && (
                        <>
                            <Link to="/events" className="gradient-btn w-100 mb-2" style={{ background: "linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)" }} onClick={() => setMenuOpen(false)}>
                                Events
                            </Link>
                            <Link to="/staff-dashboard" className="gradient-btn w-100 mb-2" style={{ background: "linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)" }} onClick={() => setMenuOpen(false)}>
                                Your Events
                            </Link>
                        </>
                    )}

                    {user ? (
                        <button className="gradient-btn w-100 mb-2" style={{ background: "linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)" }} onClick={() => { handleLogout(); setMenuOpen(false); }}>
                            Log Out
                        </button>
                    ) : (
                        <Link to="/" className="gradient-btn w-100 mb-2" style={{ background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)" }} onClick={() => setMenuOpen(false)}>
                            Login/Register
                        </Link>
                    )}

                    <div className="d-flex align-items-center gap-2 mt-2">
                        <Link to="/my-events">
                            <span
                                className="d-inline-flex align-items-center justify-content-center rounded-circle border"
                                style={{ width: "40px", height: "40px", fontSize: "20px" }}
                            >
                                👤
                            </span>
                        </Link>
                        <span className="text-muted">{user?.name ?? "User"}</span>
                    </div>
                </div>
            )}
        </header>



    );
}

export default Header;
