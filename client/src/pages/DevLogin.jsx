import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShield, FiUsers } from 'react-icons/fi';

const DevLogin = () => {
  const [users, setUsers] = useState([]);
  const { login } = useAuth();

  useEffect(() => {
    fetchMockUsers();
  }, []);

  const fetchMockUsers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/auth/dev/users'
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching mock users:', error);
    }
  };

  const handleLogin = async (userId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/dev/login',
        {
          userId,
        }
      );
      login(response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'faculty':
        return <FiUser size={40} />;
      case 'coordinator':
        return <FiUsers size={40} />;
      case 'admin':
        return <FiShield size={40} />;
      default:
        return <FiUser size={40} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'faculty':
        return '#1a73e8';
      case 'coordinator':
        return '#28a745';
      case 'admin':
        return '#dc3545';
      default:
        return '#1a73e8';
    }
  };

  return (
    <div className='login-container'>
      <div className='dev-login-card'>
        <div className='dev-login-header'>
          <h1>Development Mode</h1>
          <p>Select a user to login as</p>
          <div className='dev-badge'>DEV ONLY</div>
        </div>

        <div className='dev-users-grid'>
          {users.map((user) => (
            <div
              key={user.id}
              className='dev-user-card'
              onClick={() => handleLogin(user.id)}
              style={{ borderLeftColor: getRoleColor(user.role) }}
            >
              <div
                className='dev-user-icon'
                style={{ color: getRoleColor(user.role) }}
              >
                {getRoleIcon(user.role)}
              </div>
              <div className='dev-user-info'>
                <h3>{user.name}</h3>
                <p className='dev-user-email'>{user.email}</p>
                <span
                  className='dev-user-role'
                  style={{
                    backgroundColor: `${getRoleColor(user.role)}15`,
                    color: getRoleColor(user.role),
                  }}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className='dev-login-footer'>
          <p>⚠️ This login method is only available in development mode</p>
        </div>
      </div>

      <style>{`
        .dev-login-card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 40px;
          width: 100%;
          max-width: 700px;
        }

        .dev-login-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }

        .dev-login-header h1 {
          color: #1a73e8;
          margin-bottom: 10px;
          font-size: 2rem;
        }

        .dev-login-header p {
          color: #666;
          margin-bottom: 20px;
        }

        .dev-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .dev-users-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 30px;
        }

        .dev-user-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-left: 5px solid #1a73e8;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .dev-user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border-color: currentColor;
        }

        .dev-user-icon {
          flex-shrink: 0;
        }

        .dev-user-info {
          flex: 1;
        }

        .dev-user-info h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 1.2rem;
        }

        .dev-user-email {
          color: #666;
          font-size: 0.9rem;
          margin: 0 0 10px 0;
        }

        .dev-user-role {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dev-login-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .dev-login-footer p {
          color: #ff9800;
          font-size: 0.85rem;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default DevLogin;
