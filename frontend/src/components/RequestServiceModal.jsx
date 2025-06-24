import { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
    InputLabel, Select, MenuItem, Box, CircularProgress, Alert, Stepper, Step, StepLabel, Typography
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { getServiceCategories, createServiceRequest } from '../api/serviceApi';

const steps = ['Select Service', 'Confirm Location', 'Submit'];

const RequestServiceModal = ({ open, handleClose, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            // Reset state every time the modal opens for a fresh start
            setActiveStep(0);
            setSelectedService('');
            setLocation(null);
            setError('');

            // Fetch service categories
            setIsLoading(true);
            getServiceCategories()
                .then(response => {
                    setCategories(response.data);
                })
                .catch(() => {
                    setError("Failed to load available services. Please try again later.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [open]);

    const handleGetLocation = () => {
        setIsLoading(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsLoading(false);
                setActiveStep(2); // Move to the final submission step
            },
            () => {
                setError('Could not get your location. Please enable location services in your browser settings.');
                setIsLoading(false);
            },
            { enableHighAccuracy: true } // Optional: for more accurate location
        );
    };

    const handleSubmit = async () => {
        if (!location) {
            setError("Location is missing. Please go back and capture it again.");
            return;
        }

        setIsLoading(true);
        setError('');

        // --- THE CRITICAL FIX IS HERE ---
        // Round the coordinates to 6 decimal places to match the backend model's constraints.
        const requestData = {
            service: selectedService,
            request_latitude: parseFloat(location.latitude.toFixed(6)),
            request_longitude: parseFloat(location.longitude.toFixed(6)),
        };

        try {
            await createServiceRequest(requestData);
            onSuccess(); // This calls fetchRequests() in the parent and closes the modal
        } catch (err) {
            setError('There was an error submitting your request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" transitionDuration={{ enter: 300, exit: 300 }}>
            <DialogTitle fontWeight="bold">Request a New Service</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ my: 3 }}>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}

                <Box sx={{ minHeight: 150, mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isLoading && activeStep !== 2 && <CircularProgress />}
                    {!isLoading && activeStep === 0 && ( // Select Service Step
                        <FormControl fullWidth>
                            <InputLabel id="service-select-label">Choose a Service</InputLabel>
                            <Select
                                labelId="service-select-label"
                                value={selectedService}
                                label="Choose a Service"
                                onChange={(e) => setSelectedService(e.target.value)}
                            >
                                {categories.map(category => (
                                    [
                                        <MenuItem 
                                            key={`category-${category.id}`} 
                                            disabled 
                                            sx={{fontWeight: 'bold', color: 'primary.main !important', opacity: '1 !important'}}
                                        >
                                            {category.name}
                                        </MenuItem>,
                                        ...category.services.map(service => (
                                            <MenuItem 
                                                key={`service-${service.id}`} 
                                                value={service.id} 
                                                sx={{ pl: 4 }}
                                            >
                                                {service.name}
                                            </MenuItem>
                                        ))
                                    ]
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {!isLoading && activeStep === 1 && ( // Confirm Location Step
                        <Box textAlign="center">
                            <Typography sx={{mb: 2}}>We need your precise location to find the nearest help.</Typography>
                            <Button onClick={handleGetLocation} variant="contained" startIcon={<MyLocationIcon />} disabled={isLoading}>
                                Use My Current Location
                            </Button>
                        </Box>
                    )}
                    {activeStep === 2 && location && ( // Submit Step
                        <Box textAlign="center">
                            <Typography variant="h6">Ready to Go!</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Service selected and location confirmed.
                            </Typography>
                             <Typography variant="caption" color="text.secondary">
                                Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 24px' }}>
                <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
                {activeStep === 0 && (
                    <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!selectedService}>
                        Next
                    </Button>
                )}
                 {activeStep === 1 && (
                     <Button onClick={() => setActiveStep(0)}>Back</Button>
                )}
                {activeStep === 2 && (
                    <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color="inherit"/> : 'Confirm & Request Help'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default RequestServiceModal;