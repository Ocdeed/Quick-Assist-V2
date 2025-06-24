/* eslint-disable no-unused-vars */
import { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AuthContext from '../context/AuthContext';

const AppHeader = () => {
    const { logoutUser } = useContext(AuthContext);
    
    return (
        <AppBar position="static" color="primary" elevation={1}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    QUICKASSIST
                </Typography>
                <Button color="inherit" onClick={logoutUser} startIcon={<LogoutIcon/>}>
                    Sign Out
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default AppHeader;