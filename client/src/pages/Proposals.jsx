import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import ProposalList from '../components/Proposals/ProposalList';
import ProposalForm from '../components/Proposals/ProposalForm';
import ProposalDetails from '../components/Proposals/ProposalDetails';
import ProposalReview from '../components/Proposals/ProposalReview';
import toast from 'react-hot-toast';

const Proposals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Fetch proposals
  const {
    data: proposals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['proposals', filterStatus, filterPriority, user?.role],
    queryFn: () => {
      let url = '/api/proposals';
      const params = new URLSearchParams();

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterPriority !== 'all') {
        params.append('priority', filterPriority);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      return api.get(url).then((res) => res.data);
    },
  });

  // Get statistics
  const { data: stats } = useQuery({
    queryKey: ['proposal-stats', user?.role],
    queryFn: async () => {
      const allProposals = await api
        .get('/api/proposals')
        .then((res) => res.data);
      return {
        total: allProposals.total || 0,
        draft:
          allProposals.proposals?.filter((p) => p.status === 'draft').length ||
          0,
        submitted:
          allProposals.proposals?.filter((p) => p.status === 'submitted')
            .length || 0,
        approved:
          allProposals.proposals?.filter((p) => p.status === 'approved')
            .length || 0,
        rejected:
          allProposals.proposals?.filter((p) => p.status === 'rejected')
            .length || 0,
        totalBudget:
          allProposals.proposals?.reduce(
            (sum, p) => sum + (p.totalAmount || 0),
            0
          ) || 0,
      };
    },
  });

  // Create/Update proposal
  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingProposal
        ? api.put(`/api/proposals/${editingProposal._id}`, data)
        : api.post('/api/proposals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-stats'] });
      toast.success(
        editingProposal
          ? 'Proposal updated successfully'
          : 'Proposal created successfully'
      );
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save proposal');
    },
  });

  // Submit proposal
  const submitMutation = useMutation({
    mutationFn: (proposalId) =>
      api.patch(`/api/proposals/${proposalId}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-stats'] });
      toast.success('Proposal submitted successfully');
      setSelectedProposal(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to submit proposal');
    },
  });

  // Approve proposal (Coordinator only)
  const approveMutation = useMutation({
    mutationFn: (data) =>
      api.patch(`/api/proposals/${data.proposalId}/approve`, {
        comments: data.comments,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-stats'] });
      toast.success('Proposal approved successfully');
      handleCloseReview();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to approve proposal');
    },
  });

  // Reject proposal (Coordinator only)
  const rejectMutation = useMutation({
    mutationFn: (data) =>
      api.patch(`/api/proposals/${data.proposalId}/reject`, {
        comments: data.comments,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-stats'] });
      toast.success('Proposal rejected successfully');
      handleCloseReview();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to reject proposal');
    },
  });

  // Delete proposal
  const deleteMutation = useMutation({
    mutationFn: (proposalId) => api.delete(`/api/proposals/${proposalId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-stats'] });
      toast.success('Proposal deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete proposal');
    },
  });

  const handleCreateNew = () => {
    setEditingProposal(null);
    setShowForm(true);
  };

  const handleEdit = (proposal) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProposal(null);
  };

  const handleFormSubmit = (data) => {
    saveMutation.mutate(data);
  };

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setShowDetails(true);
  };

  // Only coordinator can review
  const handleOpenReview = (proposal) => {
    if (user?.role !== 'coordinator') {
      toast.error('Only coordinators can review proposals');
      return;
    }
    setSelectedProposal(proposal);
    setShowReview(true);
  };

  const handleCloseReview = () => {
    setShowReview(false);
    setSelectedProposal(null);
  };

  const handleSubmitProposal = (proposalId) => {
    if (
      window.confirm(
        'Submit this proposal? You will not be able to edit it after submission.'
      )
    ) {
      submitMutation.mutate(proposalId);
    }
  };

  const handleDeleteProposal = (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      deleteMutation.mutate(proposalId);
    }
  };

  const handleApproveProposal = (proposalId, comments) => {
    if (window.confirm('Are you sure you want to approve this proposal?')) {
      approveMutation.mutate({ proposalId, comments });
    }
  };

  const handleRejectProposal = (proposalId, comments) => {
    if (window.confirm('Are you sure you want to reject this proposal?')) {
      rejectMutation.mutate({ proposalId, comments });
    }
  };

  if (error) {
    return (
      <div className='error-container'>
        <Card title='Error'>
          <p style={{ color: 'var(--danger)' }}>
            {error.message || 'Failed to load proposals'}
          </p>
        </Card>
      </div>
    );
  }

  // Determine page title based on role
  const getPageTitle = () => {
    if (user?.role === 'faculty') {
      return 'My Proposals';
    } else if (user?.role === 'coordinator') {
      return 'Manage Proposals';
    } else if (user?.role === 'admin') {
      return 'All Proposals';
    }
    return 'Proposals';
  };

  return (
    <div className='proposals-page'>
      <div className='page-title'>
        <h2>{getPageTitle()}</h2>
        {user?.role === 'faculty' && (
          <Button
            variant='primary'
            onClick={handleCreateNew}
            disabled={saveMutation.isPending}
          >
            + Create New Proposal
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
              Total Proposals
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}
            >
              {stats?.draft || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Draft
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}
            >
              {stats?.submitted || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Submitted
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
            >
              {stats?.approved || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Approved
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}
            >
              {stats?.rejected || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Rejected
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
              }}
            >
              ₹{(stats?.totalBudget / 100000).toFixed(2)}L
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Total Budget
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-light)',
              }}
            >
              Status:
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('all')}
                size='small'
              >
                All ({stats?.total || 0})
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('draft')}
                size='small'
              >
                Draft ({stats?.draft || 0})
              </Button>
              <Button
                variant={filterStatus === 'submitted' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('submitted')}
                size='small'
              >
                Submitted ({stats?.submitted || 0})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('approved')}
                size='small'
              >
                Approved ({stats?.approved || 0})
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus('rejected')}
                size='small'
              >
                Rejected ({stats?.rejected || 0})
              </Button>
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-light)',
              }}
            >
              Priority:
            </label>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant={filterPriority === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilterPriority('all')}
                size='small'
              >
                All
              </Button>
              <Button
                variant={filterPriority === 'low' ? 'primary' : 'secondary'}
                onClick={() => setFilterPriority('low')}
                size='small'
              >
                Low
              </Button>
              <Button
                variant={filterPriority === 'medium' ? 'primary' : 'secondary'}
                onClick={() => setFilterPriority('medium')}
                size='small'
              >
                Medium
              </Button>
              <Button
                variant={filterPriority === 'high' ? 'primary' : 'secondary'}
                onClick={() => setFilterPriority('high')}
                size='small'
              >
                High
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Proposals List */}
      <ProposalList
        proposals={proposals?.proposals || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteProposal}
        onViewDetails={handleViewDetails}
        onSubmit={handleSubmitProposal}
        onReview={handleOpenReview}
        isDeleting={deleteMutation.isPending}
        userRole={user?.role}
        canReview={user?.role === 'coordinator'} // ✅ Only coordinator can review
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
        size='large'
      >
        <ProposalForm
          proposal={editingProposal}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={saveMutation.isPending}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title='Proposal Details'
        size='large'
      >
        {selectedProposal && (
          <ProposalDetails
            proposal={selectedProposal}
            onClose={() => setShowDetails(false)}
            onEdit={() => {
              handleEdit(selectedProposal);
              setShowDetails(false);
            }}
          />
        )}
      </Modal>

      {/* Review Modal - Coordinator only */}
      {user?.role === 'coordinator' && (
        <Modal
          isOpen={showReview}
          onClose={handleCloseReview}
          title='Review Proposal'
          size='large'
        >
          {selectedProposal && (
            <ProposalReview
              proposal={selectedProposal}
              onApprove={(comments) =>
                handleApproveProposal(selectedProposal._id, comments)
              }
              onReject={(comments) =>
                handleRejectProposal(selectedProposal._id, comments)
              }
              onCancel={handleCloseReview}
              isLoading={approveMutation.isPending || rejectMutation.isPending}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default Proposals;
