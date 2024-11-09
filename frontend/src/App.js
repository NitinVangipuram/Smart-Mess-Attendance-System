import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; // Import your Navbar component
import Register from './Register'; // Create Register component
import './App.css'; // Import your CSS file
import Attendance from './Attendance'; // Create Attendance component

function App() {
    return (
        <Router>
                <Navbar />
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/attendance" element={<Attendance />} />
                </Routes>
        </Router>
    );
}

export default App;
