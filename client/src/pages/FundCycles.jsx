import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CycleForm from '../components/FundCycles/CycleForm';
import toast from 'react-hot-toast';

const FundCycles = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  // Fetch fund cycles
  const {
    data: cycles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fund-cycles', filterStatus],
    queryFn: () => {
      const url =
        filterStatus === 'all'
          ? '/api/cycles'
          : `/api/cycles?status=${filterStatus}`;
      return api.get(url).then((res) => res.data);
    },
  });

  // Create/Update cycle mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      editMode
        ? api.put(`/api/cycles/${selectedCycle._id}`, data)
        : api.post('/api/cycles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      toast.success(
        editMode ? 'Cycle updated successfully' : 'Cycle created successfully'
      );
      setShowForm(false);
      setSelectedCycle(null);
      setEditMode(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save cycle');
    },
  });

  // Activate cycle mutation
  const activateMutation = useMutation({
    mutationFn: (cycleId) => api.patch(`/api/cycles/${cycleId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      toast.success('Fund cycle activated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to activate cycle');
    },
  });

  // Close cycle mutation
  const closeMutation = useMutation({
    mutationFn: (cycleId) => api.patch(`/api/cycles/${cycleId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      toast.success('Fund cycle closed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to close cycle');
    },
  });

  // Delete cycle mutation
  const deleteMutation = useMutation({
    mutationFn: (cycleId) => api.delete(`/api/cycles/${cycleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      toast.success('Fund cycle deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete cycle');
    },
  });

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedCycle(null);
    setShowForm(true);
  };

  const handleEdit = (cycle) => {
    if (cycle.status !== 'draft') {
      toast.error('Can only edit draft cycles');
      return;
    }
    setEditMode(true);
    setSelectedCycle(cycle);
    setShowForm(true);
  };

  const handleActivate = (cycleId) => {
    if (window.confirm('Are you sure you want to activate this cycle?')) {
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

  const handleDelete = (cycleId) => {
    if (window.confirm('Are you sure you want to delete this cycle?')) {
      deleteMutation.mutate(cycleId);
    }
  };

  const handleFormSubmit = (data) => {
    saveMutation.mutate(data);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCycle(null);
    setEditMode(false);
  };

  // Only coordinators can create cycles
  const canCreateCycle = user?.role === 'coordinator';

  if (error) {
    return (
      <div className='error-container'>
        <Card title='Error'>
          <p style={{ color: 'var(--danger)' }}>
            {error.message || 'Failed to load fund cycles'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className='fund-cycles-page'>
      {/* Page Title */}
      <div className='page-title'>
        <h2>📅 Fund Cycles Management</h2>
        {canCreateCycle && (
          <Button
            variant='primary'
            onClick={handleCreateNew}
            disabled={saveMutation.isPending}
          >
            ➕ Create New Cycle
          </Button>
        )}
      </div>

      {!canCreateCycle && (
        <Card
          style={{
            marginBottom: '20px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderLeft: '4px solid #ffc107',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text)' }}>
            <strong>ℹ️ Info:</strong> Only coordinators can create fund cycles.
          </p>
        </Card>
      )}

      {/* Filter Section */}
      <Card title='🔍 Filter Cycles' style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'secondary'}
            size='small'
            onClick={() => setFilterStatus('all')}
          >
            All Cycles
          </Button>
          <Button
            variant={filterStatus === 'draft' ? 'primary' : 'secondary'}
            size='small'
            onClick={() => setFilterStatus('draft')}
          >
            Draft
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'primary' : 'secondary'}
            size='small'
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'closed' ? 'primary' : 'secondary'}
            size='small'
            onClick={() => setFilterStatus('closed')}
          >
            Closed
          </Button>
        </div>
      </Card>

      {/* Cycles Table */}
      <Card title='💾 All Fund Cycles'>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className='spinner'></div>
            <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>
              Loading fund cycles...
            </p>
          </div>
        ) : !cycles || cycles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px',
              color: 'var(--text-light)',
            }}
          >
            <p>📭 No fund cycles found</p>
            {canCreateCycle && (
              <p style={{ fontSize: '0.9rem' }}>
                Click "Create New Cycle" to get started
              </p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className='table'>
              <thead>
                <tr>
                  <th>Cycle Name</th>
                  <th>Academic Year</th>
                  <th>Department</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((cycle) => (
                  <tr key={cycle._id}>
                    {/* Cycle Name */}
                    <td>
                      <strong>{cycle.name}</strong>
                    </td>

                    {/* Academic Year */}
                    <td>{cycle.academicYear}</td>

                    {/* Department */}
                    <td>
                      {cycle.department?.name}
                      <br />
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-light)',
                        }}
                      >
                        ({cycle.department?.code})
                      </span>
                    </td>

                    {/* Budget - FIXED: Use allocatedBudget instead of totalBudget */}
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>
                        ₹{((cycle.allocatedBudget || 0) / 100000).toFixed(2)}L
                      </strong>
                    </td>

                    {/* Status */}
                    <td>
                      <Badge
                        variant={
                          cycle.status === 'active'
                            ? 'success'
                            : cycle.status === 'draft'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {cycle.status.charAt(0).toUpperCase() +
                          cycle.status.slice(1)}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Edit - Draft Only */}
                        {cycle.status === 'draft' && canCreateCycle && (
                          <Button
                            variant='secondary'
                            size='small'
                            onClick={() => handleEdit(cycle)}
                            disabled={saveMutation.isPending}
                          >
                            Edit
                          </Button>
                        )}

                        {/* Activate - Draft Only */}
                        {cycle.status === 'draft' && canCreateCycle && (
                          <Button
                            variant='primary'
                            size='small'
                            onClick={() => handleActivate(cycle._id)}
                            loading={activateMutation.isPending}
                          >
                            Activate
                          </Button>
                        )}

                        {/* Close - Active Only */}
                        {cycle.status === 'active' && canCreateCycle && (
                          <Button
                            variant='danger'
                            size='small'
                            onClick={() => handleClose(cycle._id)}
                            loading={closeMutation.isPending}
                          >
                            Close
                          </Button>
                        )}

                        {/* Delete - Draft Only */}
                        {cycle.status === 'draft' && canCreateCycle && (
                          <Button
                            variant='danger'
                            size='small'
                            onClick={() => handleDelete(cycle._id)}
                            loading={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Statistics */}
      {cycles && cycles.length > 0 && (
        <Card title='📊 Statistics' style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            {/* Total Cycles */}
            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: 'var(--primary)',
                }}
              >
                {cycles.length}
              </div>
              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  marginTop: '5px',
                }}
              >
                Total Cycles
              </div>
            </div>

            {/* Draft Cycles */}
            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#ffc107',
                }}
              >
                {cycles.filter((c) => c.status === 'draft').length}
              </div>
              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  marginTop: '5px',
                }}
              >
                Draft Cycles
              </div>
            </div>

            {/* Active Cycles */}
            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#28a745',
                }}
              >
                {cycles.filter((c) => c.status === 'active').length}
              </div>
              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  marginTop: '5px',
                }}
              >
                Active Cycles
              </div>
            </div>

            {/* Closed Cycles */}
            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#17a2b8',
                }}
              >
                {cycles.filter((c) => c.status === 'closed').length}
              </div>
              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  marginTop: '5px',
                }}
              >
                Closed Cycles
              </div>
            </div>

            {/* Total Budget */}
            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--primary)',
                }}
              >
                ₹
                {(
                  cycles.reduce((sum, c) => sum + (c.allocatedBudget || 0), 0) /
                  10000000
                ).toFixed(1)}
                Cr
              </div>
              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  marginTop: '5px',
                }}
              >
                Total Budget
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cycle Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editMode ? '✏️ Edit Fund Cycle' : '➕ Create New Fund Cycle'}
        size='medium'
      >
        <CycleForm
          cycle={editMode ? selectedCycle : null}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={saveMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default FundCycles;
