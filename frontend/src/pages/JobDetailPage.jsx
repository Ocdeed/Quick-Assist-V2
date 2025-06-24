// src/pages/JobDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';

import AppHeader from '../components/AppHeader';
import JobTrackingMap from '../components/JobTrackingMap'; // To be created
import ChatBox from '../components/ChatBox'; // To be created
// We need a way to fetch a single job's details. Let's add that to serviceApi.
import { getServiceRequestDetails } from '../api/serviceApi';
import { motion } from 'framer-motion';

const JobDetailPage = () => {
    const { id } = useParams(); // Gets the request ID from the URL, e.g., /jobs/2
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobDetails = async () => {
            setLoading(true);
            try {
                const response = await getServiceRequestDetails(id);
                setRequest(response.data);
            } catch (err) {
                setError('Could not load job details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    if (loading) {
        return <Box sx={{display: 'flex', justifyContent:'center', mt:10}}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }
    
    if (!request) {
        return <Typography>Job not found.</Typography>;
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppHeader />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <Paper sx={{ p: 3, mb: 3 }}>
                         <Typography variant="h5" fontWeight="bold">Job Details: #{request.id}</Typography>
                         <Typography color="text.secondary">Tracking service for: {request.service.name}</Typography>
                    </Paper>

                    <Grid container spacing={3}>
                        {/* Map Component */}
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ height: '500px', width: '100%', overflow:'hidden' }} variant="outlined">
                                <JobTrackingMap request={request} />
                            </Paper>
                        </Grid>

                        {/* Chat Component */}
                        <Grid item xs={12} md={5}>
                             <Paper sx={{ height: '500px', width: '100%' }} variant="outlined">
                                <ChatBox request={request} />
                            </Paper>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};

export default JobDetailPage;