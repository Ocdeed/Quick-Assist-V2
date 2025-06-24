import api from './api';

// Gets the list of services a provider currently offers
export const getMyServices = () => {
    return api.get('/auth/provider/services/');
};

// Adds a service to the provider's profile
export const addServiceToMyProfile = (serviceId) => {
    return api.post('/auth/provider/services/', { service_id: serviceId });
};

// Removes a service from the provider's profile
export const removeServiceFromMyProfile = (serviceId) => {
    return api.delete('/auth/provider/services/', { data: { service_id: serviceId } });
};

export const updateJobStatus = (jobId, status) => {
    return api.post(`/services/requests/${jobId}/update_status/`, { status });
};
// Also add a decline endpoint if you want one separate from the state machine
export const declineJob = (jobId) => {
     return api.post(`/services/requests/${jobId}/update_status/`, { status: 'DECLINED' });
}