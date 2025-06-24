// src/components/AuthLayout.jsx
import { Grid, Box, Typography, CssBaseline } from '@mui/material'; // Removed 'Hidden'
import { motion } from 'framer-motion';

const visualElementUrl = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2938&auto=format&fit=crop';

const AuthLayout = ({ children, title }) => {
    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />

            {/* Left Side: Visual Element (Now using responsive 'sx' prop) */}
            <Grid 
                item 
                // This is the core of the fix. It defines display properties
                // for different breakpoints. 'none' for extra-small screens (xs),
                // and 'block' for small screens (sm) and up.
                sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    backgroundImage: `url(${visualElementUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative', // For the overlay
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                xs={false} 
                sm={4} 
                md={7} 
            >
                {/* Dark overlay for text readability */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 50, 2, 0.6)', // Deep green overlay
                        backdropFilter: 'blur(2px)',
                    }}
                />
                {/* Brand Slogan */}
                <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{zIndex: 2, color: 'white', textAlign: 'center', padding: '2rem'}}
                >
                    <Typography component="h1" variant="h2" sx={{ fontWeight: 700, mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        QUICKASSIST
                    </Typography>
                    <Typography variant="h5" sx={{ fontStyle: 'italic', maxWidth: '450px'}}>
                        Reliable help, right when you need it.
                    </Typography>
                </motion.div>
            </Grid>

            {/* Right Side: Form (No changes needed here) */}
            <Grid 
                item 
                xs={12} 
                sm={8} 
                md={5} 
                component={motion.div}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "circOut" }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 450 }}>
                    <Box sx={{ mb: 4, textAlign: {xs: 'center', sm: 'left'} }}>
                        <Typography component="h2" variant="h4" color="primary.dark" sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Get started in seconds.
                        </Typography>
                    </Box>
                    {children}
                </Box>
            </Grid>
        </Grid>
    );
};

export default AuthLayout;