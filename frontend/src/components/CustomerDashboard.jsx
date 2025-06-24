import { useState, useEffect, useContext } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert, Grid, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import { motion, AnimatePresence } from 'framer-motion';

import AuthContext from '../context/AuthContext';
import pusher from '../api/pusher';
import { getCustomerRequests } from '../api/serviceApi';

import RequestServiceModal from './RequestServiceModal';
import ServiceRequestCard from './ServiceRequestCard';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [modalOpen, setModalOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getCustomerRequests();
            setRequests(response.data);
        } catch (err) {
            setError('Failed to fetch your requests. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Initial fetch
    useEffect(() => {
        fetchRequests();
    }, []);
    
    // Pusher real-time updates
    useEffect(() => {
        if (!user?.id) return;
        const channelName = `private-user-${user.id}`;
        const channel = pusher.subscribe(channelName);
        
        channel.bind('request-accepted', (data) => {
            const updatedRequest = data.request;
            setRequests(current => current.map(req => (req.id === updatedRequest.id ? updatedRequest : req)));
        });

        // Add binders for other real-time events here later, e.g., 'request-completed'
        
        return () => pusher.unsubscribe(channelName);
    }, [user?.id]);
    
    const handleRequestCreated = () => {
        fetchRequests(); // Re-fetch all requests to include the new one
        setModalOpen(false);
    };

    // Filter requests into active and past jobs
    const activeJobs = requests.filter(req => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(req.status));
    const pastJobs = requests.filter(req => ['COMPLETED', 'CANCELLED'].includes(req.status));

    // --- RENDER LOGIC ---

    const renderContent = () => {
        if (isLoading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
        }
        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }
        return (
            <Grid container spacing={4}>
                {/* Active Jobs Section */}
                <Grid item xs={12}>
                    <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                        Active Jobs ({activeJobs.length})
                    </Typography>
                    {activeJobs.length > 0 ? (
                        <Grid container spacing={3}>
                            <AnimatePresence>
                            {activeJobs.map((request) => (
                                <Grid item xs={12} sm={6} md={4} key={request.id}>
                                    <ServiceRequestCard request={request} />
                                </Grid>
                            ))}
                            </AnimatePresence>
                        </Grid>
                    ) : (
                        <Typography color="text.secondary">You have no active job requests.</Typography>
                    )}
                </Grid>

                {/* Past Jobs Section */}
                <Grid item xs={12}>
                    <Divider sx={{ my: 4 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <HistoryIcon color="action" />
                        <Typography variant="h5" component="h2" fontWeight="bold">
                            Job History
                        </Typography>
                    </Box>
                    {pastJobs.length > 0 ? (
                         <Grid container spacing={3}>
                            {pastJobs.map((request) => (
                                <Grid item xs={12} sm={6} md={4} key={request.id}>
                                    <ServiceRequestCard request={request} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="text.secondary">Your past jobs will appear here.</Typography>
                    )}
                </Grid>
            </Grid>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header / Call to Action */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 4 },
                    mb: 4,
                    bgcolor: 'primary.dark',
                    color: 'white',
                    borderRadius: 4,
                }}
            >
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" component="h1" fontWeight="bold">
                            Welcome back, {user?.first_name}!
                        </Typography>
                        <Typography sx={{ mt: 1, opacity: 0.8 }}>
                            Ready to get things done? Request a service and get help in minutes.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                             <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                startIcon={<AddCircleIcon />}
                                onClick={() => setModalOpen(true)}
                            >
                                Request a Service
                            </Button>
                        </motion.div>
                    </Grid>
                </Grid>
            </Paper>
            
            {/* Main Content */}
            {renderContent()}

            <RequestServiceModal
                open={modalOpen}
                handleClose={() => setModalOpen(false)}
                onSuccess={handleRequestCreated}
            />
        </Container>
    );
};

export default CustomerDashboard;