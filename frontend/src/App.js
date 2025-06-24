import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import theme from './theme'; // Our custom theme from Phase 1

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobDetailPage from './pages/JobDetailPage';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Normalizes styles across browsers */}
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* If logged in, redirect from auth pages to dashboard */}
                        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
                        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
                        
                        {/* Protected route for the main dashboard */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <PrivateRoute>
                                    <DashboardPage />
                                </PrivateRoute>
                            } 
                        />

                        {/* --- ADD THIS NEW ROUTE --- */}
                        <Route path="/jobs/:id" element={
                          <PrivateRoute>
                            <JobDetailPage />
                            </PrivateRoute>
                          } 
                          />
                        
                        {/* Default route that redirects users */}
                        {/* For unauthenticated users, this will first hit PrivateRoute,
                            then redirect to /login. For authenticated users, it will
                            show the dashboard. */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

// Helper component to prevent logged-in users from revisiting login/register pages
const AuthRedirect = ({children}) => {
    const { user } = useContext(AuthContext);
    // If the user object exists, they are logged in, so redirect them.
    return user ? <Navigate to="/dashboard" /> : children;
}

export default App;