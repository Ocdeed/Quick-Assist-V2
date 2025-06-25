import { useState, useContext } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';

// Import the icons that will be used in the tabs
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

// Import the child components that will render inside the tabs
import JobBoardPanel from './JobBoardPanel';
import ServiceManagementPanel from './ServiceManagementPanel';

/**
 * A helper component that conditionally renders its children based on the
 * selected tab value. This prevents inactive tab content from rendering.
 */
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`provider-tabpanel-${index}`}
            aria-labelledby={`provider-tab-${index}`}
            {...other}
        >
            {value === index && (<Box sx={{ pt: 3 }}>{children}</Box>)}
        </div>
    );
}

const ProviderDashboard = () => {
    // Get the global user object from our Authentication Context
    const { user } = useContext(AuthContext);
    
    // Safely access the nested provider profile.
    // If user, user.profile, or user.profile.provider_profile is null or undefined,
    // this expression will result in 'undefined' without crashing the app.
    const providerProfile = user?.profile?.provider_profile;

    // State to manage which tab is currently selected. Defaults to the first tab (index 0).
    const [currentTab, setCurrentTab] = useState(0);

    // This function is called by the Tabs component whenever a new tab is clicked.
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                {/* --- Main Dashboard Welcome Header --- */}
                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        p: { xs: 2, md: 3 },
                        mb: 3,
                        bgcolor: 'primary.dark',
                        color: 'white',
                        borderRadius: 4,
                        border: 'none',
                        background: 'linear-gradient(135deg, hsl(120, 98%, 10%), hsl(120, 39%, 27%))' // Dark Green Gradient
                    }}
                >
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Provider Command Center
                    </Typography>
                    <Typography sx={{ mt: 1, opacity: 0.9 }}>
                        Manage your jobs, fine-tune your offered services, and track your performance.
                    </Typography>
                </Paper>
                
                {/* --- Tab Navigation Bar --- */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="Provider dashboard navigation tabs"
                        variant="fullWidth" // Ensures tabs spread out evenly
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab 
                            icon={<WorkOutlineIcon />} 
                            iconPosition="start" 
                            label="Job Board" 
                            id="provider-tab-0"
                            aria-controls="provider-tabpanel-0"
                            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem', p: 2 }}
                        />
                        <Tab 
                            icon={<DesignServicesIcon />} 
                            iconPosition="start" 
                            label="My Service Catalog"
                            id="provider-tab-1"
                            aria-controls="provider-tabpanel-1"
                            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem', p: 2 }}
                        />
                        <Tab 
                            icon={<AssessmentOutlinedIcon />} 
                            iconPosition="start" 
                            label="Performance"
                            id="provider-tab-2"
                            aria-controls="provider-tabpanel-2"
                            disabled // This feature is planned for the future
                            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem', p: 2 }}
                        />
                    </Tabs>
                </Box>
                
                {/* --- Tab Content Panels --- */}
                <Box sx={{ mt: 2 }}>
                    {/* The Job Board Panel is displayed when currentTab is 0 */}
                    <TabPanel value={currentTab} index={0}>
                        {/* We pass the providerProfile down so it knows if the user is verified */}
                        <JobBoardPanel providerProfile={providerProfile} />
                    </TabPanel>
                    
                    {/* The Service Management Panel is displayed when currentTab is 1 */}
                    <TabPanel value={currentTab} index={1}>
                        <ServiceManagementPanel providerProfile={providerProfile} />
                    </TabPanel>

                    {/* The Performance Panel (Placeholder) is displayed when currentTab is 2 */}
                    <TabPanel value={currentTab} index={2}>
                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6">Performance Analytics</Typography>
                            <Typography color="text.secondary">
                                Your earnings, ratings, and job completion statistics will be available here soon!
                            </Typography>
                        </Paper>
                    </TabPanel>
                </Box>

            </motion.div>
        </Container>
    );
};

export default ProviderDashboard;