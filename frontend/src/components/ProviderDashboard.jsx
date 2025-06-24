/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Box, Paper, CircularProgress, Alert, 
    Switch, FormControlLabel, Button, Divider, Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';

import { getAvailableRequests, acceptServiceRequest, getProviderJobs } from '../api/serviceApi';
import ProviderJobsList from './ProviderJobsList'; // Import our new component

const ProviderDashboard = () => {
    const [isAvailable, setIsAvailable] = useState(false);
    
    // State for the two different lists of jobs
    const [availableRequests, setAvailableRequests] = useState([]);
    const [myJobs, setMyJobs] = useState([]);

    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [loadingMyJobs, setLoadingMyJobs] = useState(true);
    const [error, setError] = useState('');

    const fetchMyJobs = useCallback(async () => {
        setLoadingMyJobs(true);
        try {
            const response = await getProviderJobs();
            setMyJobs(response.data);
        } catch (err) {
            console.error("Failed to fetch my jobs", err);
        } finally {
            setLoadingMyJobs(false);
        }
    }, []);

    // Effect to fetch "My Jobs" once on component load
    useEffect(() => {
        fetchMyJobs();
    }, [fetchMyJobs]);

    // Effect for polling "Available Jobs" only when the provider is online
    useEffect(() => {
        let intervalId;
        
        const fetchAvailableJobs = async () => {
            if (!isAvailable) {
                setAvailableRequests([]); // Clear available jobs when offline
                return;
            }
            
            setLoadingAvailable(true);
            setError(''); 
            try {
                const response = await getAvailableRequests();
                setAvailableRequests(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.error || "Could not find nearby jobs.";
                setError(errorMessage);
                // Turn off polling if there's a config error (like location not set)
                if (err.response?.status === 400) setIsAvailable(false);
            } finally {
                setLoadingAvailable(false);
            }
        };

        fetchAvailableJobs();
        if (isAvailable) {
            intervalId = setInterval(fetchAvailableJobs, 20000); 
        }

        return () => clearInterval(intervalId);
    }, [isAvailable]);

    const handleAcceptJob = async (requestId) => {
        // Optimistically remove from available list
        setAvailableRequests(prev => prev.filter(r => r.id !== requestId));
        try {
            await acceptServiceRequest(requestId);
            // After accepting, refresh the "My Jobs" list to include the new one
            await fetchMyJobs();
        } catch(err) {
            setError("Failed to accept job. It may have been taken.");
        }
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                 <Paper sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" component="h1" fontWeight="bold">Provider Dashboard</Typography>
                    </Box>
                     <FormControlLabel
                        control={<Switch checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} color="primary"/>}
                        label={isAvailable ? "Online & Looking for Jobs" : "Offline"}
                        sx={{fontWeight: 'bold' }}
                    />
                </Paper>
                
                <Grid container spacing={4}>
                    {/* Column 1: Available Jobs */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Nearby Job Requests</Typography>
                        {error && <Alert severity="warning" sx={{mb: 2}}>{error}</Alert>}
                        
                        {isAvailable ? (
                            loadingAvailable ? <CircularProgress /> : (
                                <AnimatePresence>
                                {availableRequests.length > 0 ? (
                                    availableRequests.map((req, index) => (
                                        <motion.div key={req.id} layout initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: index * 0.1}}>
                                            <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                                <Box>
                                                    <Typography fontWeight="bold">{req.service.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">For: {req.customer_name}</Typography>
                                                </Box>
                                                <Button variant="contained" startIcon={<CheckCircleIcon/>} onClick={() => handleAcceptJob(req.id)}>Accept</Button>
                                            </Paper>
                                        </motion.div>
                                    ))
                                ) : (
                                    <Alert severity="info">No new jobs found nearby. We'll keep searching...</Alert>
                                )}
                                </AnimatePresence>
                            )
                        ) : (
                            <Alert severity="info">Turn the switch "Online" to see new job requests.</Alert>
                        )}
                    </Grid>
                    
                    {/* Column 2: My Accepted Jobs */}
                    <Grid item xs={12} md={6}>
                         {loadingMyJobs ? <CircularProgress /> : <ProviderJobsList jobs={myJobs} title="My Active & Past Jobs"/>}
                    </Grid>
                </Grid>

            </motion.div>
        </Container>
    );
}

export default ProviderDashboard;