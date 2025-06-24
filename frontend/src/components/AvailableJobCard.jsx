// src/components/AvailableJobCard.jsx
import { Paper, Typography, Box, Button, Chip, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon from '@mui/icons-material/PinDrop';
import PersonIcon from '@mui/icons-material/Person';
import moment from 'moment';
import { motion } from 'framer-motion';

const AvailableJobCard = ({ request, onAccept, isLoading }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 2.5, 
                    mb: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 2,
                    borderColor: 'grey.300',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">{request.service.name}</Typography>
                        <Chip
                            icon={<PersonIcon />}
                            label={`For: ${request.customer_name}`}
                            size="small"
                            sx={{ mt: 0.5 }}
                        />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {moment(request.created_at).fromNow()}
                    </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <PinDropIcon color="action" fontSize="small"/>
                     {/* In a real app, you'd calculate and show the distance. */}
                     <Typography variant="body2" color="text.secondary">Nearby location</Typography>
                </Box>

                <Button 
                    fullWidth
                    variant="contained" 
                    size="large"
                    startIcon={<CheckCircleOutlineIcon/>} 
                    onClick={() => onAccept(request)}
                    disabled={isLoading}
                    sx={{ mt: 1 }}
                >
                    Accept This Job
                </Button>
            </Paper>
        </motion.div>
    );
};

export default AvailableJobCard;