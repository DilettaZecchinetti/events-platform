import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useUser } from "../context/UserContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await loginUser(email, password);
            const user = result;
            if (!user) throw new Error("Login failed");
            login(user);

            navigate("/");
        } catch (err) {
            setError("Login failed. Please check your credentials.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center pt-5">
            {loading ? (
                <div className="text-center" style={{ fontSize: '1.5rem', fontWeight: '500' }}>
                    Loading...
                </div>
            ) : (
                <div>
                    <h3 className="mb-3 text-center">Login</h3>
                    {error && <div className="alert alert-danger text-center">{error}</div>}
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
                        <p className="mt-4 text-center">
                            Don't have an account? <Link to="/register">Sign up here</Link>.
                        </p>
                    </form>
                </div>
            )}
        </div>
    );

};

export default Login;
