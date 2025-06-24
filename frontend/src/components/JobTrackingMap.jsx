import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import pusher from '../api/pusher';
import { Box, Typography } from '@mui/material';

// Fix for default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// A small component to recenter the map when positions change
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

const JobTrackingMap = ({ request }) => {
    const customerPos = [parseFloat(request.request_latitude), parseFloat(request.request_longitude)];
    
    // --- THIS IS THE PRIMARY FIX ---
    // Check if a provider and their location exist. If not, default to null.
    const hasProviderLocation = request.provider && 
                              request.provider.profile?.provider_profile?.latitude &&
                              request.provider.profile?.provider_profile?.longitude;
    
    // Set initial position state based on whether a provider location is available.
    const [providerPosition, setProviderPosition] = useState(
        hasProviderLocation 
        ? [
            parseFloat(request.provider.profile.provider_profile.latitude),
            parseFloat(request.provider.profile.provider_profile.longitude)
          ]
        : null // Start with no provider position
    );

    useEffect(() => {
        // Only subscribe to pusher if a provider is assigned
        if (!request.provider) {
            return;
        }

        const channel = pusher.subscribe(`private-request-${request.id}`);

        channel.bind('provider-location-update', (data) => {
            console.log('Received location update:', data);
            const { latitude, longitude } = data.location;
            setProviderPosition([parseFloat(latitude), parseFloat(longitude)]);
        });

        // Unsubscribe to prevent memory leaks when the component is unmounted
        return () => {
            pusher.unsubscribe(`private-request-${request.id}`);
        };
    }, [request.id, request.provider]); // Depend on provider, so we can re-subscribe if one gets assigned

    const centerPosition = providerPosition || customerPos;

    return (
        <MapContainer center={centerPosition} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Customer's Marker (Always shown) */}
            <Marker position={customerPos}>
                <Popup>Your Location</Popup>
            </Marker>
            
            {/* --- FIX #2 --- */}
            {/* Provider's Marker (Conditionally rendered ONLY if providerPosition is not null) */}
            {providerPosition ? (
                <Marker position={providerPosition}>
                    <Popup>Provider's Location</Popup>
                </Marker>
            ) : (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        p: 1,
                        borderRadius: 1,
                        boxShadow: 3
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        Waiting for a provider to be assigned...
                    </Typography>
                </Box>
            )}
             <RecenterAutomatically lat={centerPosition[0]} lng={centerPosition[1]} />
        </MapContainer>
    );
};

export default JobTrackingMap;