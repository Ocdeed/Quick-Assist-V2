// src/components/ProviderJobsList.jsx
import { List, Paper, Typography, Box, ListItemButton, Chip, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const statusColors = {
    PENDING: 'warning',
    ACCEPTED: 'info',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
};

const ProviderJobsList = ({ jobs, title }) => {
    if (!jobs || jobs.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', mt: 2 }}>
                <DirectionsCarIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">No Active Jobs</Typography>
                <Typography color="text.secondary">
                    Jobs you accept will appear here.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box mt={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">{title}</Typography>
            <List sx={{ p: 0 }}>
                {jobs.map((job) => (
                    <Paper 
                        key={job.id} 
                        variant="outlined"
                        sx={{ mb: 2, '&:hover': { boxShadow: 3, borderColor: 'primary.main' } }}
                    >
                        <ListItemButton component={RouterLink} to={`/jobs/${job.id}`} sx={{ p: 2 }}>
                            <ListItemText
                                primary={<Typography variant="body1" fontWeight="bold">{job.service.name}</Typography>}
                                secondary={`For: ${job.customer.first_name} ${job.customer.last_name}`}
                            />
                            <Box sx={{ ml: 2, textAlign: 'right' }}>
                                <Chip 
                                    label={job.status.replace('_', ' ')}
                                    color={statusColors[job.status] || 'default'} 
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Accepted: {moment(job.updated_at).fromNow()}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    </Paper>
                ))}
            </List>
        </Box>
    );
};

export default ProviderJobsList;