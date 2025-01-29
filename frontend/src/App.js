import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Register from './Register';
import Attendance from './Attendance';
import Analytics from './Analytics';
import Impexp from './Impexp';
import Login from './Login';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    return (
        <Router basename="/attendance">
        {token && <Navbar setToken={setToken} />}
        <Routes>
            <Route path="/admin" element={<Login setToken={setToken} />} />
            {token ? (
                <>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Attendance />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/impexp" element={<Impexp />} />
                    <Route path="*" element={<Navigate to="/register" />} />
                </>
            ) : (
                <Route path="*" element={<Navigate to="/admin" />} />
            )}
        </Routes>
    </Router>
    );
}

export default App;
