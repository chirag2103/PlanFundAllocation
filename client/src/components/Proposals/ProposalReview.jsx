import React, { useState } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const ProposalReview = ({
  proposal,
  onApprove,
  onReject,
  onCancel,
  isLoading,
}) => {
  const [comments, setComments] = useState('');

  const handleApprove = () => {
    onApprove(comments);
  };

  const handleReject = () => {
    onReject(comments);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
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
        </div>

        <div>
          <strong style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            TOTAL AMOUNT
          </strong>
          <p
            style={{
              margin: '5px 0 0 0',
              color: 'var(--primary)',
              fontSize: '1.3rem',
              fontWeight: 'bold',
            }}
          >
            ₹{(proposal.totalAmount / 100000).toFixed(2)}L
          </p>
        </div>
      </div>

      {/* Items Summary */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text)' }}>
          Items to Review
        </h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {proposal.items?.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
                marginBottom: '8px',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{item.itemKeyword?.name || 'Item'}</strong>
                <span>₹{(item.totalCost / 100000).toFixed(2)}L</span>
              </div>
              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.85rem',
                  marginTop: '5px',
                }}
              >
                Qty: {item.quantity} × ₹{(item.unitCost / 100000).toFixed(2)}L
                per unit
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className='form-group'>
        <label className='form-label'>Review Comments (Optional)</label>
        <textarea
          className='form-control'
          placeholder='Add your review comments...'
          rows='4'
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Decision Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '20px',
        }}
      >
        <Button variant='secondary' onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant='danger' onClick={handleReject} loading={isLoading}>
          ❌ Reject
        </Button>
        <Button variant='success' onClick={handleApprove} loading={isLoading}>
          ✅ Approve
        </Button>
      </div>
    </div>
  );
};

export default ProposalReview;
