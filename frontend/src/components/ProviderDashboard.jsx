import { useState, useEffect, useContext, useCallback } from 'react';
import {
    Container, Typography, Box, Paper, Tabs, Tab, Grid, CircularProgress,
    Alert, FormControlLabel, Switch, Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';

// Import MUI Icons for the tabs and buttons
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import API functions from their correct locations
import { getAvailableRequests, acceptServiceRequest, getProviderJobs, declineJob } from '../api/serviceApi';

// Import Child Components
import ServiceManagementPanel from './ServiceManagementPanel';
import ProviderJobsList from './ProviderJobsList';
import AvailableJobCard from './AvailableJobCard';
import ConfirmationModal from './ConfirmationModal';
import ActiveJobPanel from './ActiveJobPanel'; // Make sure this is imported

// Helper component to render the content of each tab
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`provider-tabpanel-${index}`} {...other}>
            {value === index && (<Box sx={{ pt: 3 }}>{children}</Box>)}
        </div>
    );
}

const ProviderDashboard = () => {
    const { user } = useContext(AuthContext);
    const providerProfile = user?.profile?.provider_profile;
    const isVerified = providerProfile?.is_verified || false;

    // --- STATE MANAGEMENT ---
    const [currentTab, setCurrentTab] = useState(0);
    const [myJobs, setMyJobs] = useState([]);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [loading, setLoading] = useState({ myJobs: true, available: false, action: null });
    const [error, setError] = useState('');
    const [isAvailable, setIsAvailable] = useState(false);
    
    // --- State for the slide-out detail panel and confirmation modal ---
    const [selectedJob, setSelectedJob] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, request: null, action: '' });
    
    // --- DATA FETCHING & LOGIC ---
    const fetchMyJobs = useCallback(async () => {
        setLoading(prev => ({ ...prev, myJobs: true }));
        try {
            const response = await getProviderJobs();
            setMyJobs(response.data || []);
        } catch (err) {
            setMyJobs([]);
        } finally {
            setLoading(prev => ({ ...prev, myJobs: false }));
        }
    }, []);

    const fetchAvailableJobs = useCallback(async () => { /* ... (Same as before) ... */ }, [isAvailable, isVerified]);

    useEffect(() => { fetchMyJobs() }, [fetchMyJobs]);
    useEffect(() => { if (isAvailable) fetchAvailableJobs(); else setAvailableRequests([]); }, [isAvailable, fetchAvailableJobs]);

    // This function gets called from the detail panel if the job status changes
    const updateJobInList = (updatedJob) => {
        setMyJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        if (selectedJob && selectedJob.id === updatedJob.id) {
            setSelectedJob(updatedJob);
        }
    };
    
    // --- ACTION HANDLERS ---
    const handleAvailabilityChange = (event) => { /* ... (Same as before) ... */ };
    const handleOpenModal = (request, action) => setModal({ isOpen: true, request, action });
    const handleCloseModal = () => setModal({ isOpen: false, request: null, action: '' });
    const handleConfirmAction = async () => { /* ... (Same as before) ... */ };
    const getModalContent = () => { /* ... (Same as before) ... */ };
    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Paper /* ... Header ... */ > ... </Paper>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} /* ... */>
                         {/* Tab JSX ... */}
                    </Tabs>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <TabPanel value={currentTab} index={0}>
                        <Box> {/* Job Board Content */}
                            <Paper sx={{ p: 2, mb: 3, /* ... */ }}> {/* Status Switch... */} </Paper>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}> {/* Available Jobs... */}
                                    {/* ... JSX for this section is correct */}
                                </Grid>
                                <Grid item xs={12} md={5}> {/* My Jobs... */}
                                    {loading.myJobs ? <CircularProgress /> : (
                                        // --- CRITICAL FIX: Pass onSelectJob prop here ---
                                        <ProviderJobsList 
                                            jobs={myJobs} 
                                            title="My Active & Upcoming Jobs"
                                            onSelectJob={setSelectedJob} // Pass the function to set the selected job
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>
                    <TabPanel value={currentTab} index={1}>
                        <ServiceManagementPanel providerProfile={providerProfile} />
                    </TabPanel>
                     {/* ... Performance Tab ... */}
                </Box>
            </motion.div>
            
            {/* RENDER MODALS AND PANELS (These are controlled by state) */}
            <ConfirmationModal open={modal.isOpen} handleClose={handleCloseModal} onConfirm={handleConfirmAction} {...getModalContent()} />
            
            <ActiveJobPanel
                job={selectedJob}
                onClose={() => setSelectedJob(null)} // Function to close the panel
                onStatusChange={updateJobInList} // Function to update a job in the list
            />
        </Container>
    );
};
export default ProviderDashboard;