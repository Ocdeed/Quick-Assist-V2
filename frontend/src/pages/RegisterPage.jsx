import { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, TextField, Box, Link, Select, MenuItem, InputLabel, FormControl, Grid, Alert, CircularProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const { registerUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        const data = new FormData(event.currentTarget);
        const formData = {
            email: data.get('email'),
            password: data.get('password'),
            first_name: data.get('firstName'),
            last_name: data.get('lastName'),
            role: data.get('role'),
            phone_number: data.get('phoneNumber'),
        };
        try {
            await registerUser(formData);
        } catch(err) {
            setError(err.message || 'Registration failed. Please check your details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account">
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                <Grid container spacing={2}>
                    {/* ... (Grid items are the same as before) ... */}
                    <Grid item xs={12} sm={6}> <TextField required fullWidth id="firstName" label="First Name" name="firstName" autoComplete="given-name" disabled={isLoading}/> </Grid>
                    <Grid item xs={12} sm={6}> <TextField required fullWidth id="lastName" label="Last Name" name="lastName" autoComplete="family-name" disabled={isLoading}/> </Grid>
                    <Grid item xs={12}> <TextField required fullWidth id="email" label="Email Address" name="email" autoComplete="email" disabled={isLoading}/> </Grid>
                    <Grid item xs={12}> <TextField required fullWidth name="phoneNumber" label="Phone Number" type="tel" id="phoneNumber" disabled={isLoading}/> </Grid>
                    <Grid item xs={12}> <TextField required fullWidth name="password" label="Password" type="password" id="password" helperText="Minimum 8 characters." disabled={isLoading}/> </Grid>
                    <Grid item xs={12}> <FormControl fullWidth required disabled={isLoading}> <InputLabel id="role-select-label">I am signing up as a...</InputLabel> <Select labelId="role-select-label" id="role" name="role" defaultValue="CUSTOMER" label="I am signing up as a..."> <MenuItem value={'CUSTOMER'}>Customer (I need services)</MenuItem> <MenuItem value={'PROVIDER'}>Service Provider (I offer services)</MenuItem> </Select> </FormControl> </Grid>
                </Grid>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create My Account'}
                    </Button>
                </motion.div>
                <Box sx={{ textAlign: 'center' }}>
                    <Link component={RouterLink} to="/login" variant="body2" color="primary.dark">
                        {"Already have an account? Sign In"}
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
};
export default RegisterPage;