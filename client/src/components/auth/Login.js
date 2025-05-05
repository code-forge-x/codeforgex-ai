import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
// import './Login.css';

// Renamed to LoginComponent to avoid name collision
const LoginComponent = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const authContext = useContext(AuthContext);
  const { login, error } = authContext || { login: async () => {}, error: null };
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      console.log('Attempting login with:', formData);
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login component error:', err);
    }
  };
  
  return (
    <div className="login-container">
      <h1>Login</h1>
      <p>Sign In to Your CodeForegX Account</p>
      
      {error && <div className="alert-error">{error}</div>}
      
      <form onSubmit={onSubmit} className="login-form">
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
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" className="btn">Login</button>
      </form>
      
      <p className="register-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

// Export the component
export default LoginComponent;