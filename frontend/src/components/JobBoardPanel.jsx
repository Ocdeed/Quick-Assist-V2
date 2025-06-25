import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Alert,
    Switch, FormControlLabel, Grid, Button
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import all necessary child components
import AvailableJobCard from './AvailableJobCard';
import ProviderJobsList from './ProviderJobsList';
import ConfirmationModal from './ConfirmationModal';

// Import all required API functions from the correct service file
import {
    getAvailableRequests,
    acceptServiceRequest,
    getProviderJobs,
    declineJob
} from '../api/serviceApi';

const JobBoardPanel = ({ providerProfile }) => {
    // Safely get verification status, defaulting to false if the profile hasn't loaded
    const isVerified = providerProfile?.is_verified || false;

    // --- STATE MANAGEMENT for this panel ---
    const [isAvailable, setIsAvailable] = useState(false);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [myJobs, setMyJobs] = useState([]);

    const [loading, setLoading] = useState({
        myJobs: true,
        available: false,
        action: null, // Will hold the ID of the job being acted upon (accepted/declined)
    });

    const [error, setError] = useState('');
    const [modal, setModal] = useState({ isOpen: false, request: null, action: '' });


    // --- DATA FETCHING & LOGIC ---

    const fetchMyJobs = useCallback(async () => {
        setLoading(prev => ({ ...prev, myJobs: true }));
        try {
            const response = await getProviderJobs();
            setMyJobs(response.data || []);
        } catch (err) {
            console.error("Failed to fetch my jobs", err);
            setError("Could not load your accepted jobs.");
            setMyJobs([]); // Reset to empty array on error
        } finally {
            setLoading(prev => ({ ...prev, myJobs: false }));
        }
    }, []);

    const fetchAvailableJobs = useCallback(async () => {
        // Guard clause: Don't fetch if offline or unverified
        if (!isAvailable || !isVerified) {
            setAvailableRequests([]);
            return;
        }

        setLoading(prev => ({ ...prev, available: true }));
        setError(''); // Clear previous errors before a new fetch

        try {
            const response = await getAvailableRequests();
            setAvailableRequests(response.data || []);
        } catch (err) {
            setAvailableRequests([]);
            setError(err.response?.data?.error || "An error occurred while searching for jobs.");
        } finally {
            setLoading(prev => ({ ...prev, available: false }));
        }
    }, [isAvailable, isVerified]);

    // Initial fetch for the provider's own jobs
    useEffect(() => {
        fetchMyJobs();
    }, [fetchMyJobs]);

    // Fetch available jobs only when the 'isAvailable' switch is toggled on
    useEffect(() => {
        if (isAvailable) {
            fetchAvailableJobs();
        }
    }, [isAvailable, fetchAvailableJobs]);


    // --- ACTION & MODAL HANDLERS ---

    const handleAvailabilityChange = (event) => {
        if (!isVerified) {
            setError("Your account must be verified by an admin to go online.");
            return;
        }
        setIsAvailable(event.target.checked);
    };

    const handleOpenModal = (request, action) => {
        setModal({ isOpen: true, request, action });
    };

    const handleCloseModal = () => {
        setModal({ isOpen: false, request: null, action: '' });
    };
    
    const handleConfirmAction = async () => {
        const { request, action } = modal;
        if (!request) return;

        setLoading(prev => ({ ...prev, action: request.id }));
        
        const apiCall = action === 'accept' ? acceptServiceRequest(request.id) : declineJob(request.id);
        
        try {
            await apiCall;
            // Optimistically remove the job from the available list
            setAvailableRequests(prev => prev.filter(r => r.id !== request.id));
            // If the job was accepted, refresh the "My Jobs" list
            if (action === 'accept') {
                await fetchMyJobs();
            }
        } catch (err) {
            setError("Action failed. The job may no longer be available.");
            fetchAvailableJobs(); // Refresh the list to get the latest view
        } finally {
            setLoading(prev => ({ ...prev, action: null }));
            handleCloseModal();
        }
    };
    
    // Helper to provide props to the modal based on the action
    const getModalContent = () => {
        if (!modal.request) return {};
        const serviceName = `"${modal.request.service.name}"`;
        if (modal.action === 'accept') {
            return { title: 'Accept Job Request?', message: `Are you sure you want to accept the ${serviceName} job?` };
        }
        if (modal.action === 'decline') {
            return { title: 'Decline Job Request?', message: `Are you sure you want to decline this job? It will be removed from your list.` };
        }
        return {};
    };
    
    // --- RENDER LOGIC ---
    return (
        <Box>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold">My Work Status</Typography>
                <FormControlLabel
                    control={<Switch checked={isAvailable} onChange={handleAvailabilityChange} />}
                    label={isAvailable ? "Online - Searching for Jobs" : "Offline"}
                />
            </Paper>

            <Grid container spacing={4}>
                {/* --- LEFT COLUMN: AVAILABLE JOBS --- */}
                <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">Nearby Job Requests</Typography>
                        <Button
                            variant="text"
                            startIcon={<RefreshIcon />}
                            onClick={fetchAvailableJobs}
                            disabled={!isAvailable || loading.available}
                        >
                            Refresh
                        </Button>
                    </Box>
                    {error && <Alert severity="warning" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                    
                    {!isVerified && <Alert severity="error" icon={false}>Your account must be verified by an admin to view and accept jobs.</Alert>}
                    
                    {isVerified && !isAvailable && <Alert severity="info" icon={false}>You are offline. Turn the switch on to find new job requests.</Alert>}
                    
                    {isVerified && isAvailable && (
                        loading.available ? (
                            <Box textAlign="center" p={5}><CircularProgress /></Box>
                        ) : availableRequests.length > 0 ? (
                            <AnimatePresence>
                                {availableRequests.map((req) => (
                                    <AvailableJobCard
                                        key={req.id}
                                        request={req}
                                        onAccept={() => handleOpenModal(req, 'accept')}
                                        onDecline={() => handleOpenModal(req, 'decline')}
                                        isLoading={loading.action === req.id}
                                    />
                                ))}
                            </AnimatePresence>
                        ) : (
                            <Alert severity="success" icon={false}>You're online! No new jobs in your area right now.</Alert>
                        )
                    )}
                </Grid>

                {/* --- RIGHT COLUMN: MY ACCEPTED JOBS --- */}
                <Grid item xs={12} md={5}>
                    {loading.myJobs ? (
                        <Box textAlign="center" p={5}><CircularProgress /></Box>
                     ) : (
                        <ProviderJobsList jobs={myJobs} title="My Active & Upcoming Jobs" />
                     )}
                </Grid>
            </Grid>

            <ConfirmationModal
                open={modal.isOpen}
                handleClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                isLoading={!!loading.action}
                {...getModalContent()}
            />
        </Box>
    );
};

export default JobBoardPanel;