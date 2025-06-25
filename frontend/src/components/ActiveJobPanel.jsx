/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Drawer, Box, Typography, IconButton, Grid, Button, Alert, CircularProgress, Divider, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import JobTrackingMap from './JobTrackingMap';
import ChatPanel from './ChatPanel'; // Use our new, redesigned chat panel
import JobDetailsCard from './JobDetailsCard';

// You will need to create this API file and function if it doesn't exist
// This function should call our backend status update endpoint
import { updateJobStatus } from '../api/providerApi';

const ActiveJobPanel = ({ job, onClose, onStatusChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // If there is no job selected, the component renders nothing.
    if (!job) {
        return null;
    }

    const handleUpdateStatus = async (newStatus) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await updateJobStatus(job.id, newStatus);
            // Call the parent's function to update the job in the main list
            onStatusChange(response.data);
        } catch(err) {
            console.error("Failed to update status", err);
            setError("Could not update the job status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Determine the next action button to show based on the job's current status
    const getNextAction = () => {
        if (job.status === 'ACCEPTED') {
            return { text: "Start Driving to Customer", action: () => handleUpdateStatus('IN_PROGRESS') };
        }
        if (job.status === 'IN_PROGRESS') {
            return { text: "Mark Job as Complete", action: () => handleUpdateStatus('COMPLETED') };
        }
        // If the job is completed or cancelled, no primary action is available for the provider
        return null;
    };

    const nextAction = getNextAction();

    return (
        <Drawer
            anchor="right"
            open={!!job}
            onClose={onClose}
            PaperProps={{ 
                sx: { 
                    width: { xs: '95%', sm: '80%', md: '70%', lg: '65%' }, // Responsive width
                    bgcolor: 'background.default'
                } 
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight="bold">Active Job: #{job.id}</Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

                {/* --- Primary Action Bar --- */}
                <Paper variant="outlined" sx={{p: 2, mb: 3}}>
                     <Typography variant="h6" gutterBottom>Next Step</Typography>
                     {nextAction ? (
                         <Button
                             variant="contained"
                             onClick={nextAction.action}
                             fullWidth
                             disabled={isLoading}
                         >
                            {isLoading ? <CircularProgress size={24} color="inherit"/> : nextAction.text}
                         </Button>
                     ) : (
                         <Alert severity="success">No further actions required from you for this job right now.</Alert>
                     )}
                </Paper>
                
                {/* --- Main Content Grid --- */}
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={7}>
                        {/* Map needs a container with a defined height */}
                        <Box sx={{ height: '70vh', minHeight: 450 }}>
                            <JobTrackingMap request={job} />
                        </Box>
                    </Grid>
                     <Grid item xs={12} lg={5} sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '70vh', minHeight: 450 }}>
                        <Box><JobDetailsCard request={job} userRole="PROVIDER" /></Box>
                        {/* ChatPanel fills the remaining space */}
                        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                            <ChatPanel request={job} />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Drawer>
    );
};

export default ActiveJobPanel;