import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const DepartmentReportTable = ({ reportData, reportType }) => {
  if (!reportData) {
    return <Card title='No Data'>No report data available</Card>;
  }

  const { overview, utilization, approval, pending } = reportData;

  return (
    <div>
      {/* Overview Report */}
      {reportType === 'overview' && (
        <>
          <Card title='📊 Overview'>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                  Total Proposals
                </p>
                <p
                  style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                  {overview.totalProposals}
                </p>
              </div>

              <div
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                  Total Requested
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--primary)',
                  }}
                >
                  ₹{(overview.totalRequested / 100000).toFixed(2)}L
                </p>
              </div>

              <div
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                  Total Approved
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#28a745',
                  }}
                >
                  ₹{(overview.totalApproved / 100000).toFixed(2)}L
                </p>
              </div>

              <div
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                  Approval Rate
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: overview.approvalRate > 80 ? '#ff9800' : '#28a745',
                  }}
                >
                  {overview.approvalRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>
              By Status
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table className='table'>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(overview.byStatus || {}).map(
                    ([status, count]) => (
                      <tr key={status}>
                        <td>
                          <Badge
                            variant={
                              status === 'approved'
                                ? 'success'
                                : status === 'rejected'
                                ? 'danger'
                                : 'info'
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </td>
                        <td>{count}</td>
                        <td>
                          {(
                            ((count || 0) / overview.totalProposals) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Utilization Report */}
      {reportType === 'utilization' && (
        <Card title='💰 Budget Utilization'>
          <div style={{ overflowX: 'auto' }}>
            <table className='table'>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Allocated</th>
                  <th>Requested</th>
                  <th>Approved</th>
                  <th>Remaining</th>
                  <th>Utilization %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(utilization.byCategory || {}).map(
                  ([category, data]) => (
                    <tr key={category}>
                      <td>
                        <strong>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </strong>
                      </td>
                      <td>₹{(data.allocated / 100000).toFixed(2)}L</td>
                      <td>₹{(data.requested / 100000).toFixed(2)}L</td>
                      <td>₹{(data.approved / 100000).toFixed(2)}L</td>
                      <td>
                        ₹
                        {((data.allocated - data.approved) / 100000).toFixed(2)}
                        L
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: '#e0e0e0',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(
                                  data.utilizationRate,
                                  100
                                )}%`,
                                backgroundColor:
                                  data.utilizationRate > 80
                                    ? '#ff9800'
                                    : '#28a745',
                              }}
                            ></div>
                          </div>
                          <span
                            style={{ fontSize: '0.85rem', fontWeight: '600' }}
                          >
                            {data.utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Approval Report */}
      {reportType === 'approval' && (
        <Card title='✅ Approval Analysis'>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                Approved Count
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#28a745',
                }}
              >
                {approval.approved}
              </p>
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                Rejected Count
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#dc3545',
                }}
              >
                {approval.rejected}
              </p>
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                Approval Rate
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: approval.approvalRate > 70 ? '#28a745' : '#ff9800',
                }}
              >
                {approval.approvalRate.toFixed(1)}%
              </p>
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <p style={{ margin: '0 0 5px 0', color: 'var(--text-light)' }}>
                Avg Request Amount
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--primary)',
                }}
              >
                ₹{(approval.avgRequestAmount / 100000).toFixed(2)}L
              </p>
            </div>
          </div>

          <h4 style={{ marginBottom: '15px' }}>Approval by Category</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className='table'>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Approved</th>
                  <th>Rejected</th>
                  <th>Pending</th>
                  <th>Approval %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(approval.byCategory || {}).map(
                  ([category, data]) => (
                    <tr key={category}>
                      <td>
                        <strong>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </strong>
                      </td>
                      <td>{data.approved}</td>
                      <td>{data.rejected}</td>
                      <td>{data.pending}</td>
                      <td>
                        {(
                          (data.approved /
                            (data.approved + data.rejected + data.pending)) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pending Requests Report */}
      {reportType === 'pending' && (
        <Card title='⏳ Pending Requests'>
          <div style={{ overflowX: 'auto' }}>
            <table className='table'>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Proposal ID</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Days Pending</th>
                </tr>
              </thead>
              <tbody>
                {pending.proposals?.length > 0 ? (
                  pending.proposals.map((proposal) => (
                    <tr key={proposal._id}>
                      <td>{proposal.faculty?.name}</td>
                      <td>{proposal.proposalId}</td>
                      <td>₹{(proposal.totalAmount / 100000).toFixed(2)}L</td>
                      <td>{proposal.items?.itemKeyword?.category}</td>
                      <td>
                        {new Date(proposal.submittedAt).toLocaleDateString(
                          'en-IN'
                        )}
                      </td>
                      <td>
                        <Badge
                          variant={
                            pending.daysPending > 30
                              ? 'danger'
                              : pending.daysPending > 14
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {pending.daysPending} days
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='6' style={{ textAlign: 'center' }}>
                      No pending proposals
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DepartmentReportTable;
