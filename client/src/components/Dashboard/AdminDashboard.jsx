import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import Card from '../common/Card';
import DashboardCard from './DashboardCard';
import { FiUsers, FiFileText, FiDatabase, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => api.get('/api/users').then((res) => res.data),
  });

  const { data: proposals } = useQuery({
    queryKey: ['all-proposals'],
    queryFn: () => api.get('/api/proposals').then((res) => res.data),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/api/departments').then((res) => res.data),
  });

  const stats = {
    totalUsers: users?.total || 0,
    totalProposals: proposals?.total || 0,
    totalDepartments: departments?.length || 0,
    approvalRate: proposals?.proposals
      ? (
          (proposals.proposals.filter((p) => p.status === 'approved').length /
            proposals.proposals.length) *
          100
        ).toFixed(1)
      : 0,
  };

  return (
    <div className='admin-dashboard'>
      <div className='dashboard-cards'>
        <DashboardCard
          title='Total Users'
          value={stats.totalUsers}
          variant='primary'
          icon={<FiUsers size={24} />}
        />
        <DashboardCard
          title='Total Proposals'
          value={stats.totalProposals}
          variant='info'
          icon={<FiFileText size={24} />}
        />
        <DashboardCard
          title='Departments'
          value={stats.totalDepartments}
          variant='success'
          icon={<FiDatabase size={24} />}
        />
        <DashboardCard
          title='Approval Rate'
          value={`${stats.approvalRate}%`}
          variant='warning'
          icon={<FiTrendingUp size={24} />}
        />
      </div>

      <Card title='System Overview'>
        <div className='system-stats'>
          <p>Manage users, departments, and system-wide settings.</p>
          <div className='quick-actions mt-3'>
            <button
              className='btn btn-primary'
              onClick={() => {
                navigate('/users');
              }}
            >
              Manage Users
            </button>
            <button
              className='btn btn-secondary'
              onClick={() => {
                navigate('/users');
              }}
            >
              Manage Departments
            </button>
            <button
              className='btn btn-secondary'
              onClick={() => {
                navigate('/reports');
              }}
            >
              System Reports
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
