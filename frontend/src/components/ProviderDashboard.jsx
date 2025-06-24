// src/components/ProviderDashboard.jsx
import { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, Grid, Alert } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

import AuthContext from '../context/AuthContext';
import { getAvailableRequests, acceptServiceRequest } from '../api/serviceApi';
import ServiceManager from './ServiceManager';
import AvailableJobCard from './AvailableJobCard';
import ProviderStatusCard from './ProviderStatusCard';
import ConfirmationModal from './ConfirmationModal';
import ProviderJobsList from './ProviderJobsList'; // Still need this for accepted jobs

const ProviderDashboard = () => {
    const { user } = useContext(AuthContext);
    const providerProfile = user?.profile?.provider_profile;
    
    // --- STATE MANAGEMENT ---
    const [isAvailable, setIsAvailable] = useState(false);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [myJobs, setMyJobs] = useState([]); // This would be fetched from getProviderJobs
    
    const [loading, setLoading] = useState({
        available: false,
        accepting: null
    });
    const [error, setError] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, requestToAccept: null });

    // --- LOGIC ---
    const fetchAvailableJobs = useCallback(async () => { /* ... logic is the same ... */}, [isAvailable]);
    
    // Switch between the "Studio" view and the "Job Board" view
    const handleAvailabilityChange = (event) => {
        // Prevent unverified providers from going online
        if (!providerProfile?.is_verified) {
            setError("You must be verified by an admin to go online.");
            return;
        }
        setIsAvailable(event.target.checked);
    };

    useEffect(() => {
        if(isAvailable) fetchAvailableJobs();
    }, [isAvailable, fetchAvailableJobs]);

    const handleOpenConfirm = (request) => {
        setModalState({ 
            isOpen: true, 
            requestToAccept: request 
        });
    };
    
    const handleCloseConfirm = () => {
        setModalState({ 
            isOpen: false, 
            requestToAccept: null 
        });
    };
    
    const handleAcceptJob = async () => {
        const requestId = modalState.requestToAccept?.id;
        if (!requestId) return;
        
        setLoading(prev => ({ ...prev, accepting: requestId }));
        try {
            await acceptServiceRequest(requestId);
            setAvailableRequests(prev => prev.filter(r => r.id !== requestId));
            // You might want to update myJobs here or fetch them again
        } catch (err) {
            setError(err.message || "Failed to accept the job");
        } finally {
            setLoading(prev => ({ ...prev, accepting: null }));
            handleCloseConfirm();
        }
    };

    // --- RENDER LOGIC ---

    // The layout changes completely if the provider is online
    if (isAvailable) {
        // --- The "MISSION CONTROL" VIEW (Online) ---
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                 <ProviderStatusCard providerProfile={providerProfile} isAvailable={isAvailable} onAvailabilityChange={handleAvailabilityChange} isLoading={loading.available} />
                 
                 <Typography variant="h5" fontWeight="bold" sx={{mt: 4, mb: 2}}>Live Job Feed</Typography>
                 {error && <Alert severity="warning" onClose={() => setError('')} sx={{mb: 2}}>{error}</Alert>}
                 <AnimatePresence>
                 {loading.available ? <Box textAlign="center" p={5}><CircularProgress/></Box> : 
                    availableRequests.length > 0 ? availableRequests.map(req => (
                        <AvailableJobCard key={req.id} request={req} onAccept={handleOpenConfirm} isLoading={loading.accepting === req.id}/>
                    )) : 
                    <Alert severity="success">You're online and ready! No new jobs in your area right now.</Alert>}
                 </AnimatePresence>
                
                 {/* Still show "My Jobs" but less prominently */}
                 <Box mt={5}><ProviderJobsList jobs={myJobs} title="My Accepted Jobs"/></Box>

                 <ConfirmationModal /* ... props ... */ />
            </Container>
        );
    }

    // --- The "MY STUDIO" VIEW (Verified & Offline) ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ProviderStatusCard providerProfile={providerProfile} isAvailable={isAvailable} onAvailabilityChange={handleAvailabilityChange} />

                 {/* For the studio view, we show Service Management and Past jobs */}
                 <Grid container spacing={4} sx={{mt: 2}}>
                    <Grid item xs={12} lg={8}>
                        <ServiceManager providerProfile={providerProfile} />
                    </Grid>
                     <Grid item xs={12} lg={4}>
                         <ProviderJobsList jobs={myJobs} title="My Recently Completed Jobs"/>
                     </Grid>
                 </Grid>
             </motion.div>
        </Container>
    );
};
export default ProviderDashboard;