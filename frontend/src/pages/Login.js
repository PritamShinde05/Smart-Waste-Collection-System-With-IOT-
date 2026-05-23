import { useState } from "react";
import API_BASE_URL from "../services/api";

function Login({ setCurrentPage }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setMessage("Please enter email and password");
            setMessageType("error");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed");
                setMessageType("error");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setMessage("Login successful");
            setMessageType("success");

            if (data.user.role === "admin") {
                setCurrentPage("admin");
            } else if (data.user.role === "employee") {
                setCurrentPage("employee");
            }
        } catch (error) {
            setMessage("Backend server is not running");
            setMessageType("error");
        }
    };

    return (
        <div className="container">
            <div className="center-box">
                <h2>Smart Waste Management</h2>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="btn" type="submit">
                        Login
                    </button>
                </form>

                {message && (
                    <p className={`message ${messageType}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;