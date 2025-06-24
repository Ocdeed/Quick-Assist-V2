import { List, Paper, Typography, Box, ListItemButton, Chip, ListItemText, Divider } from '@mui/material';
import moment from 'moment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

// Map job statuses to MUI colors for visual feedback
const statusStyles = {
    ACCEPTED: { label: 'Accepted', color: 'info' },
    IN_PROGRESS: { label: 'In Progress', color: 'primary' },
    COMPLETED: { label: 'Completed', color: 'success' },
};

const ProviderJobsList = ({ jobs, title, onSelectJob }) => {
    
    // An informative and visually pleasing "empty state"
    if (!jobs || jobs.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: {xs:2, sm: 4}, textAlign: 'center', bgcolor: 'transparent', borderStyle:'dashed' }}>
                <DirectionsRunIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">No Jobs Here</Typography>
                <Typography color="text.secondary" variant="body2">
                    {title.includes('Active') ? "Jobs you accept will appear in this list." : "Your completed jobs will appear here."}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined">
             <Box p={2} borderBottom={1} borderColor="divider">
                <Typography variant="h6" fontWeight="bold">{title}</Typography>
            </Box>
            <List sx={{ p: 1 }}>
                {jobs.map((job) => {
                    const style = statusStyles[job.status] || { label: job.status, color: 'default' };
                    return (
                        <ListItemButton
                            key={job.id}
                            // This is the key change: it calls the function passed from the parent dashboard
                            onClick={() => onSelectJob(job)}
                            sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
                        >
                            <ListItemText
                                primary={
                                    <Typography variant="body1" fontWeight="500">
                                        {job.service.name}
                                    </Typography>
                                }
                                secondary={`For: ${job.customer.first_name} ${job.customer.last_name}`}
                            />
                            <Box sx={{ ml: 2, textAlign: 'right' }}>
                                <Chip 
                                    label={style.label}
                                    color={style.color}
                                    size="small"
                                />
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {moment(job.updated_at).fromNow()}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    );
                })}
            </List>
        </Paper>
    );
};

export default ProviderJobsList;