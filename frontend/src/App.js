import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import theme from './theme'; // Import our custom theme

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Normalizes styles across browsers */}
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
                        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
                        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

// Helper to prevent logged-in users from seeing auth pages
const AuthRedirect = ({children}) => {
    const { user } = useContext(AuthContext);
    return user ? <Navigate to="/dashboard" /> : children;
}

export default App;