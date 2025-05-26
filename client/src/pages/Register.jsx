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
            console.log("Registered user:", data);
        } catch (error) {
            alert("Registration failed. Please try again.");
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Role:
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                    </select>
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Register;
