/* eslint-disable no-unused-vars */
// src/components/JobDetailsCard.jsx
import { Paper, Typography, Box, Divider, List, ListItem, ListItemIcon, ListItemText, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
// eslint-disable-next-line no-unused-vars
import moment from 'moment';

const JobDetailsCard = ({ request, userRole }) => {
    // Determine who the "other party" is to display their info
    const otherParty = userRole === 'CUSTOMER' ? request.provider : request.customer;
    const otherPartyRole = userRole === 'CUSTOMER' ? 'Provider' : 'Customer';

    return (
        <Paper variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="bold">Job Summary</Typography>
            </Box>
            <List sx={{ p: 2 }}>
                <ListItem>
                    <ListItemIcon><MiscellaneousServicesIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Service Requested" secondary={request.service.name} />
                </ListItem>

                <ListItem>
                    <ListItemIcon><AttachMoneyIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Estimated Price" secondary={request.service.base_price ? `$${request.service.base_price}` : 'Not Set'} />
                </ListItem>

                <ListItem>
                    <ListItemIcon><FmdGoodIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Location" secondary="Address will be shown here" />
                </ListItem>
            </List>
            <Divider />

            {/* Display info about the other person involved in the job */}
            {otherParty ? (
                <>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                         <Typography variant="subtitle1" fontWeight="bold">{otherPartyRole} Details</Typography>
                    </Box>
                     <List sx={{ p: 2 }}>
                        <ListItem>
                            <ListItemIcon>
                                <Avatar>{otherParty.first_name?.[0]}</Avatar>
                            </ListItemIcon>
                            <ListItemText primary="Name" secondary={`${otherParty.first_name} ${otherParty.last_name}`} />
                        </ListItem>
                        {/* You would expose phone numbers carefully based on job status */}
                        <ListItem>
                             <ListItemIcon>
                                <PersonIcon />
                            </ListItemIcon>
                            <ListItemText primary="Contact" secondary="Contact via in-app chat" />
                        </ListItem>
                     </List>
                </>
            ) : (
                <Typography sx={{ p: 2 }} color="text.secondary">Waiting for provider assignment...</Typography>
            )}

        </Paper>
    );
};

export default JobDetailsCard;