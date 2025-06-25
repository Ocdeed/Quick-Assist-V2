/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import pusher from '../api/pusher';
import { Box, Typography, Paper } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// Custom icon using MUI SVG - a more advanced and flexible method
const providerIconHtml = `
  <div style="background-color: #2d5a2d; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
    <svg fill="white" width="20" height="20" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99ZM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16Zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5ZM5 11l1.5-4.5h11L19 11H5Z"/></svg>
  </div>`;
const providerIcon = new L.DivIcon({
  html: providerIconHtml,
  className: 'leaflet-div-icon', // important for default styles to be overridden
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});


// Helper component to smoothly pan the map
const PanToMarker = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

const JobTrackingMap = ({ request }) => {
    const customerPos = [parseFloat(request.request_latitude), parseFloat(request.request_longitude)];
    const hasProvider = request.provider && request.provider.profile?.provider_profile;
    
    const [providerPosition, setProviderPosition] = useState(() =>
        hasProvider && hasProvider.latitude && hasProvider.longitude
        ? [parseFloat(hasProvider.latitude), parseFloat(hasProvider.longitude)]
        : null
    );

    useEffect(() => {
        if (!request.provider) return;
        const channel = pusher.subscribe(`private-request-${request.id}`);
        channel.bind('provider-location-update', (data) => {
            setProviderPosition([parseFloat(data.location.latitude), parseFloat(data.location.longitude)]);
        });
        return () => pusher.unsubscribe(`private-request-${request.id}`);
    }, [request.id, request.provider]);
    
    return (
        // The main container that enforces a fixed height and aspect ratio.
        // It has a border-radius for a softer look.
        <Paper variant="outlined" sx={{ position: 'relative', height: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <MapContainer center={customerPos} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                {/* Use a more subtle, professional-looking map tile */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                <Marker position={customerPos}><Popup>Your requested location</Popup></Marker>
                
                {providerPosition && (
                     <Marker position={providerPosition} icon={providerIcon}>
                        <Popup>Provider is here</Popup>
                    </Marker>
                )}
                
                {/* This helper smoothly pans to the provider's new location */}
                <PanToMarker position={providerPosition} />
            </MapContainer>
            
            {/* Informational overlay at the bottom */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1000,
                    p: 2,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    color: 'white',
                    pointerEvents: 'none' // Allows clicking through the overlay
                }}
            >
                <Typography variant="body1" fontWeight="bold">
                    {request.provider ? 'Provider is on the way!' : 'Awaiting provider assignment'}
                </Typography>
                <Typography variant="caption">
                    Map will update in real-time.
                </Typography>
            </Box>
        </Paper>
    );
};
export default JobTrackingMap;