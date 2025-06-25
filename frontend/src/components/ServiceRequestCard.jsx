import { useContext } from 'react';
import { Paper, Typography, Box, Chip, Button, Divider, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
import { motion } from 'framer-motion';

// --- Import Icons for visual distinction ---
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaymentIcon from '@mui/icons-material/Payment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash'; // Example for 'wash'
import BuildIcon from '@mui/icons-material/Build';             // Example for 'repair'
import ContentCutIcon from '@mui/icons-material/ContentCut';   // Example for 'salon'
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices'; // Default icon

import AuthContext from '../context/AuthContext'; // To determine the user's role

// --- Helper map to associate status with MUI colors and human-readable labels ---
const statusStyles = {
    PENDING: { label: 'Finding Provider', color: 'warning' },
    ACCEPTED: { label: 'Provider Assigned', color: 'info' },
    IN_PROGRESS: { label: 'Job In Progress', color: 'primary' },
    COMPLETED: { label: 'Completed', color: 'success' },
    CANCELLED: { label: 'Cancelled', color: 'error' },
};

// --- Helper function to select an icon based on the service name ---
const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('wash') || name.includes('cleaning')) return <LocalCarWashIcon color="primary" />;
    if (name.includes('repair') || name.includes('mechanic') || name.includes('tire')) return <BuildIcon color="primary" />;
    if (name.includes('salon') || name.includes('cut') || name.includes('hair')) return <ContentCutIcon color="primary" />;
    return <MiscellaneousServicesIcon color="primary" />; // A good default
};


const ServiceRequestCard = ({ request, onPayClick, onReviewClick }) => {
    // Get the current user to check their role
    const { user } = useContext(AuthContext);
    const isCustomer = user?.role === 'CUSTOMER';
    
    // Safely get the style object for the current status
    const { label, color } = statusStyles[request.status] || { label: request.status, color: 'default' };

    // --- LOGIC to determine which actions to show ---
    const showCustomerActions = isCustomer && request.status === 'COMPLETED';
    
    // For now, the Pay button shows if the job is complete. A more robust check would be
    // a `payment_status` field from the backend, e.g., `request.payment_status !== 'PAID'`
    const showPayButton = showCustomerActions; 
    
    // The review button shows if the job is complete and no review has been submitted yet
    const showReviewButton = showCustomerActions && !request.review;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ height: '100%' }} // Ensures cards in a row have equal height
        >
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 4,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px -10px rgba(45,90,45,0.2)', // Themed shadow
                        borderColor: 'primary.light',
                    },
                }}
            >
                {/* --- Card Header: Icon, Service Name, and Status --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {getServiceIcon(request.service.name)}
                        <Typography variant="h6" fontWeight="bold">{request.service.name}</Typography>
                    </Box>
                    <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />
                </Box>
                
                <Divider />
                
                {/* --- Card Body: Key Details --- */}
                <Box sx={{ flexGrow: 1, my: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Date</Typography>
                            <Typography variant="body2" fontWeight={500}>{moment(request.created_at).format('MMM Do, YYYY')}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Time</Typography>
                            <Typography variant="body2" fontWeight={500}>{moment(request.created_at).format('h:mm a')}</Typography>
                        </Grid>
                        {request.provider && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Provider Assigned</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {`${request.provider.first_name} ${request.provider.last_name}`}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* --- Card Actions: Dynamically Rendered Footer --- */}
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 'auto' }}>
                    {showCustomerActions ? (
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<PaymentIcon />}
                                    onClick={(e) => { e.stopPropagation(); onPayClick(request); }} // Stop propagation to prevent card click
                                    disabled={!showPayButton} // Will be based on payment status later
                                >
                                    Pay Now
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    startIcon={<RateReviewIcon />}
                                    onClick={(e) => { e.stopPropagation(); onReviewClick(request); }}
                                    disabled={!showReviewButton}
                                >
                                    {request.review ? "Reviewed" : "Review"}
                                </Button>
                            </Grid>
                        </Grid>
                    ) : (
                        <Button 
                            component={RouterLink}
                            to={`/jobs/${request.id}`}
                            variant="contained" 
                            fullWidth
                            endIcon={<ArrowForwardIcon />}
                            disabled={request.status === 'CANCELLED' || request.status === 'COMPLETED'}
                        >
                            View Details
                        </Button>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );
};

export default ServiceRequestCard;