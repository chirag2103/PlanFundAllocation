import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../common/Card';
import DashboardCard from './DashboardCard';
import Table from '../common/Table';
import Badge from '../common/Badge';

const FacultyDashboard = () => {
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['faculty-proposals'],
    queryFn: () => api.get('/api/proposals?limit=5').then((res) => res.data),
  });

  const { data: cycles } = useQuery({
    queryKey: ['active-cycles'],
    queryFn: () => api.get('/api/cycles?status=active').then((res) => res.data),
  });

  const stats = {
    activeCycles: cycles?.length || 0,
    submittedProposals: proposals?.proposals?.length || 0,
    approvedProposals:
      proposals?.proposals?.filter((p) => p.status === 'approved').length || 0,
    pendingApproval:
      proposals?.proposals?.filter((p) => p.status === 'submitted').length || 0,
  };

  const columns = [
    { key: 'proposalId', label: 'ID' },
    { key: 'fundCycle.name', label: 'Cycle' },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value) => `₹${value?.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Date',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='faculty-dashboard'>
      <div className='dashboard-cards'>
        <DashboardCard
          title='Active Cycles'
          value={stats.activeCycles}
          variant='primary'
        />
        <DashboardCard
          title='Submitted Proposals'
          value={stats.submittedProposals}
          variant='info'
        />
        <DashboardCard
          title='Approved Proposals'
          value={stats.approvedProposals}
          variant='success'
        />
        <DashboardCard
          title='Pending Approval'
          value={stats.pendingApproval}
          variant='warning'
        />
      </div>

      <Card
        title='Recent Proposals'
        actions={
          <Link to='/proposals' className='btn btn-primary'>
            Submit New Proposal
          </Link>
        }
      >
        <Table
          data={proposals?.proposals || []}
          columns={columns}
          emptyMessage='No proposals found'
        />
      </Card>
    </div>
  );
};

const getStatusVariant = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'submitted':
      return 'warning';
    default:
      return 'info';
  }
};

export default FacultyDashboard;
