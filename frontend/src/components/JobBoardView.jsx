// src/components/JobBoardView.jsx
import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Button } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';

import { getAvailableRequests, getProviderJobs, acceptServiceRequest } from '../api/serviceApi';
import AvailableJobCard from './AvailableJobCard';
import ProviderJobsList from './ProviderJobsList'; // Shows accepted jobs

const JobBoardView = ({ onSelectJob }) => {
    const [availableRequests, setAvailableRequests] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [availableRes, myJobsRes] = await Promise.all([
                getAvailableRequests(),
                getProviderJobs()
            ]);
            setAvailableRequests(availableRes.data);
            setMyJobs(myJobsRes.data);
        } catch (error) { console.error("Failed to load jobs:", error); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        // Here you would add real-time Pusher listeners to call fetchData()
    }, [fetchData]);

    const handleAccept = async (job) => {
        try {
            await acceptServiceRequest(job.id);
            await fetchData(); // Refresh both lists after accepting
        } catch (error) { console.error("Failed to accept job", error); }
    };

    if (loading) return <Box p={5} textAlign="center"><CircularProgress/></Box>;
    
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Live Job Feed</Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
            </Box>
            
            <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>New Requests Nearby</Typography>
                    <AnimatePresence>
                        {availableRequests.length > 0 ? (
                             availableRequests.map(req => (
                                <AvailableJobCard key={req.id} request={req} onAccept={() => handleAccept(req)} />
                             ))
                        ) : <Typography variant="body2" color="text.secondary">No new requests in your area right now.</Typography> }
                    </AnimatePresence>
                </Grid>
                <Grid item xs={12} lg={6}>
                     <Typography variant="h6" color="text.secondary" gutterBottom>My Active Jobs</Typography>
                     {/* Pass onSelectJob to this component to open the detail pane */}
                     <ProviderJobsList jobs={myJobs} onSelectJob={onSelectJob} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default JobBoardView;