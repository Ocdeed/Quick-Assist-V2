import { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, Grid, CircularProgress, Alert, Switch, FormControlLabel, Button, Divider, Chip, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';

// --- Import Icons ---
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// --- Import API Functions ---
import { getAvailableRequests, acceptServiceRequest, getProviderJobs, declineJob } from '../api/serviceApi';

// --- Import Child Components ---
import ServiceManagementPanel from './ServiceManagementPanel';
import ProviderJobsList from './ProviderJobsList';
import AvailableJobCard from './AvailableJobCard';
import ConfirmationModal from './ConfirmationModal';
import ActiveJobPanel from './ActiveJobPanel';
import StatCard from './StatCard'; // The new component for stats

/**
 * TabPanel Helper Component
 */
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`provider-tabpanel-${index}`} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}


// ##################################################################
// #                  MAIN PROVIDER DASHBOARD COMPONENT             #
// ##################################################################

const ProviderDashboard = () => {
    // --- CONTEXT & DERIVED STATE ---
    const { user } = useContext(AuthContext);
    const providerProfile = user?.profile?.provider_profile;
    const isVerified = providerProfile?.is_verified || false;

    // --- CORE STATE MANAGEMENT ---
    const [currentTab, setCurrentTab] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false); // Provider's online/offline status
    const [myJobs, setMyJobs] = useState([]);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [loading, setLoading] = useState({ myJobs: true, available: false, action: null });
    const [error, setError] = useState('');

    // --- UI INTERACTION STATE ---
    const [selectedJob, setSelectedJob] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, request: null, action: '' });


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
        setError(''); // Clear previous errors on a new fetch
        try {
            const response = await getAvailableRequests();
            setAvailableRequests(response.data || []);
        } catch (err) {
            setAvailableRequests([]);
            setError(err.response?.data?.error || "Could not search for new jobs at this time.");
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
            const intervalId = setInterval(fetchAvailableJobs, 30000); // And then poll every 30 seconds
            return () => clearInterval(intervalId); // Cleanup
        }
    }, [isAvailable, fetchAvailableJobs]);


    // --- ACTION & MODAL HANDLERS ---
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
            // Optimistically remove from available list
            setAvailableRequests(prev => prev.filter(r => r.id !== request.id));
            if (action === 'accept') await fetchMyJobs();
        } catch (err) {
            setError("Action failed. The job may no longer be available.");
            fetchAvailableJobs(); // Re-sync the available jobs list
        } finally {
            setLoading(prev => ({ ...prev, action: null }));
            handleCloseModal();
        }
    };

    const handleStatusUpdateInPanel = (updatedJob) => {
        // This function will be passed to the ActiveJobPanel to update our main lists
        setMyJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        if (selectedJob && selectedJob.id === updatedJob.id) {
            setSelectedJob(updatedJob); // Also update the panel's view if it's open
        }
    };

    const getModalContent = () => {
        if (!modal.request) return {};
        const serviceName = modal.request.service.name;
        if (modal.action === 'accept') return { title: 'Accept Job Request?', message: `Are you sure you want to accept the "${serviceName}" job?` };
        if (modal.action === 'decline') return { title: 'Decline Job Request?', message: `Are you sure you want to decline this job?` };
        return {};
    };

    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    // Calculate stats for the stat cards
    const jobsCompleted = myJobs.filter(j => j.status === 'COMPLETED').length;
    const pendingRequests = availableRequests.length;
    const activeJobsCount = myJobs.filter(j => ['ACCEPTED', 'IN_PROGRESS'].includes(j.status)).length;
    

    // --- RENDER LOGIC ---
    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                {/* ... Main Header Paper ... */}
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth" /*...*/>
                        {/* Tab definitions... */}
                    </Tabs>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                    <TabPanel value={currentTab} index={0}>
                        {/* ############# JOB BOARD PANEL CONTENT ############# */}
                        <Box>
                             <Paper elevation={0} sx={{ p: {xs:2, md:3}, mb: 4, borderRadius: 4, background: `linear-gradient(135deg, ${'#003002'}, ${'#2d5a2d'})`, color: 'white' }}>
                                 <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                     <Box>
                                        <Typography variant="h5" fontWeight="bold">Hello, {user?.first_name || 'Provider'}!</Typography>
                                        <Typography sx={{ opacity: 0.8 }}>{isAvailable ? "You're live! New jobs will appear below." : "Ready to start your day? Go online."}</Typography>
                                    </Box>
                                     <Tooltip title={isVerified ? "" : "Your account must be verified to go online."} arrow>
                                        <FormControlLabel control={<Switch checked={isAvailable} onChange={handleAvailabilityChange} color="warning" />} label={<Typography fontWeight="bold">{isAvailable ? "LIVE" : "OFFLINE"}</Typography>}/>
                                     </Tooltip>
                                 </Box>
                             </Paper>
                            
                             <Grid container spacing={3} sx={{ mb: 4 }}>
                                 <Grid item xs={12} sm={4}><StatCard title="New Requests Waiting" value={pendingRequests} icon={<NewReleasesIcon />} color="warning" /></Grid>
                                 <Grid item xs={12} sm={4}><StatCard title="Active Jobs" value={activeJobsCount} icon={<PlaylistAddCheckIcon />} color="primary" /></Grid>
                                 <Grid item xs={12} sm={4}><StatCard title="Rating" value="N/A" icon={<StarBorderIcon />} color="info" /></Grid>
                             </Grid>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">Nearby Job Requests</Typography>
                                        <Button variant="text" startIcon={<RefreshIcon />} onClick={fetchAvailableJobs} disabled={!isAvailable || loading.available}>Refresh</Button>
                                    </Box>
                                    {error && <Alert severity="warning" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                                    
                                    {!isVerified ? <Alert severity="error">Your account is not verified. You cannot view or accept jobs.</Alert>
                                    : !isAvailable ? <Alert severity="info">You are offline. Turn the switch "LIVE" to see new job requests.</Alert>
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
                        </Box>
                    </TabPanel>
                    <TabPanel value={currentTab} index={1}><ServiceManagementPanel providerProfile={providerProfile} /></TabPanel>
                    <TabPanel value={currentTab} index={2}>{/* Performance Panel Placeholder */}</TabPanel>
                </Box>
            </motion.div>
            
            <ConfirmationModal open={modal.isOpen} handleClose={handleCloseModal} onConfirm={handleConfirmAction} isLoading={!!loading.action} {...getModalContent()} />
            <ActiveJobPanel job={selectedJob} onClose={() => setSelectedJob(null)} onStatusChange={handleStatusUpdateInPanel} />
        </Container>
    );
};

export default ProviderDashboard;