import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`card card-${variant} card-padding-${padding} ${hoverable ? 'card-hoverable' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">{headerAction}</div>
          )}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;