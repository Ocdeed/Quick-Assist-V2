import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, CircularProgress, Alert, 
    Switch, FormControlLabel, Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { motion, AnimatePresence } from 'framer-motion';

import { getAvailableRequests, acceptServiceRequest } from '../api/serviceApi';

const ProviderDashboard = () => {
    // This state would eventually be fetched from the user's profile
    const [isAvailable, setIsAvailable] = useState(false); 
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Polling mechanism to fetch jobs periodically when available
    useEffect(() => {
        let intervalId;
        
        const fetchJobs = async () => {
            if (!isAvailable) {
                setRequests([]); // Clear requests if toggled off
                return;
            }
            
            setIsLoading(true);
            setError(''); // Clear previous errors
            try {
                const response = await getAvailableRequests();
                setRequests(response.data);
            } catch (err) {
                // Get specific error from backend, or a generic one
                const errorMessage = err.response?.data?.error || "Could not fetch available jobs.";
                setError(errorMessage);
                // If there's an error (e.g., location not set), stop polling
                setIsAvailable(false); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs(); // Fetch immediately on status change

        if (isAvailable) {
            // Set up an interval to poll for new jobs
            intervalId = setInterval(fetchJobs, 20000); // Poll every 20 seconds
        }

        // Cleanup function to clear the interval when the component unmounts
        // or when the isAvailable state changes.
        return () => clearInterval(intervalId); 
    }, [isAvailable]);

    const handleAcceptJob = async (requestId) => {
        const originalRequests = [...requests];
        // Optimistic UI: remove the job from the list immediately for a snappy feel
        setRequests(prev => prev.filter(r => r.id !== requestId));
        
        try {
            await acceptServiceRequest(requestId);
            // On success, we don't need to do anything further here.
            // The job is now assigned to this provider. We'd navigate to a
            // job details page in a future phase.
        } catch(err) {
            setError("Failed to accept job. It may have been taken by another provider.");
            // Rollback: if the API call fails, put the job back in the list
            setRequests(originalRequests);
        }
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
             <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
            >
                 <Paper sx={{ p: {xs: 2, sm: 3}, mb: 4, display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ mb: {xs: 2, sm: 0}, textAlign: {xs: 'center', sm: 'left'} }}>
                        <Typography variant="h5" component="h1" fontWeight="bold">Available Jobs</Typography>
                        <Typography color="text.secondary">Toggle your status to see nearby job requests.</Typography>
                    </Box>
                    <Paper elevation={0} sx={{ p: 1, borderRadius: 20, bgcolor: isAvailable ? 'success.light' : 'grey.300', display: 'flex', alignItems: 'center' }}>
                         <FormControlLabel
                            control={<Switch checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} color="primary"/>}
                            label={isAvailable ? "You are ONLINE" : "You are OFFLINE"}
                            sx={{mr: 1, '& .MuiFormControlLabel-label': { fontWeight: 'bold'} }}
                        />
                    </Paper>
                </Paper>

                {/* Main Content Area */}
                <Box>
                    {error && <Alert severity="error" onClose={() => setError('')} sx={{mb: 2}}>{error}</Alert>}
                    
                    {isLoading && requests.length === 0 && (
                        <Box sx={{display: 'flex', justifyContent: 'center', my: 5}}><CircularProgress /></Box>
                    )}

                    {!isAvailable && !isLoading && (
                        <Alert severity="info" icon={<DoNotDisturbIcon/>} sx={{justifyContent: 'center'}}>
                            You are currently offline. Turn the switch on to find new jobs.
                        </Alert>
                    )}

                    {isAvailable && !isLoading && !error && requests.length === 0 && (
                        <Alert severity="success" icon={<NotificationsActiveIcon />} sx={{justifyContent: 'center'}}>
                           You're online and ready for new jobs! We'll notify you when one comes in.
                        </Alert>
                    )}

                    <AnimatePresence>
                    {requests.map((req, index) => (
                        <motion.div
                            key={req.id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <Paper variant="outlined" sx={{ p: {xs: 2, sm: 3}, mb: 2, display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                <Box>
                                    <Typography fontWeight="bold">{req.service.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        For: {req.customer_name}
                                    </Typography>
                                </Box>
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    startIcon={<CheckCircleIcon/>} 
                                    onClick={() => handleAcceptJob(req.id)}
                                >
                                    Accept Job
                                </Button>
                            </Paper>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </Box>

            </motion.div>
        </Container>
    );
}

export default ProviderDashboard;