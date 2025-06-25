import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Grid, Paper, CircularProgress, Alert, Skeleton, Tooltip, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';

import { getServiceCategories } from '../api/serviceApi';
import { getMyServices, addServiceToMyProfile, removeServiceFromMyProfile } from '../api/providerApi';

const ServiceManagementPanel = ({ providerProfile }) => {
    // Safely check for verification status. This is the key to preventing crashes.
    const isVerified = providerProfile?.is_verified || false;

    const [myServiceIds, setMyServiceIds] = useState(new Set());
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null); // To show spinner on individual buttons

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch both provider's own services and all available services in parallel
            const [myServicesRes, allCategoriesRes] = await Promise.all([
                getMyServices(),
                getServiceCategories()
            ]);
            setMyServiceIds(new Set(myServicesRes.data.map(s => s.id)));
            setAllCategories(allCategoriesRes.data);
        } catch (error) {
            console.error("Failed to load services data", error);
            setError("Could not load service information.");
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleService = async (serviceId) => {
        // Prevent action if not verified
        if (!isVerified) return;

        setUpdatingId(serviceId); // Show loading state on the specific button
        const isCurrentlyOffered = myServiceIds.has(serviceId);

        try {
            if (isCurrentlyOffered) {
                await removeServiceFromMyProfile(serviceId);
                setMyServiceIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(serviceId);
                    return newSet;
                });
            } else {
                await addServiceToMyProfile(serviceId);
                setMyServiceIds(prev => new Set(prev).add(serviceId));
            }
        } catch (error) {
            console.error("Failed to toggle service", error);
            setError("Could not update your services. Please try again.");
        } finally {
            setUpdatingId(null); // Hide loading state
        }
    };

    if (loading) {
        // A better loading state using Skeletons
        return (
             <Grid container spacing={2}>
                {[...Array(4)].map((_, i) => <Grid item xs={12} md={6} key={i}><Skeleton variant="rectangular" height={150} sx={{borderRadius: 2}} /></Grid>)}
            </Grid>
        )
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">My Service Catalog</Typography>
                {!isVerified && (
                    <Chip icon={<LockIcon />} label="Verification Required" color="warning" />
                )}
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                {isVerified 
                    ? "Select the services you are skilled in and wish to offer. Customers will see these when requesting help." 
                    : "This feature will be unlocked once your account is verified by an administrator."}
            </Typography>
            
            <Grid container spacing={3}>
                {allCategories.map(category => (
                    <Grid item xs={12} md={6} key={category.id}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={600}>{category.name}</Typography>
                        </Paper>
                        <Box mt={2}>
                            {category.services.map(service => {
                                const isOffered = myServiceIds.has(service.id);
                                return (
                                    <Paper 
                                        key={service.id} 
                                        variant="outlined" 
                                        sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
                                    >
                                        <Typography>{service.name}</Typography>
                                        <Tooltip title={isVerified ? (isOffered ? "Click to stop offering" : "Click to offer this service") : "Your account must be verified."} arrow>
                                            <span> {/* Span is necessary for Tooltip on a disabled button */}
                                                <Button
                                                    variant={isOffered ? "contained" : "outlined"}
                                                    size="small"
                                                    color={isOffered ? "success" : "primary"}
                                                    startIcon={updatingId === service.id ? <CircularProgress size={16} color="inherit" /> : (isOffered ? <CheckIcon/> : <AddIcon />)}
                                                    onClick={() => handleToggleService(service.id)}
                                                    disabled={!isVerified || updatingId !== null}
                                                >
                                                    {isOffered ? 'Active' : 'Offer'}
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default ServiceManagementPanel;