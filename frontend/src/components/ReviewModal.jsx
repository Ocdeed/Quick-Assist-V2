// src/components/ReviewModal.jsx
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating, TextField, Box, Typography, CircularProgress } from '@mui/material';
import { createReview } from '../api/reviewApi';

const ReviewModal = ({ open, handleClose, job, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please provide a star rating.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createReview(job.id, { rating, comment });
            onReviewSubmit(); // Notify parent to refresh data
            handleClose();
        } catch(err) {
            setError(err.response?.data?.detail || "You have already reviewed this job.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle fontWeight="bold">Leave a Review for {job?.provider?.first_name}</DialogTitle>
            <DialogContent>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems:'center', my: 2, gap: 2}}>
                    <Typography component="legend">Your Overall Rating</Typography>
                    <Rating name="rating" value={rating} onChange={(event, newValue) => {setRating(newValue)}} size="large"/>
                     <TextField
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        label="Add a public comment (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                     {error && <Typography color="error">{error}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || rating === 0}>
                    {loading ? <CircularProgress size={24}/> : "Submit Review"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ReviewModal;