// src/pages/ProviderProfilePage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Rating, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import AppHeader from '../components/AppHeader';
import { getProviderReviews } from '../api/reviewApi'; // Using our new API function

const ProviderProfilePage = () => {
    const { providerId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        getProviderReviews(providerId)
            .then(response => {
                setProfileData(response.data);
            })
            .catch(err => {
                setError("Could not load provider's profile and reviews.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [providerId]);

    if (loading) return <Box sx={{p:5, textAlign: 'center'}}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!profileData) return null;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppHeader />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                 <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon/>} sx={{mb: 2}}>Back to Dashboard</Button>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                     <Typography variant="h4" fontWeight="bold">Provider Reviews</Typography>
                     <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>Average Rating</Typography>
                     <Rating name="read-only" value={profileData.average_rating || 0} readOnly precision={0.1} size="large"/>
                     <Typography>({profileData.reviews?.length || 0} reviews)</Typography>
                </Paper>
                
                <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 3, borderRadius: 4, p: 2 }}>
                    {profileData.reviews.map((review, index) => (
                        <div key={review.id}>
                             <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                     <Avatar>{review.customer_name?.[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Rating name="read-only-small" value={review.rating} readOnly size="small" />}
                                    secondary={
                                         <Typography variant="body2" color="text.primary">
                                             {review.comment} — <Box component="span" sx={{fontWeight:'bold'}}>{review.customer_name}</Box>
                                         </Typography>
                                    }
                                />
                            </ListItem>
                            {index < profileData.reviews.length - 1 && <Divider variant="inset" component="li" />}
                        </div>
                    ))}
                </List>
            </Container>
        </Box>
    );
};
export default ProviderProfilePage;