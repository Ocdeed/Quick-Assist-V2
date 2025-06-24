// src/components/ProviderDashboard.jsx
import { useState, useContext } from 'react';
import { Box, Slide, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

import AuthContext from '../context/AuthContext';
import ProviderSidebar from './ProviderSidebar';
import JobBoardView from './JobBoardView';
import ServiceManagementPanel from './ServiceManagementPanel';
import ActiveJobPanel from './ActiveJobPanel'; // Re-use the detail pane we made

const ProviderDashboard = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [activeView, setActiveView] = useState('jobs'); // 'jobs', 'services', etc.
    const [selectedJob, setSelectedJob] = useState(null); // The job to show in the detail pane
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

    const renderActiveView = () => {
        switch (activeView) {
            case 'jobs':
                return <JobBoardView onSelectJob={setSelectedJob} />;
            case 'services':
                return <ServiceManagementPanel providerProfile={user?.profile?.provider_profile} />;
            case 'analytics':
                return <Typography>Analytics Coming Soon</Typography>;
            case 'profile':
                return <Typography>Profile Management Coming Soon</Typography>;
            default:
                return <JobBoardView onSelectJob={setSelectedJob} />;
        }
    };
    
    // --- The Main Render ---
    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'grey.100' }}>
            {/* --- The Persistent Sidebar (Desktop) --- */}
            {!isMobile && <ProviderSidebar activeView={activeView} setActiveView={setActiveView} />}
            
            {/* --- Main Content Area --- */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    overflowY: 'auto', 
                    position: 'relative', // Needed for the ActiveJobPanel to be positioned correctly
                    transition: 'all 0.3s ease'
                }}
            >
                <motion.div
                    key={activeView} // Animate when the view changes
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {renderActiveView()}
                </motion.div>
            </Box>
            
            {/* --- The Active Job Master-Detail Panel --- */}
            {/* This slides in over the content area without changing the URL */}
            <Slide direction="left" in={!!selectedJob} mountOnEnter unmountOnExit>
                 <Box
                    elevation={16}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '100%', md: '50%', lg: '45%' }, // Takes up half the screen on desktop
                        maxWidth: {lg: '650px'},
                        height: '100%',
                        zIndex: 1250,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                     {/* Pass a callback to the panel to refresh data if needed */}
                     <ActiveJobPanel job={selectedJob} onClose={() => setSelectedJob(null)} onStatusChange={() => {}}/>
                </Box>
            </Slide>

        </Box>
    );
};
export default ProviderDashboard;