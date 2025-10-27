import React from 'react';

const DashboardCard = ({ title, value, variant = 'primary', icon }) => {
  return (
    <div className={`dashboard-card variant-${variant}`}>
      {icon && <div className='dashboard-card-icon'>{icon}</div>}
      <div className='value'>{value}</div>
      <div className='label'>{title}</div>
    </div>
  );
};

export default DashboardCard;
