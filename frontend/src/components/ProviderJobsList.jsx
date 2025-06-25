import { List, Paper, Typography, Box, ListItemButton, Chip, ListItemText } from '@mui/material';
import moment from 'moment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { motion } from 'framer-motion';

const statusStyles = {
    PENDING: 'warning',
    ACCEPTED: 'info',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
};

// --- CRITICAL FIX: Destructure and receive the 'onSelectJob' prop ---
const ProviderJobsList = ({ jobs, title, onSelectJob }) => {
    
    if (!jobs || jobs.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', borderStyle: 'dashed' }}>
                <DirectionsCarIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">No Active Jobs</Typography>
                <Typography color="text.secondary">
                    Jobs you accept will appear here. Click a job to view details.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">{title}</Typography>
            <List sx={{ p: 0 }}>
                {jobs.map((job, index) => (
                    <motion.div key={job.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                mb: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    borderColor: 'primary.light',
                                },
                            }}
                        >
                            {/* 
                                --- CRITICAL FIX: The onClick handler now calls the received prop ---
                                This tells the parent dashboard which job was selected.
                            */}
                            <ListItemButton onClick={() => onSelectJob(job)} sx={{ p: 2 }}>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" fontWeight="bold">
                                            {job.service.name}
                                        </Typography>
                                    }
                                    secondary={`For: ${job.customer.first_name} ${job.customer.last_name}`}
                                />
                                <Box sx={{ ml: 2, textAlign: 'right' }}>
                                    <Chip 
                                        label={job.status.replace('_', ' ')}
                                        color={statusStyles[job.status] || 'default'} 
                                        size="small"
                                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                                    />
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {moment(job.updated_at).fromNow()}
                                    </Typography>
                                </Box>
                            </ListItemButton>
                        </Paper>
                    </motion.div>
                ))}
            </List>
        </Box>
    );
};

export default ProviderJobsList;