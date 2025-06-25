/* eslint-disable no-unused-vars */
// src/components/ProviderStatusCard.jsx
import { Paper, Typography, Box, Switch, FormControlLabel, Alert, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ProviderStatusCard = ({ providerProfile, isAvailable, onAvailabilityChange, isLoading }) => {
    
    // -- Unverified State --
    if (!providerProfile?.is_verified) {
        return (
            <Alert severity="warning" icon={<NewReleasesIcon fontSize="inherit" />} sx={{ '.MuiAlert-message': { width: '100%' } }}>
                <Typography variant="h6" fontWeight="bold">Your Account is Pending Verification</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Our team is reviewing your profile. Once verified, you will be able to manage your services and accept jobs. Thank you for your patience.
                </Typography>
            </Alert>
        );
    }
    
    // -- Verified State --
    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 4,
                bgcolor: 'transparent'
            }}
        >
            <Box>
                <Typography variant="h5" component="h1" fontWeight="bold">Your Studio</Typography>
                <Typography color="text.secondary">You are a verified provider. Go online to start receiving jobs.</Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
                <FormControlLabel
                    sx={{
                        p: 1.5,
                        pl: 2.5,
                        borderRadius: 99,
                        bgcolor: isAvailable ? 'success.light' : 'grey.200',
                        transition: 'background-color 0.3s ease-in-out',
                        '& .MuiTypography-root': { fontWeight: 'bold' }
                    }}
                    control={<Switch checked={isAvailable} onChange={onAvailabilityChange} disabled={isLoading} color="primary" />}
                    label={isAvailable ? "You are Online" : "You are Offline"}
                />
                {isLoading && <CircularProgress size={24} sx={{position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px'}} />}
            </Box>
        </Paper>
    );
};
export default ProviderStatusCard;