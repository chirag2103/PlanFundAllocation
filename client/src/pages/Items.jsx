import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ItemList from '../components/Items/ItemList';
import ItemForm from '../components/Items/ItemForm';
import toast from 'react-hot-toast';

const Items = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments-for-items'],
    queryFn: () => api.get('/api/departments').then((res) => res.data),
  });

  // Fetch items
  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['item-keywords', filterCategory, filterDepartment, searchQuery],
    queryFn: () => {
      let url = '/api/item-keywords';
      const params = new URLSearchParams();

      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterDepartment !== 'all') {
        params.append('department', filterDepartment);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      return api.get(url).then((res) => res.data);
    },
  });

  // Get item statistics
  const { data: stats } = useQuery({
    queryKey: ['item-stats'],
    queryFn: async () => {
      const allItems = await api
        .get('/api/item-keywords')
        .then((res) => res.data);
      return {
        total: allItems.length,
        equipment: allItems.filter((i) => i.category === 'equipment').length,
        software: allItems.filter((i) => i.category === 'software').length,
        consumables: allItems.filter((i) => i.category === 'consumables')
          .length,
        furniture: allItems.filter((i) => i.category === 'furniture').length,
        other: allItems.filter((i) => i.category === 'other').length,
      };
    },
  });

  // Delete item
  const deleteMutation = useMutation({
    mutationFn: (itemId) => api.delete(`/api/item-keywords/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-keywords'] });
      queryClient.invalidateQueries({ queryKey: ['item-stats'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete item');
    },
  });

  // Save item
  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingItem
        ? api.put(`/api/item-keywords/${editingItem._id}`, data)
        : api.post('/api/item-keywords', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-keywords'] });
      queryClient.invalidateQueries({ queryKey: ['item-stats'] });
      toast.success(
        editingItem ? 'Item updated successfully' : 'Item created successfully'
      );
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save item');
    },
  });

  const handleCreateNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (itemId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this item? This cannot be undone.'
      )
    ) {
      deleteMutation.mutate(itemId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (data) => {
    saveMutation.mutate(data);
  };

  if (error) {
    return (
      <div className='error-container'>
        <Card title='Error'>
          <p style={{ color: 'var(--danger)' }}>
            {error.message || 'Failed to load items'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className='items-page'>
      <div className='page-title'>
        <h2>Item Keywords Management</h2>
        <Button
          variant='primary'
          onClick={handleCreateNew}
          disabled={saveMutation.isPending}
        >
          + Add New Item
        </Button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
              {stats?.total || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Total Items
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e7e34' }}
            >
              {stats?.equipment || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Equipment
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c5460' }}
            >
              {stats?.software || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Software
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}
            >
              {stats?.consumables || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Consumables
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6c757d' }}
            >
              {stats?.furniture || 0}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Furniture
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card style={{ marginBottom: '25px' }}>
        <div
          style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type='text'
              placeholder='Search items by name or description...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='form-control'
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px',
          }}
        >
          <Button
            variant={filterCategory === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterCategory('all')}
            size='small'
          >
            All ({stats?.total || 0})
          </Button>
          <Button
            variant={filterCategory === 'equipment' ? 'primary' : 'secondary'}
            onClick={() => setFilterCategory('equipment')}
            size='small'
          >
            Equipment ({stats?.equipment || 0})
          </Button>
          <Button
            variant={filterCategory === 'software' ? 'primary' : 'secondary'}
            onClick={() => setFilterCategory('software')}
            size='small'
          >
            Software ({stats?.software || 0})
          </Button>
          <Button
            variant={filterCategory === 'consumables' ? 'primary' : 'secondary'}
            onClick={() => setFilterCategory('consumables')}
            size='small'
          >
            Consumables ({stats?.consumables || 0})
          </Button>
          <Button
            variant={filterCategory === 'furniture' ? 'primary' : 'secondary'}
            onClick={() => setFilterCategory('furniture')}
            size='small'
          >
            Furniture ({stats?.furniture || 0})
          </Button>
          <Button
            variant={filterCategory === 'other' ? 'primary' : 'secondary'}
            onClick={() => setFilterCategory('other')}
            size='small'
          >
            Other ({stats?.other || 0})
          </Button>
        </div>

        {/* NEW: Department Filter */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px',
          }}
        >
          <span
            style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}
          >
            Filter by Department:
          </span>
          <Button
            variant={filterDepartment === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterDepartment('all')}
            size='small'
          >
            All Departments
          </Button>
          {departments?.map((dept) => (
            <Button
              key={dept._id}
              variant={filterDepartment === dept._id ? 'primary' : 'secondary'}
              onClick={() => setFilterDepartment(dept._id)}
              size='small'
            >
              {dept.code}
            </Button>
          ))}
        </div>
      </Card>

      {/* Items List */}
      <ItemList
        items={items}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingItem ? 'Edit Item Keyword' : 'Add New Item Keyword'}
        size='medium'
      >
        <ItemForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={saveMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Items;
