import React from 'react';
import './Input.css';

const Input = ({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={props.id}>
          {label}
          {props.required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className={`input-container ${error ? 'input-error' : ''}`}>
        {leftIcon && (
          <span className="input-icon input-icon-left">{leftIcon}</span>
        )}
        
        <input
          className={`input-field ${leftIcon ? 'input-has-left-icon' : ''} ${rightIcon ? 'input-has-right-icon' : ''}`}
          {...props}
        />
        
        {rightIcon && (
          <span className="input-icon input-icon-right">{rightIcon}</span>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`input-message ${error ? 'input-message-error' : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;