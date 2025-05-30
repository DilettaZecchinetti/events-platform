import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../../css/Header.css";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState("light");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
        document.body.classList.toggle("bg-dark");
        document.body.classList.toggle("text-white");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <header className="border-bottom bg-light">
            <div className="container d-flex justify-content-between align-items-center py-3">
                <Link to="/" className="d-flex align-items-center text-decoration-none">
                    <img src={logo} width={100} height={80} alt="Logo" />
                </Link>

                {/* Desktop Nav */}
                <nav className="d-none d-md-flex align-items-center gap-3">
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="btn btn-danger me-2">
                            Log Out
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary me-2">Sign In</Link>
                    )}
                    <button onClick={toggleTheme} className="btn btn-outline-secondary me-2">
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="avatar"
                        className="rounded-circle"
                        height="40"
                        width="40"
                    />
                </nav>

                {/* Mobile Nav Toggle */}
                <div className="d-flex d-md-none align-items-center gap-2">
                    <button onClick={toggleTheme} className="btn btn-outline-secondary">
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
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
                    {isLoggedIn ? (
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
                            to="/login"
                            className="d-block mb-3 text-decoration-none text-dark"
                            onClick={() => setMenuOpen(false)}
                        >
                            Log In
                        </Link>
                    )}
                    <div className="d-flex align-items-center gap-3">
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="avatar"
                            className="rounded-circle"
                            height="40"
                            width="40"
                        />
                        <span className="text-muted">User</span>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
