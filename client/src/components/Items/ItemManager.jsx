import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';

const ItemManager = ({ onAddItem, onEditItem }) => {
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const items = await api.get('/api/item-keywords').then((res) => res.data);
      const cats = {};
      items.forEach((item) => {
        if (!cats[item.category]) cats[item.category] = 0;
        cats[item.category]++;
      });
      return cats;
    },
  });

  const getCategoryColor = (category) => {
    const colors = {
      equipment: '#1e7e34',
      software: '#0c5460',
      consumables: '#856404',
      furniture: '#5a4a2a',
      other: '#6c757d',
    };
    return colors[category] || '#007bff';
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

  return (
    <Card>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
        }}
      >
        {Object.entries(categories || {}).map(([category, count]) => (
          <div
            key={category}
            style={{
              padding: '15px',
              border: `2px solid ${getCategoryColor(category)}`,
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                getCategoryColor(category) + '15';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
              {getCategoryIcon(category)}
            </div>
            <div
              style={{ fontWeight: 'bold', color: getCategoryColor(category) }}
            >
              {count}
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-light)',
                textTransform: 'capitalize',
              }}
            >
              {category}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ItemManager;
