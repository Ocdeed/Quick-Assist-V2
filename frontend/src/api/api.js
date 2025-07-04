import axios from 'axios';
const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api/v1/' });
api.interceptors.request.use(
    (config) => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));
        if (tokens?.access) {
            config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
export default api;