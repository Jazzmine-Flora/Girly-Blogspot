import axios from "axios";

// Set up a base instance (adjust baseURL if your backend runs elsewhere)
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Change port if your backend uses a different one
  withCredentials: true, // If you use cookies/auth
});

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/signin", data);

// Example: get user profile
// Example for Axios
export const getUserProfile = async (userId) => {
  const token = localStorage.getItem("token");
  return api
    .get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);
};

// Example: update user profile
export const updateUserProfile = (userId, data) => {
  const token = localStorage.getItem("token");
  return api.put(`/users/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Example: get all posts

export const getUserPosts = async () => {
  const token = localStorage.getItem("token");
  return api
    .get("/posts/", {
      // <-- remove 'user'
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);
};

// Example: create a post
export const createPost = (data) => {
  const token = localStorage.getItem("token");
  return api.post("/posts", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Only set Content-Type if not FormData; axios will handle it for FormData
    },
  });
};
// Export the axios instance for custom requests
export default api;
