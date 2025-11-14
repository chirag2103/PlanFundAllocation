import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?._id],
    queryFn: async () => {
      if (!user) return null;

      if (user.role === 'faculty') {
        const proposals = await api
          .get('/api/proposals')
          .then((res) => res.data);
        return {
          totalProposals: proposals.proposals?.length || 0,
          approvedProposals:
            proposals.proposals?.filter((p) => p.status === 'approved')
              .length || 0,
          pendingProposals:
            proposals.proposals?.filter((p) => p.status === 'submitted')
              .length || 0,
          rejectedProposals:
            proposals.proposals?.filter((p) => p.status === 'rejected')
              .length || 0,
          draftProposals:
            proposals.proposals?.filter((p) => p.status === 'draft').length ||
            0,
        };
      } else if (user.role === 'coordinator') {
        const proposals = await api
          .get('/api/proposals')
          .then((res) => res.data);
        return {
          totalProposalsReviewed:
            proposals.proposals?.filter((p) => p.reviewedBy === user._id)
              .length || 0,
          pendingReview:
            proposals.proposals?.filter((p) => p.status === 'submitted')
              .length || 0,
          approvedProposals:
            proposals.proposals?.filter((p) => p.status === 'approved')
              .length || 0,
          rejectedProposals:
            proposals.proposals?.filter((p) => p.status === 'rejected')
              .length || 0,
        };
      } else if (user.role === 'admin') {
        const users = await api.get('/api/users').then((res) => res.data);
        const keywords = await api
          .get('/api/item-keywords')
          .then((res) => res.data);
        return {
          totalUsers: users.total || 0,
          totalItems: keywords?.length || 0,
          activeUsers: users.users?.filter((u) => u.isActive).length || 0,
        };
      }
      return null;
    },
  });

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'faculty':
        return 'primary';
      case 'coordinator':
        return 'success';
      case 'admin':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'faculty':
        return '👨‍🏫';
      case 'coordinator':
        return '👔';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  return (
    <div className='profile-page'>
      <div className='page-title'>
        <h2>My Profile</h2>
        <p>Manage your account information</p>
      </div>

      {/* Profile Header Card */}
      <Card style={{ marginBottom: '25px' }}>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              boxShadow: 'var(--shadow)',
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              getRoleIcon(user?.role)
            )}
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <h3 style={{ margin: 0, color: 'var(--text)' }}>{user?.name}</h3>
              <Badge variant={getRoleColor(user?.role)}>
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <p style={{ margin: '5px 0', color: 'var(--text-light)' }}>
              📧 {user?.email}
            </p>
            <p style={{ margin: '5px 0', color: 'var(--text-light)' }}>
              🏢 {user?.department?.name || 'No Department'}
            </p>
            <p
              style={{
                margin: '5px 0',
                color: 'var(--text-light)',
                fontSize: '0.9rem',
              }}
            >
              ⏰ Joined: {new Date(user?.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          {/* Logout Button */}
          <Button variant='danger' onClick={handleLogout}>
            🚪 Logout
          </Button>
        </div>
      </Card>

      {/* Account Information */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '25px',
        }}
      >
        <Card title='📋 Account Information'>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                FULL NAME
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                {user?.name}
              </p>
            </div>
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                EMAIL ADDRESS
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                {user?.email}
              </p>
            </div>
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                ROLE
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                <Badge variant={getRoleColor(user?.role)}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>
              </p>
            </div>
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                STATUS
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                <Badge variant={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
          </div>
        </Card>

        <Card title='🏢 Department Information'>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                DEPARTMENT NAME
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                {user?.department?.name || 'Not Assigned'}
              </p>
            </div>
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                DEPARTMENT CODE
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                {user?.department?.code || 'N/A'}
              </p>
            </div>
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                DEPARTMENT BUDGET
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                {user?.department?.budget
                  ? `₹${(user.department.budget / 100000).toFixed(2)}L`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label
                style={{
                  fontWeight: '600',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                }}
              >
                DEPARTMENT STATUS
              </label>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text)' }}>
                <Badge
                  variant={user?.department?.isActive ? 'success' : 'danger'}
                >
                  {user?.department?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Role-Specific Statistics */}
      {userStats && (
        <Card
          title={
            user?.role === 'faculty'
              ? '📊 My Proposals Statistics'
              : user?.role === 'coordinator'
              ? '📊 Review Statistics'
              : '📊 System Statistics'
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '15px',
            }}
          >
            {user?.role === 'faculty' ? (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'var(--primary)',
                    }}
                  >
                    {userStats.totalProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Total Proposals
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#28a745',
                    }}
                  >
                    {userStats.approvedProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Approved
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#ffc107',
                    }}
                  >
                    {userStats.pendingProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Pending
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#dc3545',
                    }}
                  >
                    {userStats.rejectedProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Rejected
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#17a2b8',
                    }}
                  >
                    {userStats.draftProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Draft
                  </div>
                </div>
              </>
            ) : user?.role === 'coordinator' ? (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'var(--primary)',
                    }}
                  >
                    {userStats.totalProposalsReviewed}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Reviewed
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#ffc107',
                    }}
                  >
                    {userStats.pendingReview}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Pending Review
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#28a745',
                    }}
                  >
                    {userStats.approvedProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Approved
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#dc3545',
                    }}
                  >
                    {userStats.rejectedProposals}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Rejected
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'var(--primary)',
                    }}
                  >
                    {userStats.totalUsers}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Total Users
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#28a745',
                    }}
                  >
                    {userStats.activeUsers}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Active Users
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'var(--info)',
                    }}
                  >
                    {userStats.totalItems}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      marginTop: '5px',
                    }}
                  >
                    Total Items
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Profile;
