import http from './http-common';

const API_URL = '/admin';

const getDashboardSummary = () => {
    return http.get(`${API_URL}/dashboard`);
};

const getAnalytics = () => {
    return http.get(`${API_URL}/analytics`);
};

const getReports = () => {
    return http.get(`${API_URL}/reports`);
};

const adminService = {
    getDashboardSummary,
    getAnalytics,
    getReports
};

export default adminService;