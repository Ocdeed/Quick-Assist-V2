import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, IconButton, Slide, Fab, Paper, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';

import JobTrackingMap from '../components/JobTrackingMap';
import JobInfoPanel from '../components/JobInfoPanel'; // New component
import ChatPanel from '../components/ChatPanel'; // New component

import { getServiceRequestDetails } from '../api/serviceApi';
import AuthContext from '../context/AuthContext';

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State to control which side panel is open ('info', 'chat', or 'none')
    const [activePanel, setActivePanel] = useState('info');

    useEffect(() => {
        getServiceRequestDetails(id)
            .then(res => setRequest(res.data))
            .catch(err => setError('Could not load job details.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePanelToggle = (panel) => {
        setActivePanel(current => (current === panel ? 'none' : panel));
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (error || !request) {
        return <Container sx={{mt: 4}}><Alert severity="error">{error || 'Job not found.'}</Alert></Container>;
    }

    return (
        <Box sx={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
            {/* The Map as the full-screen background layer */}
            <JobTrackingMap request={request} />

            {/* Back Button - Top Left */}
            <Fab color="primary" size="small" onClick={() => navigate('/dashboard')} sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1201 }}>
                <ArrowBackIcon />
            </Fab>

            {/* Panel Toggles - Top Right */}
            <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1201, display: 'flex', gap: 1 }}>
                <Fab 
                    color={activePanel === 'info' ? "secondary" : "primary"}
                    size="small"
                    onClick={() => handlePanelToggle('info')}
                >
                    <InfoIcon />
                </Fab>
                <Fab 
                     color={activePanel === 'chat' ? "secondary" : "primary"}
                     size="small"
                     onClick={() => handlePanelToggle('chat')}
                >
                    <ChatIcon />
                </Fab>
            </Box>

            {/* Information Side Panel */}
            <Slide direction="left" in={activePanel === 'info'} mountOnEnter unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '90%', sm: 400 },
                        height: '100%',
                        zIndex: 1200,
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        overflowY: 'auto'
                    }}
                >
                    <JobInfoPanel request={request} user={user} />
                </Paper>
            </Slide>
            
             {/* Chat Side Panel */}
            <Slide direction="left" in={activePanel === 'chat'} mountOnEnter unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '90%', sm: 400 },
                        height: '100%',
                        zIndex: 1200,
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <ChatPanel request={request} />
                </Paper>
            </Slide>

        </Box>
    );
};

export default JobDetailPage;