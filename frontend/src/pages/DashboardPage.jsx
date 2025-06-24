import { useContext } from 'react';
import { Box } from '@mui/material';
import AuthContext from '../context/AuthContext';
import AppHeader from '../components/AppHeader';

// We'll create these two new components next
import CustomerDashboard from '../components/CustomerDashboard';
import ProviderDashboard from '../components/ProviderDashboard';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppHeader />
            {/* Conditional rendering based on the user's role */}
            {user?.role === 'CUSTOMER' && <CustomerDashboard />}
            {user?.role === 'PROVIDER' && <ProviderDashboard />}
        </Box>
    );
};

export default DashboardPage;