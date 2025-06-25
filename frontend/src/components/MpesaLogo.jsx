// src/components/MpesaLogo.jsx
import React from 'react';
import { Box } from '@mui/material';

// This is the official M-PESA logo SVG data
const MpesaLogo = () => (
    <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center' }}>
      <svg viewBox="0 0 162 101" xmlns="http://www.w3.org/2000/svg">
        <path d="M129.914 100.222H161.8V.744H129.914z" fill="#D0D3D4"/>
        <path d="M145.856 71.79H99.782s-11.898-27.189-13.882-31.917c-2.3-5.5-12.87-32.333-12.87-32.333H33.568L19.06 48.966H.2L42.127.743h42.17s9.648 24.116 13.013 32.5c4.322 10.643 12.015 29.5 12.015 29.5l4.896 9.046z" fill="#ED1C24"/>
        <path d="M49.664 71.79H3.59L57.564.743h42.17l-15.068 36.33L49.664 71.79z" fill="#000"/>
        <path d="M72.934 71.79h68.995s.612 1.25.612 1.25l-29.07 27.189-15.58-.236-4.66-8.81z" fill="#92D400"/>
      </svg>
    </Box>
  );

export default MpesaLogo;