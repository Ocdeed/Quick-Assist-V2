import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ... (useState hooks are the same)
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loginUser = async (email, password) => {
        try {
            const response = await api.post('auth/login/', { email, password });
            if (response.status === 200) {
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                localStorage.setItem('authTokens', JSON.stringify(response.data));
                navigate('/dashboard');
                return Promise.resolve(); // Indicate success
            }
        } catch (error) {
            // Re-throw the error so the component can catch it
            throw new Error(error.response?.data?.detail || "Invalid Credentials");
        }
    };

    const registerUser = async (formData) => {
        try {
            const response = await api.post('auth/register/', formData);
            if (response.status === 201) {
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                localStorage.setItem('authTokens', JSON.stringify(response.data));
                navigate('/dashboard');
                return Promise.resolve(); // Indicate success
            }
        } catch (error) {
            // Extract a more specific error message from the backend response if possible
            const errorMsg = error.response?.data ? Object.values(error.response.data).join(' ') : "Registration Failed";
            throw new Error(errorMsg);
        }
    };

    const logoutUser = () => { /* ... (same as before) ... */
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };
    
    useEffect(() => { setLoading(false) }, [authTokens]);

    const contextData = { user, loginUser, logoutUser, registerUser };

    return <AuthContext.Provider value={contextData}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;