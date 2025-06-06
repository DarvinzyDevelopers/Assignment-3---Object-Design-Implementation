import React, {useState} from "react";
import {useNavigate, NavLink} from "react-router-dom";
import {login, setToken} from "../services/authService";

interface LoginFormProps {
    onLoginSuccess: (token: string, user: { id: string; email: string; role: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({onLoginSuccess}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // 1) Basic client‐side check:
        if (email.trim() === "" || password.trim() === "") {
            setError("Both email and password are required.");
            return;
        }

        try {
            setLoading(true);
            const {token, user} = await login(email.trim(), password);
            // 2) Upon success, store token in localStorage and notify parent
            setToken(token);
            onLoginSuccess(token, user);
            navigate("/products", {replace: true});
        } catch (err: any) {
            console.error("Login failed:", err);
            if (err.response?.status === 400) {
                // e.g. missing field
                setError(err.response.data?.message || "Email & password required");
            } else if (err.response?.status === 401) {
                setError("Invalid credentials.");
            } else {
                setError("Server error, please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div className="card shadow" style={{width: '400px'}}>
                <div className="card-header bg-primary text-white">
                    <h2 className="m-0">🔐 Login</h2>
                </div>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label htmlFor="loginEmail">Email:</label>
                            <input
                                id="loginEmail"
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label htmlFor="loginPassword">Password:</label>
                            <input
                                id="loginPassword"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm mr-2" role="status"
                                          aria-hidden="true"></span>
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <small>
                            Don’t have an account?{" "}
                            <NavLink to="/register" className="text-primary">
                                Register
                            </NavLink>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};
