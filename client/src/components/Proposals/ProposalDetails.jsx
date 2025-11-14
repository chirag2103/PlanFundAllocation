import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ProposalDetails = ({ proposal, onClose, onEdit }) => {
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

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>
              Proposal {proposal.proposalId || proposal._id?.substring(0, 8)}
            </h3>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>
              Submitted:{' '}
              {new Date(proposal.submittedAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          <Badge variant={getStatusColor(proposal.status)}>
            {proposal.status?.toUpperCase()}
          </Badge>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '15px',
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              FACULTY
            </strong>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
              {proposal.faculty?.name}
            </p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              DEPARTMENT
            </strong>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
              {proposal.department?.name}
            </p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              FUND CYCLE
            </strong>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
              {proposal.fundCycle?.name}
            </p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              TOTAL AMOUNT
            </strong>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--primary)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              ₹{(proposal.totalAmount / 100000).toFixed(2)}L
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>Items</h4>
        <table className='table' style={{ fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {proposal.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.itemKeyword?.name || 'Unknown'}</td>
                <td>{item.quantity}</td>
                <td>₹{(item.unitCost / 100000).toFixed(2)}L</td>
                <td>₹{(item.totalCost / 100000).toFixed(2)}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Info */}
      {proposal.status !== 'draft' && (
        <div
          style={{
            backgroundColor: 'var(--secondary)',
            padding: '15px',
            borderRadius: 'var(--radius)',
            marginBottom: '20px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
            Review Information
          </h4>
          <div>
            <strong style={{ fontSize: '0.9rem' }}>Reviewed by:</strong>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>
              {proposal.reviewedBy?.name || 'Pending'}
            </p>
          </div>
          {proposal.reviewedAt && (
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '0.9rem' }}>Reviewed on:</strong>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>
                {new Date(proposal.reviewedAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          )}
          {proposal.reviewComments && (
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '0.9rem' }}>Comments:</strong>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>
                {proposal.reviewComments}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        {proposal.status === 'draft' && (
          <Button variant='primary' onClick={onEdit}>
            ✏️ Edit Proposal
          </Button>
        )}
        <Button variant='secondary' onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ProposalDetails;
