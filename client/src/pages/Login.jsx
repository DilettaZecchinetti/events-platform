import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useUser } from "../context/UserContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { user, token } = await loginUser(email, password);
            if (!user || !token) throw new Error("Login failed");
            login(user, token);
            alert("Login successful!");
            navigate("/");
        } catch (err) {
            alert("Login failed. Please check your credentials.");
            console.error(err);
        }
    };

    return (
        <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Login</h3>
            <form onSubmit={handleSubmit}>
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
                <button type="submit" className="btn btn-primary w-100">Sign In</button>
            </form>
        </div>
    );
};

export default Login;
