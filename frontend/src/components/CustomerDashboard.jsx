// src/components/CustomerDashboard.jsx
import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { motion } from 'framer-motion';

import RequestServiceModal from './RequestServiceModal'; // To be created
import ServiceRequestList from './ServiceRequestList'; // To be created
import { getCustomerRequests } from '../api/serviceApi';

const CustomerDashboard = () => {
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
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);
    
    // This function will be passed to the modal to refresh the list after a new request
    const handleRequestCreated = () => {
        fetchRequests();
        setModalOpen(false);
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Paper sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" component="h1" fontWeight="bold">My Service Requests</Typography>
                        <Typography color="text.secondary">View and manage all your service requests here.</Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setModalOpen(true)}
                        sx={{ py: 1.5 }}
                    >
                        Request New Service
                    </Button>
                </Paper>

                {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', my: 5}}><CircularProgress /></Box>}
                {error && <Alert severity="error">{error}</Alert>}
                {!isLoading && !error && <ServiceRequestList requests={requests} />}
                
                <RequestServiceModal 
                    open={modalOpen} 
                    handleClose={() => setModalOpen(false)} 
                    onSuccess={handleRequestCreated}
                />
            </motion.div>
        </Container>
    );
};

export default CustomerDashboard;