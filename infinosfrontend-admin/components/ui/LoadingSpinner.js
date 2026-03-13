import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text,
  className = '' 
}) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner spinner-${size} spinner-${color}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;