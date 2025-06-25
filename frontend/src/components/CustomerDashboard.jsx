import { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert, Grid, Divider, Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import { motion, AnimatePresence } from 'framer-motion';

import AuthContext from '../context/AuthContext';
import pusher from '../api/pusher';
import { getCustomerRequests } from '../api/serviceApi';

// Import all necessary child components
import RequestServiceModal from './RequestServiceModal';
import ServiceRequestCard from './ServiceRequestCard';
import PaymentModal from './PaymentModal';
import ReviewModal from './ReviewModal';

const CustomerDashboard = () => {
    // --- STATE MANAGEMENT ---
    const { user } = useContext(AuthContext);
    
    // State for core data
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for controlling all modals on this page
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [jobToPay, setJobToPay] = useState(null);       // Holds the job object for the payment modal
    const [jobToReview, setJobToReview] = useState(null); // Holds the job object for the review modal

    // --- DATA FETCHING ---
    const fetchRequests = useCallback(async () => {
        // Don't set loading to true for background refreshes, only for initial load
        if (requests.length === 0) setIsLoading(true);
        setError('');
        try {
            const response = await getCustomerRequests();
            setRequests(response.data || []);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
            setError('Could not load your service requests.');
            setRequests([]); // Ensure state is an array on error
        } finally {
            setIsLoading(false);
        }
    }, [requests.length]); // Dependency on requests.length helps with initial load state

    // Initial data fetch
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]); // useCallback ensures this is a stable function
    
    // Real-time updates via Pusher
    useEffect(() => {
        if (!user?.id) return;

        const channelName = `private-user-${user.id}`;
        const channel = pusher.subscribe(channelName);
        
        // This single handler can update the job in the list for any status change
        const handleRequestUpdate = (updatedRequest) => {
            setRequests(currentRequests =>
                currentRequests.map(req =>
                    req.id === updatedRequest.id ? updatedRequest : req
                )
            );
        };
        
        // Listen for all relevant events that might update a job's state
        channel.bind('request-accepted', (data) => handleRequestUpdate(data.request));
        channel.bind('status-update', (data) => {
             // For generic status updates, it's safer to re-fetch to get the full updated object
             fetchRequests(); 
        });

        // Cleanup subscription on component unmount
        return () => {
            pusher.unsubscribe(channelName);
            channel.unbind_all();
        };
    }, [user?.id, fetchRequests]);
    
    // --- ACTION HANDLERS ---
    const handleRequestCreated = () => {
        fetchRequests();
        setIsRequestModalOpen(false);
    };

    // These functions are passed down as props to the ServiceRequestCard
    const handlePayClick = (job) => setJobToPay(job);
    const handleReviewClick = (job) => setJobToReview(job);
    
    const onModalSuccess = () => {
        // Close both modals and re-fetch data to get the latest job status
        setJobToPay(null);
        setJobToReview(null);
        fetchRequests(); 
    };

    // Filter requests into active and past categories for display
    const activeJobs = requests.filter(req => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(req.status));
    const pastJobs = requests.filter(req => ['COMPLETED', 'CANCELLED'].includes(req.status));


    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (isLoading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
        }
        if (error) {
            return <Alert severity="error">{error}</Alert>
        }
        return (
            <>
                {/* --- Active Jobs Section --- */}
                <Box>
                    <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                        Active Requests ({activeJobs.length})
                    </Typography>
                    {activeJobs.length > 0 ? (
                        <Grid container spacing={3}>
                            <AnimatePresence>
                                {activeJobs.map((request) => (
                                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                                        <ServiceRequestCard request={request} onPayClick={handlePayClick} onReviewClick={handleReviewClick} />
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                    ) : (
                        <Alert severity="info" variant="outlined" sx={{mt:2}}>You have no active job requests. Click "Request a Service" to get started!</Alert>
                    )}
                </Box>
                
                {/* --- Job History Section --- */}
                <Divider sx={{ my: 5, "::before, ::after": { borderColor: 'primary.light'} }}>
                    <Chip icon={<HistoryIcon />} label="JOB HISTORY" />
                </Divider>

                <Box>
                    {pastJobs.length > 0 ? (
                        <Grid container spacing={3}>
                            {pastJobs.map((request) => (
                                <Grid item xs={12} sm={6} md={4} key={request.id}>
                                    {/* The same card component handles both active and past jobs seamlessly */}
                                    <ServiceRequestCard request={request} onPayClick={handlePayClick} onReviewClick={handleReviewClick} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="text.secondary" textAlign="center">Your completed and cancelled jobs will appear here.</Typography>
                    )}
                </Box>
            </>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 4 },
                        mb: 4,
                        bgcolor: 'primary.dark',
                        color: 'white',
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, hsl(120, 98%, 10%), hsl(120, 39%, 27%))'
                    }}
                >
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" component="h1" fontWeight="bold">Welcome, {user?.first_name}!</Typography>
                            <Typography sx={{ mt: 1, opacity: 0.8 }}>Ready to get things done? Request a service and get help in minutes.</Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => setIsRequestModalOpen(true)}
                                sx={{ py: '12px', px: '24px', fontSize: '1rem', borderRadius: 99, boxShadow: 3 }}
                            >
                                Request New Service
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </motion.div>
            
            {renderContent()}

            {/* --- All Modals for this page are rendered here --- */}
            <RequestServiceModal
                open={isRequestModalOpen}
                handleClose={() => setIsRequestModalOpen(false)}
                onSuccess={handleRequestCreated}
            />

            {/* The Payment Modal is only mounted when a job is selected for payment */}
            {jobToPay && (
                <PaymentModal 
                    open={!!jobToPay}
                    handleClose={() => setJobToPay(null)}
                    job={jobToPay}
                    onPaymentSuccess={onModalSuccess}
                />
            )}
            
            {/* The Review Modal is only mounted when a job is selected for review */}
            {jobToReview && (
                 <ReviewModal 
                    open={!!jobToReview}
                    handleClose={() => setJobToReview(null)}
                    job={jobToReview}
                    onReviewSubmit={onModalSuccess}
                />
            )}
        </Container>
    );
};

export default CustomerDashboard;