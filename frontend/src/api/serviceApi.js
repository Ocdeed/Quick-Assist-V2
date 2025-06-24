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