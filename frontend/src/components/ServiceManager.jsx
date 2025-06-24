/* eslint-disable no-unused-vars */
// src/components/ServiceManager.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip, Tooltip, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import { getServiceCategories } from '../api/serviceApi';
import { getMyServices, addServiceToMyProfile, removeServiceFromMyProfile } from '../api/providerApi';

const ServiceManager = ({ providerProfile }) => {
    const isVerified = providerProfile?.is_verified || false;
    const [myServiceIds, setMyServiceIds] = useState(new Set());
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // ... (fetchData and handleToggleService logic remains exactly the same) ...

    useEffect(() => { /* fetchData logic here */ }, []);
    
    const handleToggleService = async (serviceId) => { /* logic here */ };

    return (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">My Service Catalog</Typography>
                {!isVerified && (
                    <Chip icon={<LockIcon />} label="Verification Required" color="warning" size="small"/>
                )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                {isVerified ? "Select the services you offer. Customers will see these on your profile." : "This feature will be unlocked once your account is verified by an admin."}
            </Typography>
            
            {loading ? (
                // --- SKELETON LOADER for a better loading experience ---
                <Grid container spacing={2}>
                    {[...Array(4)].map((_, i) => <Grid item xs={12} md={6} key={i}><Skeleton variant="rectangular" height={120} sx={{borderRadius: 2}} /></Grid>)}
                </Grid>
            ) : (
                <Grid container spacing={2}>
                {allCategories.map(category => (
                    <Grid item xs={12} md={6} key={category.id}>
                        <Box p={2} bgcolor="grey.100" borderRadius={2}>
                             <Typography variant="subtitle1" fontWeight="bold">{category.name}</Typography>
                        </Box>
                         <Box mt={1}>
                            {category.services.map(service => {
                                const isOffered = myServiceIds.has(service.id);
                                return (
                                    <Paper 
                                        key={service.id} 
                                        variant="outlined" 
                                        sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1}}
                                    >
                                        <Typography variant="body2">{service.name}</Typography>
                                         <Tooltip title={isVerified ? "" : "Account not verified"} arrow>
                                             <span>
                                                 <Button
                                                    variant={isOffered ? "contained" : "outlined"}
                                                    size="small"
                                                    color={isOffered ? "success" : "primary"}
                                                    startIcon={isOffered ? <CheckIcon/> : <AddIcon />}
                                                    onClick={() => handleToggleService(service.id)}
                                                    disabled={!isVerified}
                                                >
                                                    {isOffered ? 'Offered' : 'Offer'}
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
            )}
        </Paper>
    );
};

export default ServiceManager;