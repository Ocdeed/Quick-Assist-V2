import { Paper, Typography, Box, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * A reusable card for displaying a key metric on a dashboard.
 * @param {string} title - The label for the stat (e.g., "Jobs Completed").
 * @param {string|number} value - The number or text to display.
 * @param {React.ReactNode} icon - The icon component to display.
 * @param {string} color - The MUI color palette to use (e.g., 'primary', 'success').
 */
const StatCard = ({ title, value, icon, color = 'primary' }) => {
    return (
        <motion.div
            whileHover={{ translateY: -5 }} // Adds a subtle "lift" effect on hover
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 3,
                    height: '100%', // Ensure cards in the same row have equal height
                }}
            >
                <Avatar 
                    sx={{
                        // Use a light shade of the theme color for the background
                        bgcolor: `${color}.light`,
                        // Use a dark shade of the theme color for the icon itself
                        color: `${color}.dark`,
                        width: 56,
                        height: 56
                    }}
                >
                    {/* The icon passed as a prop will be rendered here */}
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        {value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default StatCard;