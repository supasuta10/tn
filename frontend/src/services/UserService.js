import http from './http-common';

const API_URL = '/users';

// User (Self) - Auth required
const getUserInfo = () => {
    return http.get(`${API_URL}/me`);
};

const updateProfile = (userData) => {
    return http.put(`${API_URL}/me`, userData);
};

// Admin Area - Protected with role check
const getAllUsers = () => {
    return http.get(`${API_URL}/all`);
};

const searchUserByRole = (role) => {
    return http.get(`${API_URL}/search`, { params: { role } });
};

const getUserById = (id) => {
    return http.get(`${API_URL}/${id}`);
};

const updateUser = (id, userData) => {
    return http.put(`${API_URL}/${id}`, userData);
};

const toggleUserStatus = (id) => {
    return http.patch(`${API_URL}/${id}/toggle-status`);
};

const createUser = (userData) => {
    return http.post(`${API_URL}`, userData);
};

const deleteUser = (id) => {
    return http.delete(`${API_URL}/${id}`);
};

const getUsersWithBookingCounts = () => {
    return http.get(`${API_URL}/with-booking-counts`);
};

const userService = {
    getUserInfo,
    updateProfile,
    getAllUsers,
    searchUserByRole,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getUsersWithBookingCounts
};

export default userService;