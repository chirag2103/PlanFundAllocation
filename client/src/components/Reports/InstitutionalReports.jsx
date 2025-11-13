import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const InstitutionalReports = ({ stats, statusStats, priorityStats }) => {
  return (
    <div>
      {/* Status Distribution */}
      <Card
        title='📋 Proposal Status Distribution'
        style={{ marginBottom: '25px' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
          }}
        >
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
              {statusStats?.draft || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              Draft
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((statusStats?.draft / stats.totalProposals) * 100).toFixed(1)}%
            </div>
          </div>

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
              {statusStats?.submitted || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              Submitted
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((statusStats?.submitted / stats.totalProposals) * 100).toFixed(
                1
              )}
              %
            </div>
          </div>

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
              {statusStats?.approved || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              Approved
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((statusStats?.approved / stats.totalProposals) * 100).toFixed(
                1
              )}
              %
            </div>
          </div>

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
                color: '#dc3545',
              }}
            >
              {statusStats?.rejected || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              Rejected
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((statusStats?.rejected / stats.totalProposals) * 100).toFixed(
                1
              )}
              %
            </div>
          </div>
        </div>
      </Card>

      {/* Priority Distribution */}
      <Card title='⚡ Priority Distribution'>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
          }}
        >
          <div
            style={{
              padding: '15px',
              backgroundColor: 'var(--secondary)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              borderLeft: '4px solid #dc3545',
            }}
          >
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#dc3545',
              }}
            >
              {priorityStats?.high || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              High Priority
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((priorityStats?.high / stats.totalProposals) * 100).toFixed(1)}%
            </div>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: 'var(--secondary)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              borderLeft: '4px solid #ffc107',
            }}
          >
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#ffc107',
              }}
            >
              {priorityStats?.medium || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              Medium Priority
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((priorityStats?.medium / stats.totalProposals) * 100).toFixed(
                1
              )}
              %
            </div>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: 'var(--secondary)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              borderLeft: '4px solid #17a2b8',
            }}
          >
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#17a2b8',
              }}
            >
              {priorityStats?.low || 0}
            </div>
            <div
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginTop: '5px',
              }}
            >
              Low Priority
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginTop: '3px',
              }}
            >
              {((priorityStats?.low / stats.totalProposals) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InstitutionalReports;
