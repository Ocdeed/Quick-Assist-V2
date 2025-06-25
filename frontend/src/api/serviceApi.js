// src/api/serviceApi.js
import api from './api';

// --- Customer Endpoints ---

// Fetches all service categories and their services
export const getServiceCategories = () => {
  return api.get('/services/categories/');
};

// Creates a new service request
export const createServiceRequest = (requestData) => {
  return api.post('/services/requests/', requestData);
};

// Fetches the customer's own service requests
export const getCustomerRequests = () => {
    return api.get('/services/requests/');
};

// --- Provider Endpoints ---

// Fetches available jobs for the provider
export const getAvailableRequests = () => {
    return api.get('/services/matching/available-requests/');
};

// Allows a provider to accept a job
export const acceptServiceRequest = (requestId) => {
    return api.post(`/services/requests/${requestId}/accept/`);
};

export const declineJob = (requestId) => {
    // We are calling the generic 'update_status' endpoint we created on the backend.
    return api.post(`/services/requests/${requestId}/update_status/`, { status: 'DECLINED' });
};

// Fetches the provider's accepted jobs
export const getProviderJobs = () => {
    // We'll assume for now this uses the same endpoint as customer,
    // but the backend will filter based on role. A dedicated endpoint would also be fine.
    return api.get('/services/requests/'); 
}

// Allows a provider to update their location and availability
export const updateProviderLocation = (locationData) => {
    // This endpoint wasn't in the Phase 2 spec, but is essential. 
    // We need to build this on the backend soon. For now, we'll create the function.
    // return api.put('/providers/me/location/', locationData);
    console.log("Simulating provider location update:", locationData);
    return Promise.resolve(); // Simulate success
}

// This endpoint fetches details of a specific service request by its ID
// This is useful for the job detail page where we need to show tracking info and chat
// and other details about the job.
export const getServiceRequestDetails = (requestId) => {
    return api.get(`/services/requests/${requestId}/`);
}

export const getChatMessages = (requestId) => {
    return api.get(`/communications/requests/${requestId}/chat/`);
};
export const sendChatMessage = (requestId, text) => {
    return api.post(`/communications/requests/${requestId}/chat/`, { text });
};

export const initiatePayment = (jobId, paymentData) => {
    return api.post(`/services/requests/${jobId}/initiate_payment/`, paymentData);
    // Note: We need to create this backend URL. Let's adjust payments/urls.py
};

// --- THIS IS THE NEW FUNCTION TO ADD ---
/**
 * Updates the status of a specific job.
 * @param {number} jobId - The ID of the job to update.
 * @param {string} status - The new status (e.g., 'IN_PROGRESS', 'COMPLETED').
 * @returns {Promise} - The axios promise for the API call.
 */
export const updateJobStatus = (jobId, status) => {
    return api.post(`/services/requests/${jobId}/update_status/`, { status });
};

export const logCashPayment = (jobId) => {
    return api.post(`/payments/log_cash/${jobId}/`);
};
