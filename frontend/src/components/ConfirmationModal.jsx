import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const ConfirmationModal = ({ open, handleClose, onConfirm, title, message, isLoading }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle fontWeight="bold">{title || "Confirm Action"}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message || "Are you sure?"}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 20px' }}>
                <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
                <Button onClick={onConfirm} variant="contained" disabled={isLoading} autoFocus>
                    {isLoading ? 'Processing...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default ConfirmationModal;