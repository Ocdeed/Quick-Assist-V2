/* eslint-disable no-unused-vars */
// src/components/ChatPanel.jsx
// This code is very similar to our redesigned ChatBox, but structured as a complete panel.
import { useState, useEffect, useRef, useContext } from 'react';
import { Box, TextField, IconButton, List, ListItem, Typography, Paper, Avatar, InputAdornment } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { AnimatePresence, motion } from 'framer-motion';

import { getChatMessages, sendChatMessage } from '../api/serviceApi';
import pusher from '../api/pusher';
import AuthContext from '../context/AuthContext';

const ChatPanel = ({ request }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const listEndRef = useRef(null);
    
    useEffect(() => { /* ... (Same as ChatBox data logic) ... */ 
        getChatMessages(request.id).then(res => setMessages(res.data));
        const channel = pusher.subscribe(`private-request-${request.id}`);
        channel.bind('new-message', data => setMessages(prev => [...prev, data.message]));
        return () => pusher.unsubscribe(`private-request-${request.id}`);
    }, [request.id]);

    useEffect(() => { /* ... (Same as ChatBox scroll logic) ... */ 
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => { /* ... (Same as ChatBox send logic) ... */
        e.preventDefault();
        const text = newMessage.trim();
        if (text === '') return;
        setNewMessage('');
        try {
            await sendChatMessage(request.id, text);
        } catch (error) {
            console.error("Failed to send message", error);
            setNewMessage(text);
        }
    };

    return (
        <>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Typography variant="h5" fontWeight="700">Live Chat</Typography>
            </Box>
            
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                <AnimatePresence>
                {messages.map(msg => {
                    const isMe = msg.sender.id === user.id;
                    return (
                        <motion.div key={msg.id} layout initial={{ opacity: 0, x: isMe ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}>
                            <ListItem sx={{ justifyContent: isMe ? 'flex-end' : 'flex-start', px: 0 }}>
                                <Paper 
                                    elevation={2} 
                                    sx={{ 
                                        p: '10px 14px', 
                                        bgcolor: isMe ? 'primary.dark' : 'white', 
                                        color: isMe ? 'white' : 'text.primary',
                                        borderRadius: 4,
                                        borderBottomRightRadius: isMe ? 0 : 4,
                                        borderBottomLeftRadius: isMe ? 4 : 0
                                    }}>
                                    <Typography variant="body1">{msg.text}</Typography>
                                </Paper>
                            </ListItem>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
                <div ref={listEndRef}/>
            </List>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">
                            <IconButton type="submit" color="primary" disabled={!newMessage.trim()}><SendRoundedIcon/></IconButton>
                        </InputAdornment>
                    }}
                />
            </Box>
        </>
    );
};

export default ChatPanel;