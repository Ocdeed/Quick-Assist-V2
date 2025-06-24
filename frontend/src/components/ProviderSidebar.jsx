// src/components/ProviderSidebar.jsx
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';

const navItems = [
    { text: 'Job Board', icon: <DashboardIcon />, view: 'jobs' },
    { text: 'My Services', icon: <DesignServicesIcon />, view: 'services' },
    { text: 'Analytics', icon: <BarChartIcon />, view: 'analytics' },
    { text: 'Profile', icon: <PersonIcon />, view: 'profile' },
];

const ProviderSidebar = ({ activeView, setActiveView }) => {
    return (
        <Box
            sx={{
                width: { sm: 280 },
                flexShrink: { sm: 0 },
                bgcolor: 'white',
                height: '100vh',
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box p={3} sx={{display:'flex', alignItems: 'center', gap: 1}}>
                <Typography variant="h5" fontWeight="bold" color="primary">QUICKASSIST</Typography>
                 <Typography variant="caption" color="secondary" sx={{bgcolor:'secondary.light', px:1, borderRadius:1}}>Provider</Typography>
            </Box>
            <Divider />
            <List component="nav" sx={{p: 2}}>
                {navItems.map((item, index) => (
                    <ListItemButton
                        key={item.text}
                        selected={activeView === item.view}
                        onClick={() => setActiveView(item.view)}
                        disabled={index > 1} // Disable analytics & profile for now
                        sx={{ borderRadius: 2, mb: 1 }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={<Typography fontWeight="500">{item.text}</Typography>} />
                    </ListItemButton>
                ))}
            </List>
             <Box sx={{flexGrow: 1}}/>
              <Divider/>
            <Box p={2}>
                 <Typography variant="caption" color="text.secondary">© 2024 QuickAssist</Typography>
            </Box>
        </Box>
    );
};
export default ProviderSidebar;