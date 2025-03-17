import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="error-message">
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;