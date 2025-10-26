import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className='spinner'></div>
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
