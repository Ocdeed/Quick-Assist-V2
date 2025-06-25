/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Switch, FormControlLabel, Grid, Button, Divider, Chip, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { styled } from '@mui/material/styles';

import AuthContext from '../context/AuthContext';
import { getAvailableRequests, acceptServiceRequest, getProviderJobs, declineJob } from '../api/serviceApi';

import AvailableJobCard from './AvailableJobCard';
import ProviderJobsList from './ProviderJobsList';
import ConfirmationModal from './ConfirmationModal';
import ActiveJobPanel from './ActiveJobPanel';
import StatCard from './StatCard';

// A custom-styled Switch for a more premium "Go Live" feel
const LiveSwitch = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': { borderRadius: 22 / 2, '&:before, &:after': { content: '""', position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16 } },
    '& .MuiSwitch-thumb': { boxShadow: 'none', width: 16, height: 16, margin: 2 },
}));

const JobBoardPanel = ({ providerProfile }) => {
    const { user } = useContext(AuthContext);
    
    // --- STATE MANAGEMENT ---
    // Safely determine verification status, defaulting to false if profile is missing
    const isVerified = providerProfile?.is_verified || false;
    
    const [isAvailable, setIsAvailable] = useState(false);
    const [myJobs, setMyJobs] = useState([]);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [loading, setLoading] = useState({ myJobs: true, available: false, action: null });
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ isOpen: false, request: null, action: '' });
    const [selectedJob, setSelectedJob] = useState(null);

    // --- DATA FETCHING & LOGIC ---
    const fetchMyJobs = useCallback(async () => {
        setLoading(prev => ({ ...prev, myJobs: true }));
        try {
            const response = await getProviderJobs();
            setMyJobs(response.data || []);
        } catch (err) {
            console.error("Error fetching 'My Jobs':", err);
            setMyJobs([]);
        } finally {
            setLoading(prev => ({ ...prev, myJobs: false }));
        }
    }, []);

    const fetchAvailableJobs = useCallback(async () => {
        if (!isAvailable || !isVerified) {
            setAvailableRequests([]);
            return;
        }
        setLoading(prev => ({ ...prev, available: true }));
        setError('');
        try {
            const response = await getAvailableRequests();
            setAvailableRequests(response.data || []);
        } catch (err) {
            setAvailableRequests([]);
            setError(err.response?.data?.error || "Could not search for new jobs.");
        } finally {
            setLoading(prev => ({ ...prev, available: false }));
        }
    }, [isAvailable, isVerified]);

    useEffect(() => {
        fetchMyJobs();
    }, [fetchMyJobs]);

    useEffect(() => {
        if (isAvailable) {
            fetchAvailableJobs(); // Fetch once immediately
        }
    }, [isAvailable, fetchAvailableJobs]);

    const handleAvailabilityChange = (event) => {
        if (!isVerified) {
            setError("Your account must be verified by an administrator to go online.");
            return;
        }
        setIsAvailable(event.target.checked);
    };

    const handleOpenModal = (request, action) => setModal({ isOpen: true, request, action });
    const handleCloseModal = () => setModal({ isOpen: false, request: null, action: '' });
    
    const handleConfirmAction = async () => {
        const { request, action } = modal;
        if (!request) return;
        setLoading(prev => ({ ...prev, action: request.id }));
        const apiCall = action === 'accept' ? acceptServiceRequest(request.id) : declineJob(request.id);
        try {
            await apiCall;
            setAvailableRequests(prev => prev.filter(r => r.id !== request.id));
            if (action === 'accept') await fetchMyJobs();
        } catch (err) {
            setError("Action failed. The job may no longer be available.");
            fetchAvailableJobs();
        } finally {
            setLoading(prev => ({ ...prev, action: null }));
            handleCloseModal();
        }
    };
    
    const updateJobInList = (updatedJob) => {
        setMyJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        if (selectedJob && selectedJob.id === updatedJob.id) setSelectedJob(updatedJob);
    };

    const getModalContent = () => {
        if (!modal.request) return {};
        const serviceName = modal.request.service.name;
        if (modal.action === 'accept') return { title: 'Accept Job?', message: `Are you sure you want to accept the "${serviceName}" job?` };
        if (modal.action === 'decline') return { title: 'Decline Job?', message: `Are you sure you want to decline this job?` };
        return {};
    };

    const pendingRequests = availableRequests.length;
    const activeJobsCount = myJobs.filter(j => ['ACCEPTED', 'IN_PROGRESS'].includes(j.status)).length;
    
    // --- RENDER ---
    return (
        <Box>
            <Paper elevation={0} sx={{ p: {xs: 2, md: 3}, mb: 4, borderRadius: 4, background: `linear-gradient(135deg, ${'#003002'}, ${'#2d5a2d'})`, color: 'white' }}>
                 <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Box>
                       <Typography variant="h5" fontWeight="bold">Hello, {user?.first_name || 'Provider'}!</Typography>
                       <Typography sx={{ opacity: 0.8 }}>{isAvailable ? "You're live! New jobs will appear below." : "Ready to start your day? Go online."}</Typography>
                   </Box>
                    <Tooltip title={isVerified ? "" : "Your account must be verified to go online."} arrow>
                       <Box sx={{ textAlign: 'center' }}>
                           <FormControlLabel control={<LiveSwitch checked={isAvailable} onChange={handleAvailabilityChange} disabled={!isVerified} />} label="" />
                           <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>{isAvailable ? "LIVE" : "OFFLINE"}</Typography>
                       </Box>
                    </Tooltip>
                 </Box>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}><StatCard title="New Requests Waiting" value={pendingRequests} icon={<NewReleasesIcon />} color="warning" /></Grid>
                <Grid item xs={12} sm={4}><StatCard title="Active Jobs" value={activeJobsCount} icon={<PlaylistAddCheckIcon />} color="primary" /></Grid>
                <Grid item xs={12} sm={4}><StatCard title="Your Rating" value={providerProfile?.average_rating?.toFixed(1) || 'N/A'} icon={<StarBorderIcon />} color="info" /></Grid>
            </Grid>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">Nearby Job Requests</Typography>
                        <Button variant="text" startIcon={<RefreshIcon />} onClick={fetchAvailableJobs} disabled={!isAvailable || loading.available}>Refresh</Button>
                    </Box>
                    {error && <Alert severity="warning" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                    
                    {!isVerified ? <Alert severity="error">Your account is not verified. You cannot view or accept jobs.</Alert>
                     : !isAvailable ? <Alert severity="info">You are offline. Flip the "LIVE" switch above to start receiving job requests.</Alert>
                     : loading.available ? <Box textAlign="center" p={5}><CircularProgress /></Box>
                     : availableRequests.length > 0 ? (
                         <AnimatePresence>
                             {availableRequests.map((req) => <AvailableJobCard key={req.id} request={req} onAccept={() => handleOpenModal(req, 'accept')} onDecline={() => handleOpenModal(req, 'decline')} isLoading={loading.action === req.id} />)}
                         </AnimatePresence>
                       ) : <Alert severity="success">You're all set! We're actively looking for jobs in your area.</Alert>
                    }
                </Grid>
                <Grid item xs={12} md={5}>
                    {loading.myJobs ? <CircularProgress /> : <ProviderJobsList jobs={myJobs} title="My Active & Upcoming Jobs" onSelectJob={setSelectedJob} />}
                </Grid>
            </Grid>

            <ConfirmationModal open={modal.isOpen} handleClose={handleCloseModal} onConfirm={handleConfirmAction} isLoading={!!loading.action} {...getModalContent()} />
            <ActiveJobPanel job={selectedJob} onClose={() => setSelectedJob(null)} onStatusChange={updateJobInList} />
        </Box>
    );
};
export default JobBoardPanel;