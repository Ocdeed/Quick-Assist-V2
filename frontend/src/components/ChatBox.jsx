// src/components/ChatBox.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import { Box, TextField, IconButton, List, ListItem, ListItemText, Typography, Paper, ListItemAvatar, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from 'framer-motion';

import { getChatMessages, sendChatMessage } from '../api/serviceApi';
import pusher from '../api/pusher';
import AuthContext from '../context/AuthContext';

const ChatBox = ({ request }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);

    // Fetch initial chat history
    useEffect(() => {
        getChatMessages(request.id).then(response => {
            setMessages(response.data);
        });
    }, [request.id]);
    
    // Subscribe to Pusher for real-time messages
    useEffect(() => {
        const channel = pusher.subscribe(`private-request-${request.id}`);

        channel.bind('new-message', (data) => {
            setMessages(prevMessages => [...prevMessages, data.message]);
        });

        return () => {
            pusher.unsubscribe(`private-request-${request.id}`);
        };
    }, [request.id]);

    // Auto-scroll to the bottom when a new message arrives
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        try {
            // We don't need to add the message to state here, 
            // because our own client will receive the Pusher event and add it.
            await sendChatMessage(request.id, newMessage);
            setNewMessage('');
        } catch(error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Live Chat</Typography>
            </Box>

            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
                 <AnimatePresence>
                {messages.map(msg => (
                    <motion.div 
                        key={msg.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                    >
                    <ListItem 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: msg.sender.id === user.id ? 'row-reverse' : 'row',
                            mb: 1
                        }}
                    >
                         <ListItemAvatar>
                            <Avatar>{msg.sender.first_name?.[0]}</Avatar>
                        </ListItemAvatar>
                        <Paper 
                            sx={{ 
                                p: 1.5, 
                                bgcolor: msg.sender.id === user.id ? 'primary.main' : 'grey.200',
                                color: msg.sender.id === user.id ? 'primary.contrastText' : 'text.primary',
                                borderRadius: msg.sender.id === user.id ? '20px 20px 5px 20px' : '20px 20px 20px 5px'
                            }}
                            elevation={1}
                        >
                            <ListItemText primary={msg.text} />
                        </Paper>
                    </ListItem>
                     </motion.div>
                ))}
                 </AnimatePresence>
                <div ref={scrollRef}></div>
            </List>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                <TextField 
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    size="small"
                />
                <IconButton type="submit" color="primary">
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};
export default ChatBox;