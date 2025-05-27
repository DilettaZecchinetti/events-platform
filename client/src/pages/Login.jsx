import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useUser } from "../context/UserContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await loginUser(email, password);
            login(data.user, data.token); // Store user + token in context and localStorage
            alert("Login successful!");
        } catch (err) {
            alert("Login failed. Please check your credentials.");
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default Login;

