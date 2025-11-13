import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const ItemList = ({ items, isLoading, onEdit, onDelete, isDeleting }) => {
  const getCategoryColor = (category) => {
    const colors = {
      equipment: 'success',
      software: 'info',
      consumables: 'warning',
      furniture: 'primary',
      other: 'secondary',
    };
    return colors[category] || 'primary';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      equipment: '🖥️',
      software: '💾',
      consumables: '📦',
      furniture: '🪑',
      other: '📋',
    };
    return icons[category] || '📌';
  };

  if (isLoading) {
    return (
      <Card title='Item Keywords'>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div className='spinner'></div>
          <p>Loading items...</p>
        </div>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card title='Item Keywords'>
        <div
          style={{
            textAlign: 'center',
            padding: '30px',
            color: 'var(--text-light)',
          }}
        >
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            📋 No items found
          </p>
          <p>Create your first item keyword to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className='item-list-container'>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '15px',
        }}
      >
        {items.map((item) => (
          <Card key={item._id} className='item-card'>
            <div
              style={{
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
              }}
            >
              <div>
                <div style={{ fontSize: '1.5rem' }}>
                  {getCategoryIcon(item.category)}
                </div>
                <h3 style={{ margin: '10px 0 5px 0', color: 'var(--text)' }}>
                  {item.name}
                </h3>
              </div>
              <Badge variant={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
            </div>

            <p
              style={{
                color: 'var(--text-light)',
                fontSize: '0.9rem',
                marginBottom: '15px',
                minHeight: '40px',
              }}
            >
              {item.description}
            </p>

            {/* Department Info */}
            {item.department && (
              <div
                style={{
                  backgroundColor: 'var(--secondary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  marginBottom: '15px',
                  fontSize: '0.85rem',
                }}
              >
                <strong>Department:</strong> {item.department.name}
              </div>
            )}

            {/* Cost Range */}
            {item.estimatedCost && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 'var(--radius)',
                  marginBottom: '15px',
                  borderLeft: `4px solid var(--primary)`,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}
                  >
                    Estimated Cost Range
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: 'var(--primary)',
                    }}
                  >
                    ₹{(item.estimatedCost.min / 100000).toFixed(2)}L - ₹
                    {(item.estimatedCost.max / 100000).toFixed(2)}L
                  </div>
                </div>
              </div>
            )}

            {/* Created Info */}
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>Created by: {item.createdBy?.name || 'System'}</div>
              <div>
                Created on:{' '}
                {new Date(item.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                variant='secondary'
                size='small'
                onClick={() => onEdit(item)}
                style={{ flex: 1 }}
              >
                ✏️ Edit
              </Button>
              <Button
                variant='danger'
                size='small'
                onClick={() => onDelete(item._id)}
                loading={isDeleting}
                style={{ flex: 1 }}
              >
                🗑️ Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ItemList;
