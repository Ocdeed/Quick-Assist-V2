import { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, TextField, Box, Link, Alert, CircularProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');
        
        try {
            await loginUser(email, password); // This will navigate on success
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Updated loginUser in AuthContext to throw an error
    // so we can catch it here. Let's make that change.

    return (
        <AuthLayout title="Sign In">
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" disabled={isLoading} />
                <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" disabled={isLoading}/>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', position: 'relative' }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </motion.div>
                <Box sx={{ textAlign: 'center' }}>
                    <Link component={RouterLink} to="/register" variant="body2" color="primary.dark">
                        {"Don't have an account? Create one"}
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
};
export default LoginPage;