/* eslint-disable no-unused-vars */
import { List, ListItemText, Typography, Chip, Paper, Box, ListItemButton, Icon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment'; // Make sure you have run 'npm install moment'
import EventNoteIcon from '@mui/icons-material/EventNote';
import { motion } from 'framer-motion';

// A map to associate each status with a color from our MUI theme
const statusColors = {
    PENDING: 'warning',
    ACCEPTED: 'info',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
};

const ServiceRequestList = ({ requests }) => {
    
    // This provides a helpful message if there are no requests to show.
    if (!requests || requests.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                <EventNoteIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">No Service Requests Found</Typography>
                <Typography color="text.secondary">
                    When you request a service, it will appear here.
                </Typography>
            </Paper>
        );
    }

    return (
        <List sx={{ p: 0 }}>
            {requests.map((req, index) => (
                <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            mb: 2, 
                            // Add a subtle hover effect
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: 'primary.main'
                            },
                            transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                        }}
                    >
                        {/* 
                            ListItemButton makes the entire row a clickable button.
                            'component={RouterLink}' tells MUI to use React Router's Link for navigation.
                        */}
                        <ListItemButton component={RouterLink} to={`/jobs/${req.id}`} sx={{ p: 2 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="body1" fontWeight="bold">
                                        {req.service.name}
                                    </Typography>
                                }
                                secondary={`Requested on ${moment(req.created_at).format('MMMM Do YYYY, h:mm a')}`}
                            />
                            <Box sx={{ ml: 2, textAlign: 'right' }}>
                                <Chip 
                                    label={req.status.replace('_', ' ')} // Replace underscore with space for readability
                                    color={statusColors[req.status] || 'default'} 
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                                {req.provider && (
                                     <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                         Provider: {req.provider.first_name}
                                     </Typography>
                                )}
                            </Box>
                        </ListItemButton>
                    </Paper>
                </motion.div>
            ))}
        </List>
    );
};

export default ServiceRequestList;