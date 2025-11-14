import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL || 'http://localhost:5000'
    }/api/auth/google`;
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <h1>Plan Fund Allocation System</h1>
          <p>Please login with your NITC account to continue</p>
        </div>

        <button onClick={handleGoogleLogin} className='oauth-btn'>
          <FcGoogle size={20} />
          Login with NITC Account
        </button>

        <div className='login-footer'>
          <p>© 2025 NIT Calicut. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
