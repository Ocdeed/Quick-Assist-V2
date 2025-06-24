// src/components/ServiceManagementPanel.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { getServiceCategories } from '../api/serviceApi'; // Fetch all possible services
import { getMyServices, addServiceToMyProfile, removeServiceFromMyProfile } from '../api/providerApi';

const ServiceManagementPanel = () => {
    const [myServiceIds, setMyServiceIds] = useState(new Set());
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [myServicesRes, allCategoriesRes] = await Promise.all([
                getMyServices(),
                getServiceCategories()
            ]);
            setMyServiceIds(new Set(myServicesRes.data.map(s => s.id)));
            setAllCategories(allCategoriesRes.data);
        } catch (error) {
            console.error("Failed to load services data", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleService = async (serviceId) => {
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
        }
    };

    if (loading) return <Box p={3} textAlign="center"><CircularProgress/></Box>;

    return (
        <Box p={{xs: 1, sm: 3}}>
             <Alert severity="info" sx={{mb: 3}}>Select the services you are skilled in and wish to offer. These will be visible to customers.</Alert>
            <Grid container spacing={4}>
                {allCategories.map(category => (
                    <Grid item xs={12} md={6} key={category.id}>
                        <Paper variant="outlined">
                             <Box p={2} bgcolor="grey.100" borderBottom={1} borderColor="divider">
                                 <Typography variant="h6" fontWeight="bold">{category.name}</Typography>
                             </Box>
                             <Box p={2}>
                                {category.services.map(service => {
                                    const isOffered = myServiceIds.has(service.id);
                                    return (
                                        <Paper 
                                            key={service.id}
                                            elevation={0}
                                            variant="outlined"
                                            sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}
                                        >
                                            <Typography>{service.name}</Typography>
                                            <Button
                                                variant={isOffered ? "contained" : "outlined"}
                                                size="small"
                                                color={isOffered ? "success" : "primary"}
                                                startIcon={isOffered ? <CheckIcon/> : <AddIcon />}
                                                onClick={() => handleToggleService(service.id)}
                                            >
                                                {isOffered ? 'Offered' : 'Offer'}
                                            </Button>
                                        </Paper>
                                    )
                                })}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
export default ServiceManagementPanel;