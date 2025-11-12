import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className='header'>
      <div className='container header-container'>
        <div className='logo'>
          <h1>Plan Fund Allocation System</h1>
        </div>

        <div className='user-info'>
          <span className='user-name'>{user?.name}</span>
          <span className='user-role'>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </span>
          <button onClick={logout} className='btn btn-secondary'>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
