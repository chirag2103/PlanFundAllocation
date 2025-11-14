import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiFileText,
  FiDollarSign,
  FiSettings,
  FiBarChart2,
  FiUser,
} from 'react-icons/fi';

const Navigation = () => {
  const { user, hasRole } = useAuth();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: FiHome,
      roles: ['faculty', 'coordinator', 'admin'],
    },
    {
      path: '/proposals',
      label: 'Proposals',
      icon: FiFileText,
      roles: ['faculty', 'coordinator', 'admin'],
    },
    {
      path: '/cycles',
      label: 'Fund Cycles',
      icon: FiDollarSign,
      roles: ['coordinator', 'admin'],
    },
    {
      path: '/items',
      label: 'Item Management',
      icon: FiSettings,
      roles: ['admin'],
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: FiBarChart2,
      roles: ['coordinator', 'admin'],
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: FiUser,
      roles: ['faculty', 'coordinator', 'admin'],
    },
    {
      path: '/users',
      label: 'Manage Users',
      icon: FiUser,
      roles: ['admin'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles));

  return (
    <nav className='navigation'>
      <ul className='nav-menu'>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
