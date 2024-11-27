// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Register from './Register';
import Attendance from './Attendance';
import Analytics from './Analytics';
import Impexp from './Impexp';
// import LoadingScreen from './LoadingScreen';
import './App.css';

function App() {
    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     const timer = setTimeout(() => setIsLoading(false), 3500); // Adjust time as needed for loading screen
    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <>
            {/* {isLoading ? (
                <LoadingScreen />
            ) : ( */}
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Register />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/impexp" element={<Impexp />} />
                    </Routes>
                </Router>
            {/* )} */}
        </>
    );
}

export default App;
