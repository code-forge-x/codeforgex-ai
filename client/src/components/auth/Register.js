import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
// import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [formError, setFormError] = useState('');
  
  const authContext = useContext(AuthContext);
  const { register, error } = authContext || { register: async () => {}, error: null };
  const navigate = useNavigate();
  
  const { name, email, password, password2 } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    // Simple validation
    if (password !== password2) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    // Clear any errors
    setFormError('');
    
    try {
      const userData = { name, email, password };
      console.log('Registering with:', userData);
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration component error:', err);
    }
  };
  
  return (
    <div className="register-container">
      <h1>Register</h1>
      <p>Create Your CodeForegX Account</p>
      
      {(formError || error) && <div className="alert-error">{formError || error}</div>}
      
      <form onSubmit={onSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Enter a password (min. 6 characters)"
            minLength="6"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={password2}
            onChange={onChange}
            placeholder="Confirm your password"
            minLength="6"
            required
          />
        </div>
        
        <button type="submit" className="btn">Register</button>
      </form>
      
      <p className="login-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;