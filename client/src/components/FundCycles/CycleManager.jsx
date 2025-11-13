import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import CycleForm from './CycleForm';
import CycleList from './CycleList';
import toast from 'react-hot-toast';

const CycleManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCycleDetails, setSelectedCycleDetails] = useState(null);
  const queryClient = useQueryClient();

  // Get statistics
  const { data: stats } = useQuery({
    queryKey: ['cycle-stats'],
    queryFn: async () => {
      const cycles = await api.get('/api/cycles').then((res) => res.data);
      return {
        total: cycles.length,
        active: cycles.filter((c) => c.status === 'active').length,
        draft: cycles.filter((c) => c.status === 'draft').length,
        closed: cycles.filter((c) => c.status === 'closed').length,
        totalBudget: cycles.reduce((sum, c) => sum + c.totalBudget, 0),
      };
    },
  });

  // Save cycle
  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingCycle
        ? api.put(`/api/cycles/${editingCycle._id}`, data)
        : api.post('/api/cycles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-cycles'] });
      queryClient.invalidateQueries({ queryKey: ['cycle-stats'] });
      toast.success(
        editingCycle
          ? 'Cycle updated successfully'
          : 'Cycle created successfully'
      );
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save cycle');
    },
  });

  const handleCreateNew = () => {
    setEditingCycle(null);
    setShowForm(true);
  };

  const handleEdit = (cycle) => {
    setEditingCycle(cycle);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCycle(null);
  };

  const handleFormSubmit = (data) => {
    saveMutation.mutate(data);
  };

  const handleSelectCycle = (cycle) => {
    setSelectedCycleDetails(cycle);
  };

  return (
    <div className='cycle-manager'>
      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
              }}
            >
              {stats?.total || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Total Cycles
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
            >
              {stats?.active || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Active Cycles
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}
            >
              {stats?.draft || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Draft Cycles
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#007bff',
              }}
            >
              ₹{(stats?.totalBudget / 10000000).toFixed(1)}Cr
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Total Budget
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <Card style={{ marginBottom: '25px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
              Fund Cycles
            </h3>
            <p
              style={{
                margin: 0,
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Manage fund allocation cycles and track department budgets
            </p>
          </div>
          <Button
            variant='primary'
            onClick={handleCreateNew}
            disabled={saveMutation.isPending}
          >
            + Create New Cycle
          </Button>
        </div>
      </Card>

      {/* Filter Section */}
      <Card style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('all')}
            size='small'
          >
            All ({stats?.total || 0})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('active')}
            size='small'
          >
            Active ({stats?.active || 0})
          </Button>
          <Button
            variant={filterStatus === 'draft' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('draft')}
            size='small'
          >
            Draft ({stats?.draft || 0})
          </Button>
          <Button
            variant={filterStatus === 'closed' ? 'primary' : 'secondary'}
            onClick={() => setFilterStatus('closed')}
            size='small'
          >
            Closed ({stats?.closed || 0})
          </Button>
        </div>
      </Card>

      {/* Cycle List */}
      <CycleList
        status={filterStatus}
        onEdit={handleEdit}
        onSelectCycle={handleSelectCycle}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingCycle ? 'Edit Fund Cycle' : 'Create New Fund Cycle'}
        size='medium'
      >
        <CycleForm
          cycle={editingCycle}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={saveMutation.isPending}
        />
      </Modal>

      {/* Cycle Details Modal */}
      {selectedCycleDetails && (
        <Modal
          isOpen={!!selectedCycleDetails}
          onClose={() => setSelectedCycleDetails(null)}
          title={selectedCycleDetails.name}
          size='large'
        >
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h4>📅 Timeline</h4>
                <p>
                  <strong>Start:</strong>{' '}
                  {new Date(selectedCycleDetails.startDate).toLocaleDateString(
                    'en-IN'
                  )}
                </p>
                <p>
                  <strong>End:</strong>{' '}
                  {new Date(selectedCycleDetails.endDate).toLocaleDateString(
                    'en-IN'
                  )}
                </p>
                <p>
                  <strong>Submission:</strong>{' '}
                  {new Date(
                    selectedCycleDetails.submissionDeadline
                  ).toLocaleDateString('en-IN')}
                </p>
                <p>
                  <strong>Review:</strong>{' '}
                  {new Date(
                    selectedCycleDetails.reviewDeadline
                  ).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <h4>💰 Budget</h4>
                <p>
                  <strong>Total:</strong> ₹
                  {(selectedCycleDetails.totalBudget / 100000).toFixed(2)}L
                </p>
                <p>
                  <strong>Departments:</strong>{' '}
                  {selectedCycleDetails.departmentBudgets?.length}
                </p>
              </div>
            </div>

            {selectedCycleDetails.description && (
              <div
                style={{
                  marginBottom: '20px',
                  backgroundColor: 'var(--secondary)',
                  padding: '10px',
                  borderRadius: 'var(--radius)',
                }}
              >
                <strong>Description:</strong>
                <p>{selectedCycleDetails.description}</p>
              </div>
            )}

            <h4>Department Allocations</h4>
            <table className='table' style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Allocated</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {selectedCycleDetails.departmentBudgets?.map((db, idx) => (
                  <tr key={idx}>
                    <td>{db.department?.name || 'Unknown'}</td>
                    <td>₹{(db.allocatedAmount / 100000).toFixed(2)}L</td>
                    <td>₹{(db.spentAmount / 100000).toFixed(2)}L</td>
                    <td>
                      ₹
                      {((db.allocatedAmount - db.spentAmount) / 100000).toFixed(
                        2
                      )}
                      L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CycleManager;
