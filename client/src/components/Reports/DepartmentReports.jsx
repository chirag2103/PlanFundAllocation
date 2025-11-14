import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const DepartmentReports = ({ stats, departments, currentDepartment }) => {
  // Filter stats based on department access
  let displayStats = stats;

  // If coordinator, show only their department
  if (currentDepartment) {
    displayStats = Object.keys(stats || {})
      .filter((key) => {
        const dept = departments.find((d) => d._id === key);
        return dept && dept._id === currentDepartment;
      })
      .reduce((result, key) => {
        result[key] = stats[key];
        return result;
      }, {});
  }

  const sortedStats = Object.values(displayStats || {}).sort(
    (a, b) => (b.totalApproved || 0) - (a.totalApproved || 0)
  );

  if (!sortedStats || sortedStats.length === 0) {
    return (
      <Card title='Department Reports'>
        <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>
          No data available
        </p>
      </Card>
    );
  }

  return (
    <div>
      <Card title='📊 Department-wise Budget Allocation'>
        <div style={{ overflowX: 'auto' }}>
          <table className='table'>
            <thead>
              <tr>
                <th>Department</th>
                <th>Code</th>
                <th>Proposals</th>
                <th>Approved</th>
                <th>Budget Alloc.</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((dept) => (
                <tr key={dept.code}>
                  <td>
                    <strong>{dept.name}</strong>
                  </td>
                  <td>{dept.code}</td>
                  <td>{dept.totalProposals}</td>
                  <td>
                    <Badge
                      variant={
                        dept.approvedProposals > 0 ? 'success' : 'warning'
                      }
                    >
                      {dept.approvedProposals}
                    </Badge>
                  </td>
                  <td>₹{((dept.budget || 0) / 100000).toFixed(2)}L</td>
                  <td>₹{((dept.totalRequested || 0) / 100000).toFixed(2)}L</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    ₹{((dept.totalApproved || 0) / 100000).toFixed(2)}L
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Department Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px',
          marginTop: '25px',
        }}
      >
        {sortedStats.map((dept) => (
          <Card key={dept.code}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text)' }}>
              {dept.name}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                ({dept.code})
              </span>
            </h4>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
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
                <span>Approved:</span>
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
                <span>Budget Allocated:</span>
                <strong>₹{((dept.budget || 0) / 100000).toFixed(2)}L</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span>Budget Requested:</span>
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
                <span>Budget Approved:</span>
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
  );
};

export default DepartmentReports;
