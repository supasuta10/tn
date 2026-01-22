import axios from 'axios'

const defaultOptions = {
    baseURL: "http://localhost:8080/api",  // Updated to match backend server port
    headers: {
        "Content-Type": "application/json",
    },
};

// Create instance
let instance = axios.create(defaultOptions);

// Set the AUTH token for any request
instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token");
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
});

// Create a separate instance for public requests (without auth token)
const publicInstance = axios.create(defaultOptions);

// Default export for backward compatibility
export default instance;

// Named export for public instance
export { publicInstance };