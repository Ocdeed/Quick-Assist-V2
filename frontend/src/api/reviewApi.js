// src/api/reviewApi.js
import api from './api';

// Create a review for a specific job
export const createReview = (jobId, reviewData) => {
    return api.post(`/reviews/create/${jobId}/`, reviewData);
};

// Get all reviews for a specific provider
export const getProviderReviews = (providerId) => {
    return api.get(`/reviews/provider/${providerId}/`);
};