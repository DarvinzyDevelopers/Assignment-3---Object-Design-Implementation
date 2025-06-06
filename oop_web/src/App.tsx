import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
  NavLink,
} from "react-router-dom";
import "./App.css";
import "./modern-ui.css";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ProductList } from "./components/ProductList";
import { CartView } from "./components/CartView";
import { OrderHistory } from "./components/OrderHistory";
import { NotificationList } from "./components/NotificationList";
import { fetchMe, clearToken, getToken } from "./services/authService";
import { User, UserRole } from "./types";

// Admin‐side layout
import { AdminLayout } from "./components/admin/AdminLayout";

function App() {
    const [loadingUser, setLoadingUser] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = getToken();
        if (token) {
            fetchMe()
                .then((u) => {
          const roleString: UserRole = u.role === "admin" ? "admin" : "user";
                    setUser({ id: u.id, email: u.email, role: roleString });
                })
                .catch(() => {
                    clearToken();
                    setUser(null);
                })
                .finally(() => {
                    setLoadingUser(false);
                });
        } else {
            setLoadingUser(false);
        }
    }, []);

    const handleLogout = () => {
        clearToken();
        setUser(null);
    };

    if (loadingUser) {
        return (
            <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    if (!user) {
        return (
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
            <LoginForm
                onLoginSuccess={(token, u) => {
                  // Again, narrow u.role to UserRole before calling setUser:
                  const roleString: UserRole =
                    u.role === "admin" ? "admin" : "user";
                  localStorage.setItem("jwt_token", token);
                  setUser({ id: u.id, email: u.email, role: roleString });
                }}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm
                onRegisterSuccess={(token, u) => {
                  const roleString: UserRole =
                    u.role === "admin" ? "admin" : "user";
                  localStorage.setItem("jwt_token", token);
                  setUser({ id: u.id, email: u.email, role: roleString });
                }}
            />
            }
          />
          {/* Any other path redirects to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
        );
    }

    return (
        <Router>
            {user.role === "user" ? (
                <ClientRoutes user={user} onLogout={handleLogout} />
            ) : (
                <AdminRoutes user={user} onLogout={handleLogout} />
            )}
        </Router>
    );
}

export default App;

/** Client‐side routes (normal user) **/
function ClientRoutes({
                          user,
                          onLogout,
                      }: {
    user: User;
    onLogout: () => void;
}) {
    return (
        <>
            <ClientLayout user={user} onLogout={onLogout} />
            <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ProductList currentUserRole={user.role} />} />
                <Route path="/cart" element={<CartView />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/notifications" element={<NotificationList />} />
                <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
        </>
    );
}

/** Admin‐side routes (dashboard) **/
function AdminRoutes({
                         user,
                         onLogout,
                     }: {
    user: User;
    onLogout: () => void;
}) {
    return (
        <Routes>
            <Route
                path="/admin/*"
                element={<AdminLayout user={user} onLogout={onLogout} />}
            />
            <Route path="/admin" element={<Navigate to="/admin/audit-trail" replace />} />
            <Route path="*" element={<Navigate to="/admin/audit-trail" replace />} />
        </Routes>
    );
}

/** Top‐level navigation for client (normal user) **/
function ClientLayout({
                          user,
                          onLogout,
                      }: {
    user: User;
    onLogout: () => void;
}) {
    return (
        <header className="navbar">
      <h1 className="navbar-brand m-0">Apple Store</h1>
            <nav className="navbar-nav">
        <NavLink
          to="/products"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Products
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Cart
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Orders
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Notifications
        </NavLink>
            </nav>
            <div className="d-flex align-items-center">
        <span className="mr-2">
          Signed in as <strong>{user.email}</strong>
        </span>
                <button onClick={onLogout} className="btn btn-secondary btn-sm">
                    Logout
                </button>
            </div>
        </header>
    );
}
