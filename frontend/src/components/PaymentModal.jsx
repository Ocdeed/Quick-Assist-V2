import { useState, useContext } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    Box, Typography, CircularProgress, Alert, Grid, Paper, IconButton
} from '@mui/material';
import MpesaLogo from './MpesaLogo'; // We'll create this small SVG component
import MoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import AuthContext from '../context/AuthContext';
import { initiatePayment } from '../api/serviceApi';
import { logCashPayment } from '../api/serviceApi'; // Assuming you create a dedicated api file

const PaymentModal = ({ open, handleClose, job, onPaymentSuccess }) => {
    const { user } = useContext(AuthContext);
    
    // State to manage which step we are on: 'choose', 'mpesa', 'cash'
    const [step, setStep] = useState('choose');
    
    // State for M-Pesa form
    const [phone, setPhone] = useState(user.profile?.phone_number || '');
    
    // Generic UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const jobAmount = job?.final_price || job?.service?.base_price || 0;

    // Reset state when the modal is closed or re-opened
    const handleExit = () => {
        setStep('choose');
        setLoading(false);
        setError('');
        setSuccess('');
        handleClose();
    };
    
    const handleStkPush = async () => {
        if (!phone.match(/^254\d{9}$/)) {
            setError("Please enter a valid Safaricom number starting with 254.");
            return;
        }
        setLoading(true); setError(''); setSuccess('');
        try {
            const response = await initiatePayment(job.id, { phone_number: phone, amount: 1 }); // Test with 1 KES
            setSuccess(response.data.message || 'STK Push sent! Please check your phone to complete the payment.');
        } catch(err) {
            setError(err.response?.data?.error || "Failed to initiate M-Pesa payment.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogCash = async () => {
        setLoading(true); setError(''); setSuccess('');
        try {
            await logCashPayment(job.id);
            setSuccess("Cash payment recorded! Your provider has been notified.");
            // Wait for 2 seconds then call the success handler to close and refresh
            setTimeout(() => {
                onPaymentSuccess();
                handleExit();
            }, 2000);
        } catch(err) {
            setError(err.response?.data?.error || "Failed to record cash payment.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onClose={handleExit} fullWidth maxWidth="xs">
            <DialogTitle fontWeight="bold">
                {step !== 'choose' && (
                    <IconButton onClick={() => setStep('choose')} sx={{mr: 1}}><ArrowBackIcon/></IconButton>
                )}
                Complete Your Payment
            </DialogTitle>
            <DialogContent>
                {/* Step 1: Choose Method */}
                {step === 'choose' && (
                    <Box>
                        <Typography gutterBottom>How would you like to pay for the service "{job?.service?.name}"?</Typography>
                        <Typography variant="h4" fontWeight="bold" textAlign="center" my={2}>KES {jobAmount}</Typography>
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={12}>
                                <PaymentOption 
                                    icon={<MpesaLogo />} 
                                    title="Pay with M-Pesa" 
                                    subtitle="Secure online payment." 
                                    onClick={() => setStep('mpesa')} 
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <PaymentOption 
                                    icon={<MoneyIcon sx={{fontSize: 40}} />} 
                                    title="Pay with Cash" 
                                    subtitle="Pay your provider directly." 
                                    onClick={() => setStep('cash')}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Step 2: M-Pesa Form */}
                {step === 'mpesa' && (
                     <Box my={2}>
                        <Typography>An STK push will be sent to your M-Pesa number. Please confirm the details below.</Typography>
                        <TextField label="Amount to Pay (KES)" defaultValue={jobAmount} fullWidth disabled sx={{mt:2, mb:2}}/>
                        <TextField label="Your M-Pesa Number" value={phone} onChange={e => setPhone(e.target.value)} fullWidth required helperText="Format: 254..."/>
                        {error && <Alert severity="error" sx={{mt:2}}>{error}</Alert>}
                        {success && <Alert severity="info" sx={{mt:2}}>{success}</Alert>}
                        <Button onClick={handleStkPush} variant="contained" fullWidth sx={{mt:2}} disabled={loading || success}>
                             {loading ? <CircularProgress size={24}/> : "Send Payment Request"}
                        </Button>
                    </Box>
                )}
                
                 {/* Step 2: Cash Confirmation */}
                {step === 'cash' && (
                     <Box my={2} textAlign="center">
                        <Typography variant="h6">Confirm Cash Payment</Typography>
                        <Typography my={2}>You have chosen to pay KES {jobAmount} directly to your provider in cash. Please press confirm after you have paid.</Typography>
                        {error && <Alert severity="error" sx={{mt:2}}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{mt:2}}>{success}</Alert>}
                        <Button onClick={handleLogCash} variant="contained" fullWidth sx={{mt:2}} disabled={loading || success}>
                            {loading ? <CircularProgress size={24}/> : "I Have Paid in Cash"}
                        </Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleExit}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
export default PaymentModal;


// --- Helper sub-component for payment options ---
const PaymentOption = ({ icon, title, subtitle, onClick }) => (
    <Paper 
        variant="outlined" 
        onClick={onClick} 
        sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lightest' } }} // Assumes lightest color in theme
    >
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        <Box>
            <Typography fontWeight="bold">{title}</Typography>
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
    </Paper>
);