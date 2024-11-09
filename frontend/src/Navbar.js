import React from 'react';
import logo from "./img/logo_black_final.png";
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import your CSS file

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/register" className="navbar-logo"><img src={logo} alt="icon" /></Link>
                <div className="navbar-links">
                    <Link to="/register" className="navbar-item">Register</Link>
                    <Link to="/attendance" className="navbar-item">Enter Student</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
