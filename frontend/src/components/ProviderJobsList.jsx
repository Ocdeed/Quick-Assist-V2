import { List, Paper, Typography, Box, ListItemButton, Chip, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { motion, AnimatePresence } from 'framer-motion';

// A map to associate each job status with a specific MUI color prop
const statusStyles = {
    PENDING: 'warning',
    ACCEPTED: 'info',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
};

/**
 * A component to display a list of jobs assigned to a provider.
 * Each item is clickable and reports the selection back to the parent component.
 * @param {Array} jobs - The array of job objects to display.
 * @param {string} title - The title to display above the list.
 * @param {function} onSelectJob - The function to call when a job item is clicked. It passes the job object back.
 */
const ProviderJobsList = ({ jobs, title, onSelectJob }) => {

    // Render a helpful message if the list of jobs is empty.
    if (!jobs || jobs.length === 0) {
        return (
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: 'background.default', 
                    borderStyle: 'dashed',
                    borderColor: 'grey.300',
                    height: '100%'
                }}
            >
                <DirectionsCarIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" fontWeight={500}>No Jobs Here</Typography>
                <Typography color="text.secondary">
                    Your accepted and ongoing jobs will appear in this list.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">{title}</Typography>
            <List sx={{ p: 0 }}>
                <AnimatePresence>
                {jobs.map((job, index) => (
                    <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 }}}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                mb: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    borderColor: 'primary.light',
                                    transform: 'translateX(4px)'
                                },
                            }}
                        >
                            {/* 
                                --- CRITICAL FUNCTIONALITY ---
                                The ListItemButton is the clickable element.
                                Its onClick handler calls the `onSelectJob` function passed in as a prop,
                                which tells the parent component (JobBoardPanel) to open the detail panel
                                for this specific 'job'.
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
                                        {/* Shows when the job was last updated (e.g., accepted, started, etc.) */}
                                        {moment(job.updated_at).fromNow()}
                                    </Typography>
                                </Box>
                            </ListItemButton>
                        </Paper>
                    </motion.div>
                ))}
                </AnimatePresence>
            </List>
        </Box>
    );
};

export default ProviderJobsList;