import { useContext } from 'react';
import { Box, Typography, Container, Paper, Avatar, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AppHeader from '../components/AppHeader';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);

    // Placeholder data, this would come from a profile API call in the future
    const profile = user ? { phone_number: user.profile?.phone_number || 'Not Set' } : {};

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppHeader />
            <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
                                <PersonIcon sx={{ fontSize: 40 }}/>
                            </Avatar>
                            <Box>
                                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                                    Welcome, {user?.first_name || 'User'}!
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    This is your central hub for all services.
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>
                            Your Profile
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                                <ListItemText primary="Email" secondary={user?.email} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><PhoneIcon color="primary"/></ListItemIcon>
                                <ListItemText primary="Phone Number" secondary={profile.phone_number} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                                <ListItemText primary="Account Type" secondary={user?.role} />
                            </ListItem>
                        </List>
                        
                        {/* FUTURE: We will add service request buttons and lists here */}
                         <Box mt={4}>
                             <Typography variant="body2" color="text.secondary">
                                 Upcoming features: Request new services, view active jobs, and manage your history.
                             </Typography>
                         </Box>

                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default DashboardPage;