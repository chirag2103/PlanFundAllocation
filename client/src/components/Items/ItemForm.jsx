import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ItemForm = ({ item, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: item
      ? {
          name: item.name,
          category: item.category,
          description: item.description,
        }
      : {
          name: '',
          category: 'equipment',
          description: '',
        },
  });

  const onFormSubmit = (data) => {
    if (!data.name) {
      toast.error('Item name is required');
      return;
    }

    onSubmit({
      name: data.name,
      category: data.category,
      description: data.description,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className='form-group'>
        <label className='form-label'>Item Name *</label>
        <input
          type='text'
          className='form-control'
          placeholder='e.g., Laptop, Server, Lab Chemical'
          {...register('name', { required: 'Item name is required' })}
        />
        {errors.name && (
          <span className='form-error'>{errors.name.message}</span>
        )}
      </div>

      <div className='form-group'>
        <label className='form-label'>Category *</label>
        <select
          className='form-control'
          {...register('category', { required: 'Category is required' })}
        >
          <option value='equipment'>🖥️ Equipment</option>
          <option value='software'>💾 Software</option>
          <option value='consumables'>📦 Consumables</option>
          <option value='furniture'>🪑 Furniture</option>
          <option value='other'>📋 Other</option>
        </select>
        {errors.category && (
          <span className='form-error'>{errors.category.message}</span>
        )}
      </div>

      <div className='form-group'>
        <label className='form-label'>Description</label>
        <textarea
          className='form-control'
          placeholder='Describe this item keyword...'
          rows='3'
          {...register('description')}
        />
      </div>

      {/* Form Actions */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '20px',
        }}
      >
        <Button variant='secondary' onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant='primary' type='submit' loading={isLoading}>
          {isLoading ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;
