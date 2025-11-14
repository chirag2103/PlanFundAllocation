import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const ReportDisplay = ({ stats, proposals, user }) => {
  return (
    <div>
      {/* Summary Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
              {stats.allocatedBudget
                ? `₹${(stats.allocatedBudget / 100000).toFixed(2)}L`
                : '₹0L'}
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Allocated Budget
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}
            >
              ₹{(stats.totalRequested / 100000).toFixed(2)}L
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Total Requested
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
            >
              ₹{(stats.totalApproved / 100000).toFixed(2)}L
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Total Approved
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color:
                  Number(stats.utilizationRate) > 80 ? '#ff9800' : '#28a745',
              }}
            >
              {Number(stats.utilizationRate).toFixed(1)}%
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Utilization
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
              }}
            >
              {stats.totalProposals}
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Total Proposals
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: Number(stats.approvalRate) > 70 ? '#28a745' : '#ff9800',
              }}
            >
              {Number(stats.approvalRate).toFixed(1)}%
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Approval Rate
            </p>
          </div>
        </Card>
      </div>

      {/* Status & Priority Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <Card title='📋 Status Breakdown'>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>✅ Approved:</span>
              <Badge variant='success'>{stats.approvedCount}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>📤 Submitted:</span>
              <Badge variant='info'>{stats.submittedCount}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>❌ Rejected:</span>
              <Badge variant='danger'>{stats.rejectedCount}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>📝 Draft:</span>
              <Badge variant='warning'>{stats.draftCount}</Badge>
            </div>
          </div>
        </Card>

        <Card title='🎯 Priority Breakdown'>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🔴 High:</span>
              <Badge variant='danger'>{stats.byPriority.high}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🟡 Medium:</span>
              <Badge variant='warning'>{stats.byPriority.medium}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🟢 Low:</span>
              <Badge variant='info'>{stats.byPriority.low}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card title='📦 Budget by Category' style={{ marginBottom: '25px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className='table'>
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.byCategory || {}).map(
                ([category, data]) => (
                  <tr key={category}>
                    <td>
                      <strong>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </strong>
                    </td>
                    <td>{data.count}</td>
                    <td>₹{(data.requested / 100000).toFixed(2)}L</td>
                    <td>₹{(data.approved / 100000).toFixed(2)}L</td>
                    <td>
                      {data.requested > 0
                        ? Number(
                            ((data.approved / data.requested) * 100).toFixed(1)
                          )
                        : 0}
                      %
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Proposals Table with Accept/Reject Status */}
      <Card title='📋 Proposals List'>
        <div style={{ overflowX: 'auto' }}>
          <table className='table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Faculty</th>
                <th>Amount (₹L)</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {proposals?.length > 0 ? (
                proposals.map((proposal) => (
                  <tr key={proposal._id}>
                    <td style={{ fontSize: '0.9rem' }}>
                      {proposal.proposalId?.substring(0, 8) ||
                        proposal._id.substring(0, 8)}
                    </td>
                    <td>{proposal.faculty?.name || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                      ₹{(proposal.totalAmount / 100000).toFixed(2)}L
                    </td>
                    <td>
                      <Badge
                        variant={
                          proposal.status === 'approved'
                            ? 'success'
                            : proposal.status === 'rejected'
                            ? 'danger'
                            : proposal.status === 'submitted'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {proposal.status.charAt(0).toUpperCase() +
                          proposal.status.slice(1)}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        variant={
                          proposal.priority === 'high'
                            ? 'danger'
                            : proposal.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {proposal.priority.charAt(0).toUpperCase() +
                          proposal.priority.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(proposal.submittedAt).toLocaleDateString(
                        'en-IN'
                      )}
                    </td>
                    <td>
                      {proposal.status === 'approved' && (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                          ✅ Accepted
                        </span>
                      )}
                      {proposal.status === 'rejected' && (
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                          ❌ Rejected
                        </span>
                      )}
                      {proposal.status === 'submitted' && (
                        <span style={{ color: '#ffc107', fontWeight: 'bold' }}>
                          ⏳ Pending
                        </span>
                      )}
                      {proposal.status === 'draft' && (
                        <span style={{ color: '#6c757d', fontWeight: 'bold' }}>
                          📝 Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='7'
                    style={{ textAlign: 'center', color: 'var(--text-light)' }}
                  >
                    No proposals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportDisplay;
