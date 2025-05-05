import React from 'react';
import { Link } from 'react-router-dom';
// import './Navbar.css';

const Navbar = () => {
  // For now, we'll use a simple approach without context
  // We'll implement proper authentication later
  const isAuthenticated = false; // Hardcoded for now
  const user = null;
  
  const onLogout = () => {
    console.log('Logout clicked');
    // We'll implement actual logout functionality later
  };
  
  const authLinks = (
    <ul>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        {user && <span>Welcome {user.name}</span>}
      </li>
      <li>
        <a onClick={onLogout} href="#!">
          Logout
        </a>
      </li>
    </ul>
  );
  
  const guestLinks = (
    <ul>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );
  
  return (
    <nav className="navbar">
      <h1>
        <Link to="/">CodeForegX AI</Link>
      </h1>
      <div className="nav-links">{isAuthenticated ? authLinks : guestLinks}</div>
    </nav>
  );
};

export default Navbar;