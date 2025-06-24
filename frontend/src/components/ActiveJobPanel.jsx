// src/components/ActiveJobPanel.jsx
import { Drawer, Box, Typography, IconButton, Grid, Button, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import JobTrackingMap from './JobTrackingMap';
import ChatPanel from './ChatPanel';
import JobDetailsCard from './JobDetailsCard';
import { updateJobStatus } from '../api/providerApi'; // You'll need to create this API function

const ActiveJobPanel = ({ job, onClose, onStatusChange }) => {
    if (!job) return null;

    const handleUpdateStatus = async (newStatus) => {
        try {
            const updatedJob = await updateJobStatus(job.id, newStatus);
            onStatusChange(updatedJob.data);
        } catch(error) {
            console.error("Failed to update status", error);
        }
    };
    
    // Determine the next action
    const getNextAction = () => {
        if (job.status === 'ACCEPTED') return { text: "Start Work", action: () => handleUpdateStatus('IN_PROGRESS') };
        if (job.status === 'IN_PROGRESS') return { text: "Complete Job", action: () => handleUpdateStatus('COMPLETED') };
        return null;
    }
    const nextAction = getNextAction();

    return (
        <Drawer anchor="right" open={!!job} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: '75%', lg: '60%' } } }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">Active Job: #{job.id}</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {job.status === 'ACCEPTED' && <Alert severity="info" sx={{mb: 2}}>You have accepted this job. Please start heading to the customer.</Alert>}
                
                 {nextAction && (
                    <Button variant="contained" onClick={nextAction.action} fullWidth sx={{mb: 2}}>
                        {nextAction.text}
                    </Button>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={7}>
                        <Box sx={{ height: '60vh', minHeight: 400 }}><JobTrackingMap request={job} /></Box>
                    </Grid>
                     <Grid item xs={12} lg={5} sx={{ display: 'flex', flexDirection: 'column', gap: 3}}>
                        <JobDetailsCard request={job} userRole="PROVIDER" />
                        <Box sx={{height: 400}}><ChatPanel request={job}/></Box>
                    </Grid>
                </Grid>
            </Box>
        </Drawer>
    );
};

export default ActiveJobPanel;