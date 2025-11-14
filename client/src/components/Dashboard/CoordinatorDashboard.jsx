import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import Card from '../common/Card';
import DashboardCard from './DashboardCard';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const { data: proposals } = useQuery({
    queryKey: ['coordinator-proposals'],
    queryFn: () => api.get('/api/proposals').then((res) => res.data),
  });

  const { data: cycles } = useQuery({
    queryKey: ['fund-cycles'],
    queryFn: () => api.get('/api/cycles').then((res) => res.data),
  });

  const stats = {
    totalProposals: proposals?.total || 0,
    pendingReview:
      proposals?.proposals?.filter((p) => p.status === 'submitted').length || 0,
    approved:
      proposals?.proposals?.filter((p) => p.status === 'approved').length || 0,
    activeCycles: cycles?.filter((c) => c.status === 'active').length || 0,
  };

  return (
    <div className='coordinator-dashboard'>
      <div className='dashboard-cards'>
        <DashboardCard
          title='Total Proposals'
          value={stats.totalProposals}
          variant='primary'
          icon={<FiFileText size={24} />}
        />
        <DashboardCard
          title='Pending Review'
          value={stats.pendingReview}
          variant='warning'
          icon={<FiClock size={24} />}
        />
        <DashboardCard
          title='Approved'
          value={stats.approved}
          variant='success'
          icon={<FiCheckCircle size={24} />}
        />
        <DashboardCard
          title='Active Cycles'
          value={stats.activeCycles}
          variant='info'
          icon={<FiDollarSign size={24} />}
        />
      </div>

      <Card title='Quick Actions'>
        <div className='quick-actions'>
          <button
            className='btn btn-primary'
            onClick={() => {
              navigate('/proposals');
            }}
          >
            Review Proposals
          </button>
          <button
            className='btn btn-secondary'
            onClick={() => {
              navigate('/cycles');
            }}
          >
            Create Fund Cycle
          </button>
          <button
            className='btn btn-secondary'
            onClick={() => {
              navigate('/reports');
            }}
          >
            View Reports
          </button>
        </div>
      </Card>
    </div>
  );
};

export default CoordinatorDashboard;
