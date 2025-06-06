import React, { useState } from "react";
import { registerUser } from "../services/api";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await registerUser(name, email, password, role);
            alert("Registration successful!");
        } catch (error) {
            alert("Registration failed. Please try again.");
        }
    };

    return (
        <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Register</h3>
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
    );
};

export default Register;
