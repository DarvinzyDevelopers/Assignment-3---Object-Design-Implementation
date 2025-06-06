// File: /oop_web/src/components/RegisterForm.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

interface RegisterFormProps {
    /**
     * Called when the backend returns { token, user } successfully.
     * We store the token and lift the user up into App.tsx’s state.
     */
    onRegisterSuccess: (token: string, user: { id: string; email: string; role: string }) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }

        try {
            setLoading(true);
            // Call our new register() function
            const { token, user } = await register(email.trim(), password.trim(), "user");
            // Save the token to localStorage
            localStorage.setItem("jwt_token", token);
            // Notify parent (App.tsx) that the user is now logged in
            onRegisterSuccess(token, user);
            // (Optionally navigate somewhere, though App.tsx will re-render as “logged in”)
            navigate("/products", { replace: true });
        } catch (err: any) {
            console.error("Registration failed:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <div className="card shadow" style={{ width: "400px" }}>
                <div className="card-header bg-primary text-white">
                    <h2 className="m-0">📝 Register</h2>
                </div>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label htmlFor="registerEmail">Email:</label>
                            <input
                                id="registerEmail"
                                type="email"
                                className="form-control"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="registerPassword">Password:</label>
                            <input
                                id="registerPassword"
                                type="password"
                                className="form-control"
                                placeholder="Choose a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                    Registering...
                                </>
                            ) : (
                                "Register"
                            )}
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <small>
                            Already have an account?{" "}
                            <a
                                className="text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </a>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};
