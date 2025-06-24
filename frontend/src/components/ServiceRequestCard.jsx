// src/components/ServiceRequestCard.jsx
import { Paper, Typography, Box, Chip, Button, Divider, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

// An icon map for different services would be a great addition for visual distinction
// For now, we'll use a default, but this shows how it could be expanded.
import CarWashIcon from '@mui/icons-material/LocalCarWash';
import BuildIcon from '@mui/icons-material/Build'; // For mechanics

const statusStyles = {
    PENDING: { label: 'Finding Provider', color: 'warning' },
    ACCEPTED: { label: 'Provider Assigned', color: 'info' },
    IN_PROGRESS: { label: 'Job In Progress', color: 'primary' },
    COMPLETED: { label: 'Completed', color: 'success' },
    CANCELLED: { label: 'Cancelled', color: 'error' },
};

const ServiceRequestCard = ({ request }) => {
    const { label, color } = statusStyles[request.status] || { label: request.status, color: 'default' };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px -10px rgba(0,0,0,0.2)',
                        borderColor: 'primary.light',
                    },
                }}
            >
                {/* Card Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {request.service.name.toLowerCase().includes('wash') ? <CarWashIcon color="primary"/> : <BuildIcon color="primary"/>}
                        <Typography variant="h6" fontWeight="bold">{request.service.name}</Typography>
                    </Box>
                    <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }}/>
                </Box>
                
                <Divider />
                
                {/* Card Body */}
                <Box sx={{ flexGrow: 1, my: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Date</Typography>
                            <Typography variant="body2">{moment(request.created_at).format('MMM Do, YYYY')}</Typography>
                        </Grid>
                         <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Time</Typography>
                            <Typography variant="body2">{moment(request.created_at).format('h:mm a')}</Typography>
                        </Grid>
                        {request.provider && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Provider</Typography>
                                <Typography variant="body2">{`${request.provider.first_name} ${request.provider.last_name}`}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Card Action */}
                <Button 
                    component={RouterLink}
                    to={`/jobs/${request.id}`}
                    variant="contained" 
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    color="primary"
                    disabled={request.status === 'CANCELLED' || request.status === 'COMPLETED'}
                >
                    {request.status === 'PENDING' ? 'View Request' : 'Track Job'}
                </Button>
            </Paper>
        </motion.div>
    );
};

export default ServiceRequestCard;