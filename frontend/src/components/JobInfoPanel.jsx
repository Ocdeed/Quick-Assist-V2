// src/components/JobInfoPanel.jsx
import { Box, Typography, Divider, Button } from '@mui/material';
import JobDetailsCard from './JobDetailsCard'; // Reuse this component
import JobStatusStepper from './JobStatusStepper'; // Reuse this component

const JobInfoPanel = ({ request, user }) => {

    const handleActionClick = () => console.log("Primary action clicked!");

    const getNextAction = () => {
        if (!request || !user) return null;
        const { status, customer } = request;
        const isCustomer = user.id === customer.id;

        if (status === 'ACCEPTED' && !isCustomer) return { text: "Start Driving to Customer", action: handleActionClick };
        if (status === 'IN_PROGRESS' && !isCustomer) return { text: "Mark Job as Complete", action: handleActionClick };
        // We will build the payment logic in a later phase
        if (status === 'COMPLETED' && isCustomer) return { text: "Proceed to Payment & Review", action: handleActionClick };
        
        return null;
    };
    
    const nextAction = getNextAction();

    return (
        <Box p={3}>
            {/* Header */}
            <Typography variant="h5" fontWeight="700" gutterBottom>Job Details</Typography>
            <Typography variant="body1" color="text.secondary">Status for Request #{request.id}</Typography>
            <Divider sx={{ my: 2 }} />

            {/* Status Stepper */}
            <JobStatusStepper status={request.status} />
            <Divider sx={{ my: 2 }} />
            
            {/* Primary Action Button */}
            {nextAction && (
                <Box my={2}>
                    <Button fullWidth variant="contained" size="large" onClick={nextAction.action}>
                        {nextAction.text}
                    </Button>
                </Box>
            )}

            {/* Re-use the details card */}
            <JobDetailsCard request={request} userRole={user.role} />
        </Box>
    );
};

export default JobInfoPanel;