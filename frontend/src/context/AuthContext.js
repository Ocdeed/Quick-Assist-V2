// src/context/AuthContext.js
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- SOLUTION: WRAP FUNCTIONS USED IN useEffect with useCallback ---
    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login', { replace: true });
    }, [navigate]);
    
    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await api.get('/auth/profile/');
            if (response.status === 200) {
                setUser(response.data);
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            logoutUser();
        }
    }, [logoutUser]); // `fetchUserProfile` depends on `logoutUser`
    
    // loginUser and registerUser are not used in useEffect, so they don't strictly need useCallback,
    // but it's good practice for consistency if they were to be used elsewhere.
    const loginUser = async (email, password) => {
        try {
            const response = await api.post('auth/login/', { email, password });
            if (response.status === 200) {
                const data = response.data;
                setAuthTokens(data);
                localStorage.setItem('authTokens', JSON.stringify(data));
                await fetchUserProfile();
                navigate('/dashboard');
                return Promise.resolve();
            }
        } catch (error) {
            throw new Error(error.response?.data?.detail || "Invalid Credentials");
        }
    };

    const registerUser = async (formData) => {
        try {
            const response = await api.post('auth/register/', formData);
            if (response.status === 201) {
                const data = response.data;
                setAuthTokens(data);
                localStorage.setItem('authTokens', JSON.stringify(data));
                
                // --- THE FIX ---
                // Let's be consistent and fetch the full profile just like we do in login.
                // This guarantees the user object structure is always the same.
                await fetchUserProfile(); 
                
                navigate('/dashboard');
                return Promise.resolve();
            }
        } catch (error) {
            const errorMsg = error.response?.data ? Object.values(error.response.data).join(' ') : "Registration Failed";
            throw new Error(errorMsg);
        }
    };
    
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            if (authTokens) {
                await fetchUserProfile(); // Now calling the memoized function
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, [authTokens, fetchUserProfile]); // --- SOLUTION: Add fetchUserProfile to the dependency array ---

    const contextData = { user, authTokens, loading, loginUser, logoutUser, registerUser };

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;