/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Grid, Typography, Box, Paper, CircularProgress, Alert, Button, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

// --- Import All Child Components & Context ---
import AppHeader from '../components/AppHeader';
import JobTrackingMap from '../components/JobTrackingMap';
import JobDetailsCard from '../components/JobDetailsCard';
import JobStatusStepper from '../components/JobStatusStepper';
import ChatPanel from '../components/ChatPanel'; // Using the newer ChatPanel
import ReviewModal from '../components/ReviewModal';
import PaymentModal from '../components/PaymentModal';

import { getServiceRequestDetails, updateJobStatus } from '../api/serviceApi';
import AuthContext from '../context/AuthContext';

const JobDetailPage = () => {
    // --- STATE & HOOKS ---
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    // Core data state
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI state for modals
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);


    // --- DATA FETCHING ---
    useEffect(() => {
        if (!id) {
            setError('Job ID is missing.');
            setLoading(false);
            return;
        }

        const fetchJobDetails = async () => {
            setLoading(true);
            try {
                const response = await getServiceRequestDetails(id);
                setRequest(response.data);
            } catch (err) {
                console.error("Failed to fetch job details:", err);
                setError('Could not load job details. It may not exist or you may not have permission.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    
    // --- ACTION HANDLERS ---
    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            const response = await updateJobStatus(request.id, newStatus);
            setRequest(response.data); // Update the page with the new job status
        } catch (err) {
            console.error("Failed to update status", err);
            // Optionally set an error state to show an alert
        } finally {
            setActionLoading(false);
        }
    };
    
    // This is called from the ReviewModal after a successful submission
    const handleReviewSubmitted = () => {
        // Re-fetch the job details to get the new `review` object attached
        getServiceRequestDetails(id).then(res => setRequest(res.data));
    };


    // Helper function to determine the next logical action(s) for the current user
    const getActions = () => {
        if (!request || !user) return [];

        const { status } = request;
        const isCustomer = user.id === request.customer.id;
        
        // This checks if the 'review' object (which is OneToOne) exists on the request
        const hasReviewed = !!request.review; 
        
        // This will be based on a field we could add later, for now we assume payment is always an option if not reviewed
        // A better approach would be: const hasPaid = request.payment_status === 'PAID';
        const hasPaid = false; // Placeholder for now

        // --- Provider Actions ---
        if (!isCustomer) {
            if (status === 'ACCEPTED') return [{ text: "Start Job", action: () => handleStatusUpdate('IN_PROGRESS') }];
            if (status === 'IN_PROGRESS') return [{ text: "Mark Job as Complete", action: () => handleStatusUpdate('COMPLETED') }];
        }
        
        // --- Customer Actions ---
        if (isCustomer && status === 'COMPLETED') {
            const customerActions = [];
            // Assuming for now payment comes first. A `hasPaid` flag would be better.
            if (!hasPaid) {
                 customerActions.push({ text: "Proceed to Payment", action: () => setPaymentModalOpen(true) });
            }
            if (!hasReviewed) {
                 customerActions.push({ text: "Leave a Review", action: () => setReviewModalOpen(true) });
            }
            return customerActions;
        }

        // Return an empty array if no actions are available
        return [];
    };

    const availableActions = getActions();

    // --- RENDER LOGIC ---

    if (loading) {
        return (
            <>
                <AppHeader />
                <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', height: '80vh'}}>
                    <CircularProgress />
                </Box>
            </>
        );
    }

    if (error || !request) {
        return (
             <>
                <AppHeader />
                <Container sx={{mt: 4}}>
                    <Alert severity="error">{error || 'Job could not be found.'}</Alert>
                    <Button startIcon={<ArrowBackIcon/>} onClick={() => navigate('/dashboard')} sx={{mt: 2}}>
                        Back to Dashboard
                    </Button>
                </Container>
             </>
        );
    }
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
            <AppHeader />
            <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
                <Container maxWidth="xl">
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        {/* --- Page Header & Action Bar --- */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
                             <Box>
                                <Button startIcon={<ArrowBackIcon/>} onClick={() => navigate('/dashboard')} sx={{ mb: 1 }}>Back</Button>
                                 <Typography variant="h4" fontWeight="bold">Job Details #{request.id}</Typography>
                             </Box>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 2, sm: 0 } }}>
                                 <Chip label={`Status: ${request.status.replace('_', ' ')}`} color="primary" sx={{fontWeight: 'bold', fontSize: '1rem'}} />
                                {availableActions.map(action => (
                                    <Button
                                        key={action.text}
                                        variant="contained"
                                        size="large"
                                        onClick={action.action}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <CircularProgress size={24} color="inherit" /> : action.text}
                                    </Button>
                                ))}
                             </Box>
                        </Box>
                        <JobStatusStepper status={request.status} />
                        
                        {/* --- Main Two-Column Layout --- */}
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} lg={7}><Box sx={{ height: '70vh', minHeight: '500px' }}><JobTrackingMap request={request} /></Box></Grid>
                            <Grid item xs={12} lg={5}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', height: '70vh', minHeight: '500px', gap: 3 }}>
                                    <Box sx={{ flexShrink: 0 }}><JobDetailsCard request={request} userRole={user.role}/></Box>
                                    <Box sx={{ flexGrow: 1, minHeight: 0 }}><ChatPanel request={request} /></Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </motion.div>
                </Container>
            </Box>
            
            {/* --- Modals --- */}
            {/* Render the modals conditionally to ensure 'request' is not null when they are mounted */}
            {request && (
                <>
                    <ReviewModal 
                        open={reviewModalOpen} 
                        handleClose={() => setReviewModalOpen(false)} 
                        job={request} 
                        onReviewSubmit={handleReviewSubmitted} 
                    />
                    <PaymentModal 
                        open={paymentModalOpen} 
                        handleClose={() => setPaymentModalOpen(false)} 
                        job={request} 
                        onPaymentSuccess={() => { /* Can add logic here later */ }} 
                    />
                </>
            )}
        </Box>
    );
};

export default JobDetailPage;