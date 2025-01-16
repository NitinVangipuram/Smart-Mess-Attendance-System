import React, { useState } from 'react';
import logo from "./img/logo_black_final.png";
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="https://www.iitdh.ac.in/sites/default/files/2024-01/logo_black_final.png" alt="icon" />
                </Link>
                <button className="menu-icon" onClick={toggleMobileMenu}>
                    {/* Hamburger Icon */}
                    <span className="menu-icon-bar"></span>
                    <span className="menu-icon-bar"></span>
                    <span className="menu-icon-bar"></span>
                </button>
                <div className={`navbar-links ${isMobileMenuOpen ? "navbar-links-active" : ""}`} style={{alignItems:"center" , zIndex:"2"}}>
                    <Link to="/register" className="navbar-item" onClick={toggleMobileMenu}>Register</Link>
                    <Link to="/login" className="navbar-item" onClick={toggleMobileMenu}>Mark Student</Link>
                    <Link to="/analytics" className="navbar-item" onClick={toggleMobileMenu}>Analytics</Link>
                    <Link to="/impexp" className="navbar-item" onClick={toggleMobileMenu}>Import/Export</Link>
                    
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
