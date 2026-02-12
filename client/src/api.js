import axios from "axios";

// Use proxy in dev (relative /api) to avoid CORS; full URL in production
const API_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach auth header from localStorage for every request
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// On 401, trigger logout and redirect to signin
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/signin", data);

export const getUserProfile = async (userId) => {
  const { data } = await api.get(`/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return data;
};

export const updateUserProfile = (userId, data) => {
  return api.put(`/users/${userId}`, data, {
    headers: getAuthHeader(),
  });
};

/** Get feed posts with pagination (limit, skip) */
export const getFeedPosts = async (limit = 20, skip = 0) => {
  const res = await api.get("/posts/feed", {
    params: { limit, skip },
    headers: getAuthHeader(),
  });
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.posts)) return data.posts;
  return [];
};

/** Get posts for current user only */
export const getUserPosts = async () => {
  const { data } = await api.get("/posts/", {
    headers: getAuthHeader(),
  });
  return Array.isArray(data) ? data : [];
};

/** Get posts by user ID with pagination (for profile view) */
export const getPostsByUser = async (userId, limit = 20, skip = 0) => {
  const { data } = await api.get(`/posts/user/${encodeURIComponent(userId)}`, {
    params: { limit, skip },
    headers: getAuthHeader(),
  });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.posts)) return data.posts;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const getPostById = async (id) => {
  const { data } = await api.get(`/posts/${id}`, {
    headers: getAuthHeader(),
  });
  return data;
};

/** Create post - accepts FormData (for media) or plain object (text-only) */
export const createPost = (data) => {
  return api.post("/posts", data, {
    headers: getAuthHeader(),
  });
};

export default api;
