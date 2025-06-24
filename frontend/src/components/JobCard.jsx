// src/components/JobCard.jsx
import { Paper, Typography, Box, Button, Chip } from '@mui/material';
import moment from 'moment';

const JobCard = ({ job, onSelect, onAccept, onDecline }) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'grey.100' } }} onClick={() => onSelect(job)}>
            <Typography variant="subtitle1" fontWeight="bold">{job.service.name}</Typography>
            <Typography variant="body2" color="text.secondary">
                For: {job.customer.first_name} {job.customer.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Requested: {moment(job.created_at).fromNow()}
            </Typography>
            
            {/* Contextual Actions */}
            {job.status === 'PENDING' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); onAccept(job); }}>Accept</Button>
                    <Button variant="outlined" size="small" color="error" onClick={(e) => { e.stopPropagation(); onDecline(job); }}>Decline</Button>
                </Box>
            )}
        </Paper>
    );
};

export default JobCard;