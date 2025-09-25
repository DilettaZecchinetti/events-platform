import React, { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await registerUser(
                name.trim(),
                email.trim(),
                password.trim(),
                role
            );
            setLoading(false);
            setMessage("Registration successful! Redirecting...");

            setTimeout(() => {
                navigate("/");
            }, 1500);


        } catch (err) {
            console.error("Error response from server:", err.response?.data);
            setError(err.response?.data?.msg || "Registration failed. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="container d-flex justify-content-center pt-5">
            {loading ? (
                <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="mb-3 text-center">Register</h3>
                    {error && <div className="alert alert-danger text-center">{error}</div>}

                    {message && <div className="alert alert-success text-center">{message}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Role</label>
                            <select
                                className="form-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="user">User</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-success w-100">Sign Up</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Register;
