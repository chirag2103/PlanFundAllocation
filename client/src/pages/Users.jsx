import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', searchQuery, filterRole],
    queryFn: () =>
      api
        .get('/api/users', {
          params: {
            search: searchQuery,
            role: filterRole !== 'all' ? filterRole : undefined,
          },
        })
        .then((res) => res.data),
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments-for-users'],
    queryFn: () => api.get('/api/departments').then((res) => res.data),
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data) =>
      api.patch(`/api/users/${data.userId}/role`, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update role');
    },
  });

  // Update department mutation
  const updateDeptMutation = useMutation({
    mutationFn: (data) =>
      api.patch(`/api/users/${data.userId}/department`, {
        department: data.department,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User department updated successfully');
      setShowDeptModal(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update department');
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: (userId) => api.patch(`/api/users/${userId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to deactivate user');
    },
  });

  const handleUpdateRole = () => {
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    updateRoleMutation.mutate({ userId: selectedUser._id, role: newRole });
  };

  const handleUpdateDept = () => {
    if (!newDept) {
      toast.error('Please select a department');
      return;
    }
    updateDeptMutation.mutate({
      userId: selectedUser._id,
      department: newDept,
    });
  };

  const handleDeactivate = (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      deactivateMutation.mutate(userId);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'faculty':
        return 'info';
      case 'coordinator':
        return 'success';
      case 'admin':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'faculty':
        return '👨‍🎓';
      case 'coordinator':
        return '👔';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  // Only admin can access this page
  if (currentUser?.role !== 'admin') {
    return (
      <Card title='Access Denied'>
        <p style={{ color: 'var(--danger)' }}>
          Only administrators can manage users.
        </p>
      </Card>
    );
  }

  const users = usersData?.users || [];
  const total = usersData?.total || 0;

  return (
    <div className='users-page'>
      <div className='page-title'>
        <h2>👥 User Management</h2>
      </div>

      {/* Search and Filter */}
      <Card title='🔍 Search & Filter' style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '15px',
          }}
        >
          <div>
            <label
              style={{
                fontWeight: '600',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              Search by Name or Email
            </label>
            <input
              type='text'
              className='form-control'
              placeholder='Search users...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                fontWeight: '600',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              Filter by Role
            </label>
            <select
              className='form-control'
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value='all'>All Roles</option>
              <option value='faculty'>Faculty</option>
              <option value='coordinator'>Coordinator</option>
              <option value='admin'>Admin</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card title={`📊 Users (${total})`}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className='spinner'></div>
            <p style={{ marginTop: '15px', color: 'var(--text-light)' }}>
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px',
              color: 'var(--text-light)',
            }}
          >
            <p>📭 No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className='table'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    {/* Name */}
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        {u.avatar && (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                        <strong>{u.name}</strong>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}
                    >
                      {u.email}
                    </td>

                    {/* Role */}
                    <td>
                      <Badge variant={getRoleColor(u.role)}>
                        {getRoleIcon(u.role)} {u.role.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Department */}
                    <td>
                      <div>
                        <strong>{u.department?.name}</strong>
                        <br />
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-light)',
                          }}
                        >
                          {u.department?.code}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    {/* Last Login */}
                    <td
                      style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}
                    >
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString('en-IN')
                        : 'Never'}
                    </td>

                    {/* Actions */}
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Button
                          variant='secondary'
                          size='small'
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                            setShowRoleModal(true);
                          }}
                        >
                          Change Role
                        </Button>

                        <Button
                          variant='secondary'
                          size='small'
                          onClick={() => {
                            setSelectedUser(u);
                            setNewDept(u.department?._id);
                            setShowDeptModal(true);
                          }}
                        >
                          Change Dept
                        </Button>

                        {u.isActive && (
                          <Button
                            variant='danger'
                            size='small'
                            onClick={() => handleDeactivate(u._id)}
                            loading={deactivateMutation.isPending}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title='Change User Role'
        size='small'
      >
        {selectedUser && (
          <div>
            <div
              style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '0.9rem',
                  color: 'var(--text-light)',
                }}
              >
                Current Role:
              </p>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {getRoleIcon(selectedUser.role)}{' '}
                {selectedUser.role.toUpperCase()}
              </p>
            </div>

            <div className='form-group'>
              <label className='form-label'>Select New Role *</label>
              <select
                className='form-control'
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value=''>-- Select Role --</option>
                <option value='faculty'>👨‍🎓 Faculty</option>
                <option value='coordinator'>👔 Coordinator</option>
                <option value='admin'>⚙️ Admin</option>
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                marginTop: '20px',
              }}
            >
              <Button
                variant='secondary'
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={handleUpdateRole}
                loading={updateRoleMutation.isPending}
              >
                Update Role
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Department Modal */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => {
          setShowDeptModal(false);
          setSelectedUser(null);
        }}
        title='Change User Department'
        size='small'
      >
        {selectedUser && (
          <div>
            <div
              style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius)',
              }}
            >
              <p
                style={{
                  margin: '0 0 5px 0',
                  fontSize: '0.9rem',
                  color: 'var(--text-light)',
                }}
              >
                Current Department:
              </p>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {selectedUser.department?.name} ({selectedUser.department?.code}
                )
              </p>
            </div>

            <div className='form-group'>
              <label className='form-label'>Select New Department *</label>
              <select
                className='form-control'
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
              >
                <option value=''>-- Select Department --</option>
                {departments?.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                marginTop: '20px',
              }}
            >
              <Button
                variant='secondary'
                onClick={() => {
                  setShowDeptModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={handleUpdateDept}
                loading={updateDeptMutation.isPending}
              >
                Update Department
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
