import http from './http-common';
import { publicInstance } from './http-common';

const API_URL = '/reviews';

const createReview = (reviewData) => {
    return http.post(API_URL, reviewData);
};

const getAllReviews = (params) => {
    return publicInstance.get(`${API_URL}`, { params });
};

const getReviewById = (id) => {
    return publicInstance.get(`${API_URL}/${id}`);
};

const updateReview = (id, reviewData) => {
    return http.put(`${API_URL}/${id}`, reviewData);
};

const deleteReview = (id) => {
    return http.delete(`${API_URL}/${id}`);
};

const getReviewsByCustomer = (customerID) => {
    return http.get(`${API_URL}/customer/${customerID}`);
};

const getReviewsByBooking = (bookingID) => {
    return publicInstance.get(`${API_URL}/booking/${bookingID}`);
};

const getAverageRating = () => {
    return publicInstance.get(`${API_URL}/average-rating`);
};

const reviewService = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByCustomer,
    getReviewsByBooking,
    getAverageRating
};

export default reviewService;