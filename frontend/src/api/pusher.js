// src/api/pusher.js
import Pusher from 'pusher-js';
import api from './api';

// IMPORTANT: Replace with your actual Pusher App Key and Cluster
const PUSHER_APP_KEY = 'efa8fb0d7f79f2379533'; 
const PUSHER_CLUSTER = 'ap2';

const pusher = new Pusher(PUSHER_APP_KEY, {
    cluster: PUSHER_CLUSTER,
    // --- This is the crucial part for private channels ---
    // Tell Pusher to use our Django backend for authentication
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                // Use our axios instance which already has the auth token interceptor
                api.post('/communications/pusher/auth/', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(null, response.data);
                })
                .catch(error => {
                    callback(error, null);
                });
            }
        };
    },
});

export default pusher;