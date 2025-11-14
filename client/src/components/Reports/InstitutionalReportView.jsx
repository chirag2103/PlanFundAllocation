import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const InstitutionalReportView = ({ stats }) => {
  const sortedDepts = Object.values(stats.departmentStats || {}).sort(
    (a, b) => b.totalApproved - a.totalApproved
  );

  return (
    <div>
      {/* Overall Summary */}
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
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
              }}
            >
              {stats.year}
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Academic Year
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
              }}
            >
              ₹{(stats.totalAllocatedBudgetForYear / 100000).toFixed(2)}L
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Total Allocated Budget
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
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
            >
              {stats.totalApproved}
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
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}
            >
              {stats.totalRejected}
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Total Rejected
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#ff9800',
              }}
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
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#28a745',
              }}
            >
              ₹{(stats.totalApprovedAmount / 100000).toFixed(2)}L
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Total Approved Amount
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
                  Number(stats.overallApprovalRate) > 70
                    ? '#28a745'
                    : '#ff9800',
              }}
            >
              {Number(stats.overallApprovalRate).toFixed(1)}%
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Overall Approval Rate
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
                  Number(stats.overallUtilizationRate) > 80
                    ? '#ff9800'
                    : '#28a745',
              }}
            >
              {Number(stats.overallUtilizationRate).toFixed(1)}%
            </div>
            <p
              style={{
                margin: '5px 0 0 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              Overall Utilization Rate
            </p>
          </div>
        </Card>
      </div>

      {/* Department-wise Allocation Table */}
      <Card
        title='🏢 Department-wise Budget Allocation'
        style={{ marginBottom: '25px' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className='table'>
            <thead>
              <tr>
                <th>Department</th>
                <th>Code</th>
                <th>Total</th>
                <th>✅ Approved</th>
                <th>❌ Rejected</th>
                <th>Allocated (₹L)</th>
                <th>Requested (₹L)</th>
                <th>Approved (₹L)</th>
                <th>Utilization %</th>
                <th>Approval %</th>
              </tr>
            </thead>
            <tbody>
              {sortedDepts.map((dept) => (
                <tr key={dept.code}>
                  <td>
                    <strong>{dept.name}</strong>
                  </td>
                  <td>{dept.code}</td>
                  <td>{dept.totalProposals}</td>
                  <td>
                    <Badge variant='success'>{dept.approvedProposals}</Badge>
                  </td>
                  <td>
                    <Badge variant='danger'>{dept.totalRejected}</Badge>
                  </td>
                  <td>₹{((dept.allocatedBudget || 0) / 100000).toFixed(1)}L</td>
                  <td>₹{((dept.totalRequested || 0) / 100000).toFixed(1)}L</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    ₹{((dept.totalApproved || 0) / 100000).toFixed(1)}L
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
                              Number(dept.utilizationRate || 0),
                              100
                            )}%`,
                            backgroundColor:
                              Number(dept.utilizationRate || 0) > 80
                                ? '#ff9800'
                                : '#28a745',
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        {Number(dept.utilizationRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        color:
                          Number(dept.approvalRate || 0) > 70
                            ? '#28a745'
                            : '#ff9800',
                        fontWeight: '600',
                      }}
                    >
                      {Number(dept.approvalRate || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* All Proposals in Year */}
      <Card title='📋 All Proposals in Academic Year'>
        <div style={{ overflowX: 'auto' }}>
          <table className='table'>
            <thead>
              <tr>
                <th>Department</th>
                <th>Faculty</th>
                <th>Proposal ID</th>
                <th>Amount (₹L)</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Fund Cycle</th>
                <th>Submitted</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {stats.proposals?.length > 0 ? (
                stats.proposals.map((proposal) => (
                  <tr key={proposal._id}>
                    <td style={{ fontSize: '0.9rem' }}>
                      {proposal.department?.name || 'N/A'}
                    </td>
                    <td>{proposal.faculty?.name || 'N/A'}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {proposal.proposalId?.substring(0, 8) ||
                        proposal._id.substring(0, 8)}
                    </td>
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
                        {proposal.status.substring(0, 3).toUpperCase()}
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
                        {proposal.priority.substring(0, 3).toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {proposal.fundCycle?.name || 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(
                        proposal.submittedAt
                          ? proposal.submittedAt
                          : proposal.updatedAt
                      ).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {proposal.status === 'approved' && (
                        <span style={{ color: '#28a745' }}>✅ ACCEPTED</span>
                      )}
                      {proposal.status === 'rejected' && (
                        <span style={{ color: '#dc3545' }}>❌ REJECTED</span>
                      )}
                      {proposal.status === 'submitted' && (
                        <span style={{ color: '#ffc107' }}>⏳ PENDING</span>
                      )}
                      {proposal.status === 'draft' && (
                        <span style={{ color: '#6c757d' }}>📝 DRAFT</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='9'
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

      {/* Department Breakdown Cards */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--text)' }}>
          📊 Department Details
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '15px',
          }}
        >
          {sortedDepts.map((dept) => (
            <Card key={dept.code}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--text)' }}>
                {dept.name}
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-light)',
                    marginLeft: '8px',
                  }}
                >
                  ({dept.code})
                </span>
              </h4>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.9rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>Total Proposals:</span>
                  <strong>{dept.totalProposals}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>✅ Approved:</span>
                  <strong style={{ color: '#28a745' }}>
                    {dept.approvedProposals}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>❌ Rejected:</span>
                  <strong style={{ color: '#dc3545' }}>
                    {dept.totalRejected}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>Allocated (₹L):</span>
                  <strong>
                    ₹{((dept.allocatedBudget || 0) / 100000).toFixed(2)}L
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>Requested (₹L):</span>
                  <strong>
                    ₹{((dept.totalRequested || 0) / 100000).toFixed(2)}L
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span>Approved (₹L):</span>
                  <strong style={{ color: 'var(--primary)' }}>
                    ₹{((dept.totalApproved || 0) / 100000).toFixed(2)}L
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                    marginTop: '5px',
                  }}
                >
                  <span>Approval Rate:</span>
                  <strong
                    style={{
                      color:
                        Number(dept.approvalRate || 0) > 70
                          ? '#28a745'
                          : '#ff9800',
                    }}
                  >
                    {Number(dept.approvalRate || 0).toFixed(1)}%
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <span>Utilization Rate:</span>
                  <strong
                    style={{
                      color:
                        Number(dept.utilizationRate || 0) > 80
                          ? '#ff9800'
                          : '#28a745',
                    }}
                  >
                    {Number(dept.utilizationRate || 0).toFixed(1)}%
                  </strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstitutionalReportView;
