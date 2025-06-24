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