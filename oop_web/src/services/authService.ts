import axios, { AxiosInstance } from "axios";

// 1. Public Axios instance (no JWT) for /api/auth/login & /api/auth/register
export const axiosPublic: AxiosInstance = axios.create({
    baseURL: "http://localhost:4000/api/auth",
    headers: { "Content-Type": "application/json" },
});

// 2. Private Axios instance (includes JWT) for all other /api calls
export const axiosPrivate: AxiosInstance = axios.create({
    baseURL: "http://localhost:4000/api",
    headers: { "Content-Type": "application/json" },
});

// 3. LocalStorage key for JWT
const TOKEN_KEY = "jwt_token";

// 4. Get/Set/Clear token helpers
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// 5. Axios request interceptor: attach <Authorization: Bearer ...> if token exists
axiosPrivate.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 5. Globally catch 401s (expired or invalid JWT):
axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove any stored token & force user to login again
      clearToken();
      // Redirect the entire app to /login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// … keep the rest of your login/register helpers below …
export interface LoginResponse {
    token: string;
    user: { id: string; email: string; role: string };
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await axiosPublic.post<LoginResponse>("/login", {
        email,
        password,
    });
    return response.data;
}

// 7. Register response shape
export interface RegisterResponse {
  token: string;
  user: { id: string; email: string; role: string };
}

/**
 * POST /api/auth/register
 * Body: { email, password, role? }
 * Returns: { token, user }
 */
export async function register(
  email: string,
  password: string,
  role: string = "user"
): Promise<RegisterResponse> {
  const response = await axiosPublic.post<RegisterResponse>("/register", {
    email,
    password,
    role,
  });
  return response.data;
}

/**
 * GET /api/auth/me
 * Requires Authorization: Bearer <token>
 * Returns: { id, email, role }
 */
export async function fetchMe(): Promise<{ id: string; email: string; role: string }> {
    const response = await axiosPrivate.get("/auth/me");
    return response.data;
}
