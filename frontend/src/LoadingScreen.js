import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';
import logo from "./img/logo_black_final.png";
import { LinearProgress } from '@mui/material';

function LoadingScreen() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 3500); // Adjust as needed
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`loading-screen ${isLoaded ? 'slide-out' : 'slide-in'}`}>
            <div className="loading-content">
                <img className="logo" style={{ width: "700px" }} src={logo} alt="Logo" />
                <h1 className="loading-text">Smart Mess Attendance System</h1>
                {/* Loading bar without any animation */}
                <LinearProgress style={{ width: '700px', marginTop: '20px' }} />
            </div>
        </div>
    );
}

export default LoadingScreen;
