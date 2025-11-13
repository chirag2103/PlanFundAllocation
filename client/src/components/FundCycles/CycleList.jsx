import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import Card from '../common/Card';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CycleList = ({ status = 'all', onEdit, onSelectCycle }) => {
  const queryClient = useQueryClient();
  const [expandedCycle, setExpandedCycle] = useState(null);

  // Fetch cycles
  const {
    data: cycles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fund-cycles', status],
    queryFn: () => {
      const url =
        status === 'all' ? '/api/cycles' : `/api/cycles?status=${status}`;
      return api.get(url).then((res) => res.data);
    },
  });

  // Activate cycle
  const activateMutation = useMutation({
    mutationFn: (cycleId) => api.patch(`/api/cycles/${cycleId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      toast.success('Cycle activated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to activate cycle');
    },
  });

  // Close cycle
  const closeMutation = useMutation({
    mutationFn: (cycleId) => api.patch(`/api/cycles/${cycleId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      toast.success('Cycle closed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to close cycle');
    },
  });

  const handleActivate = (cycleId) => {
    if (
      window.confirm(
        'Are you sure you want to activate this cycle? This will open it for proposals.'
      )
    ) {
      activateMutation.mutate(cycleId);
    }
  };

  const handleClose = (cycleId) => {
    if (
      window.confirm(
        'Are you sure you want to close this cycle? This cannot be undone.'
      )
    ) {
      closeMutation.mutate(cycleId);
    }
  };

  const toggleExpand = (cycleId) => {
    setExpandedCycle(expandedCycle === cycleId ? null : cycleId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#28a745';
      case 'draft':
        return '#ffc107';
      case 'closed':
        return '#6c757d';
      default:
        return '#007bff';
    }
  };

  if (error) {
    return (
      <Card title='Error'>
        <p style={{ color: 'var(--danger)' }}>
          Failed to load cycles: {error.message}
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title='Fund Cycles'>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div className='spinner'></div>
          <p>Loading cycles...</p>
        </div>
      </Card>
    );
  }

  if (!cycles || cycles.length === 0) {
    return (
      <Card title='Fund Cycles'>
        <div
          style={{
            textAlign: 'center',
            padding: '30px',
            color: 'var(--text-light)',
          }}
        >
          <p>📋 No fund cycles found</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            Create a new cycle to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className='cycle-list-container'>
      {cycles.map((cycle) => (
        <Card
          key={cycle._id}
          className='cycle-card'
          style={{ marginBottom: '15px' }}
        >
          <div
            className='cycle-card-header'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ margin: 0, color: 'var(--text)' }}>
                  {cycle.name}
                </h3>
                <Badge
                  variant={
                    cycle.status === 'active'
                      ? 'success'
                      : cycle.status === 'draft'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {cycle.status.toUpperCase()}
                </Badge>
              </div>
              <p
                style={{
                  margin: '5px 0',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                📅 Academic Year: {cycle.academicYear}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--primary)',
                }}
              >
                ₹{(cycle.totalBudget / 100000).toFixed(2)}L
              </div>
              <p
                style={{
                  margin: '5px 0',
                  color: 'var(--text-light)',
                  fontSize: '0.85rem',
                }}
              >
                Total Budget
              </p>
            </div>
          </div>

          {/* Expandable Details */}
          {expandedCycle === cycle._id && (
            <div
              style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '15px',
                }}
              >
                {/* Dates */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
                    📅 Dates
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <div>
                      <strong>Start:</strong>{' '}
                      {new Date(cycle.startDate).toLocaleDateString('en-IN')}
                    </div>
                    <div>
                      <strong>End:</strong>{' '}
                      {new Date(cycle.endDate).toLocaleDateString('en-IN')}
                    </div>
                    <div
                      style={{
                        marginTop: '10px',
                        color: 'var(--text-light)',
                        fontSize: '0.85rem',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Budget Summary */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
                    💰 Budget Allocation
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <div>
                      <strong>Total:</strong> ₹
                      {(cycle.totalBudget / 100000).toFixed(2)}L
                    </div>
                    <div>
                      <strong>Departments:</strong>{' '}
                      {cycle.departmentBudgets?.length || 0}
                    </div>
                    <div
                      style={{
                        marginTop: '8px',
                        color: 'var(--text-light)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {cycle.departmentBudgets?.slice(0, 3).map((db, idx) => (
                        <div key={idx}>
                          {db.department?.name || 'Department'}: ₹
                          {(db.allocatedAmount / 100000).toFixed(2)}L
                        </div>
                      ))}
                      {cycle.departmentBudgets?.length > 3 && (
                        <div>+{cycle.departmentBudgets.length - 3} more</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {cycle.description && (
                <div
                  style={{
                    backgroundColor: 'var(--secondary)',
                    padding: '10px',
                    borderRadius: 'var(--radius)',
                    marginBottom: '15px',
                  }}
                >
                  <strong>Description:</strong>
                  <p
                    style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}
                  >
                    {cycle.description}
                  </p>
                </div>
              )}

              {/* Department Budgets Table */}
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
                  Department Budget Breakdown
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className='table' style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Allocated</th>
                        <th>Spent</th>
                        <th>Remaining</th>
                        <th>Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycle.departmentBudgets?.map((db, idx) => {
                        const utilized =
                          db.allocatedAmount -
                          (cycle.totalBudget - db.allocatedAmount);
                        const utilizationRate = (
                          (db.spentAmount / db.allocatedAmount) *
                          100
                        ).toFixed(1);
                        return (
                          <tr key={idx}>
                            <td>{db.department?.name || 'Unknown'}</td>
                            <td>
                              ₹{(db.allocatedAmount / 100000).toFixed(2)}L
                            </td>
                            <td>₹{(db.spentAmount / 100000).toFixed(2)}L</td>
                            <td>
                              ₹
                              {(
                                (db.allocatedAmount - db.spentAmount) /
                                100000
                              ).toFixed(2)}
                              L
                            </td>
                            <td>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '60px',
                                    height: '6px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${Math.min(
                                        utilizationRate,
                                        100
                                      )}%`,
                                      backgroundColor:
                                        utilizationRate > 80
                                          ? '#ff9800'
                                          : '#28a745',
                                    }}
                                  ></div>
                                </div>
                                <span style={{ fontSize: '0.8rem' }}>
                                  {utilizationRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              marginTop: '15px',
              paddingTop: '15px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              variant='secondary'
              size='small'
              onClick={() => toggleExpand(cycle._id)}
            >
              {expandedCycle === cycle._id
                ? '▼ Hide Details'
                : '▶ Show Details'}
            </Button>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button
                variant='secondary'
                size='small'
                onClick={() => onEdit(cycle)}
              >
                ✏️ Edit
              </Button>

              {cycle.status === 'draft' && (
                <Button
                  variant='primary'
                  size='small'
                  onClick={() => handleActivate(cycle._id)}
                  loading={activateMutation.isPending}
                >
                  ▶ Activate
                </Button>
              )}

              {cycle.status === 'active' && (
                <Button
                  variant='danger'
                  size='small'
                  onClick={() => handleClose(cycle._id)}
                  loading={closeMutation.isPending}
                >
                  ⏹ Close
                </Button>
              )}

              {onSelectCycle && (
                <Button
                  variant='info'
                  size='small'
                  onClick={() => onSelectCycle(cycle)}
                >
                  📊 View Details
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CycleList;
