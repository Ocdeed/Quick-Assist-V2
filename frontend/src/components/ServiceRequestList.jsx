// src/components/ServiceRequestList.jsx
import { List, ListItem, ListItemText, Typography, Chip, Paper, Box } from '@mui/material';
import moment from 'moment'; // Install: npm install moment

const statusColors = {
    PENDING: 'warning',
    ACCEPTED: 'info',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
};

const ServiceRequestList = ({ requests }) => {
    if (!requests || requests.length === 0) {
        return <Typography>You have no active or past service requests.</Typography>;
    }

    return (
        <List>
            {requests.map((req) => (
                <Paper key={req.id} variant="outlined" sx={{ mb: 2 }}>
                    <ListItem>
                        <ListItemText
                            primary={<Typography fontWeight="bold">{req.service.name}</Typography>}
                            secondary={`Requested on ${moment(req.created_at).format('MMMM Do YYYY, h:mm a')}`}
                        />
                        <Box>
                            <Chip label={req.status} color={statusColors[req.status] || 'default'} />
                        </Box>
                    </ListItem>
                </Paper>
            ))}
        </List>
    );
};
export default ServiceRequestList;