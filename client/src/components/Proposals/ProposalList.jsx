import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const ProposalList = ({
  proposals,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
  onSubmit,
  onReview,
  isDeleting,
  userRole,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'submitted':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return '#17a2b8';
      case 'medium':
        return '#ffc107';
      case 'high':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <Card title='Proposals'>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div className='spinner'></div>
          <p>Loading proposals...</p>
        </div>
      </Card>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <Card title='Proposals'>
        <div
          style={{
            textAlign: 'center',
            padding: '30px',
            color: 'var(--text-light)',
          }}
        >
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            📋 No proposals found
          </p>
          {userRole === 'faculty' && (
            <p>Create your first proposal to get started</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className='proposal-list'>
      {proposals.map((proposal) => (
        <Card key={proposal._id} style={{ marginBottom: '15px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ margin: 0, color: 'var(--text)' }}>
                  Proposal{' '}
                  {proposal.proposalId || proposal._id?.substring(0, 8)}
                </h3>
                <Badge variant={getStatusColor(proposal.status)}>
                  {proposal.status?.toUpperCase()}
                </Badge>
                <Badge
                  variant={
                    proposal.priority === 'high'
                      ? 'danger'
                      : proposal.priority === 'low'
                      ? 'info'
                      : 'warning'
                  }
                >
                  {proposal.priority?.toUpperCase()}
                </Badge>
              </div>

              <p
                style={{
                  margin: '5px 0',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                📂 {proposal.fundCycle?.name || 'Unknown Cycle'}
              </p>

              <p
                style={{
                  margin: '5px 0',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                👤 Faculty: {proposal.faculty?.name || 'Unknown'}
              </p>

              <p
                style={{
                  margin: '5px 0',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                🏢 Department: {proposal.department?.name || 'Unknown'}
              </p>

              <div style={{ marginTop: '10px' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                  ₹{(proposal.totalAmount / 100000).toFixed(2)}L
                </strong>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minWidth: '150px',
              }}
            >
              <Button
                variant='secondary'
                size='small'
                onClick={() => onViewDetails(proposal)}
              >
                👁️ View Details
              </Button>

              {proposal.status === 'draft' && userRole === 'faculty' && (
                <>
                  <Button
                    variant='primary'
                    size='small'
                    onClick={() => onEdit(proposal)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant='success'
                    size='small'
                    onClick={() => onSubmit(proposal._id)}
                  >
                    📤 Submit
                  </Button>
                  <Button
                    variant='danger'
                    size='small'
                    onClick={() => onDelete(proposal._id)}
                    loading={isDeleting}
                  >
                    🗑️ Delete
                  </Button>
                </>
              )}

              {proposal.status === 'submitted' &&
                (userRole === 'coordinator' || userRole === 'admin') && (
                  <Button
                    variant='primary'
                    size='small'
                    onClick={() => onReview(proposal)}
                  >
                    📋 Review
                  </Button>
                )}
            </div>
          </div>

          {proposal.items && proposal.items.length > 0 && (
            <div
              style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid var(--border)',
                fontSize: '0.85rem',
              }}
            >
              <strong>Items:</strong>
              {proposal.items.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  style={{ color: 'var(--text-light)', marginTop: '5px' }}
                >
                  • {item.itemKeyword?.name || 'Item'} x{item.quantity} - ₹
                  {(item.totalCost / 100000).toFixed(2)}L
                </div>
              ))}
              {proposal.items.length > 2 && (
                <div style={{ color: 'var(--text-light)', marginTop: '5px' }}>
                  +{proposal.items.length - 2} more items
                </div>
              )}
            </div>
          )}

          {proposal.reviewComments && (
            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                borderLeft: `4px solid ${getPriorityColor(proposal.priority)}`,
              }}
            >
              <strong style={{ fontSize: '0.9rem' }}>Review Comments:</strong>
              <p
                style={{
                  margin: '5px 0 0 0',
                  fontSize: '0.85rem',
                  color: 'var(--text-light)',
                }}
              >
                {proposal.reviewComments}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ProposalList;
