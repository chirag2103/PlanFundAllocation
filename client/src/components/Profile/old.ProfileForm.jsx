import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ProfileForm = ({ user, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onFormSubmit = (data) => {
    if (!data.name || !data.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className='form-group'>
        <label className='form-label'>Full Name *</label>
        <input
          type='text'
          className='form-control'
          placeholder='Enter your full name'
          {...register('name', { required: 'Name is required' })}
          disabled={isLoading}
        />
        {errors.name && (
          <span className='form-error'>{errors.name.message}</span>
        )}
      </div>

      <div className='form-group'>
        <label className='form-label'>Email Address *</label>
        <input
          type='email'
          className='form-control'
          placeholder='Enter your email'
          {...register('email', { required: 'Email is required' })}
          disabled={isLoading}
        />
        {errors.email && (
          <span className='form-error'>{errors.email.message}</span>
        )}
      </div>

      <div className='form-group'>
        <label className='form-label'>Role</label>
        <input
          type='text'
          className='form-control'
          value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          disabled
          style={{ backgroundColor: 'var(--secondary)', cursor: 'not-allowed' }}
        />
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-light)',
            margin: '5px 0 0 0',
          }}
        >
          Role cannot be changed here
        </p>
      </div>

      <div className='form-group'>
        <label className='form-label'>Department</label>
        <input
          type='text'
          className='form-control'
          value={user?.department?.name || 'Not Assigned'}
          disabled
          style={{ backgroundColor: 'var(--secondary)', cursor: 'not-allowed' }}
        />
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-light)',
            margin: '5px 0 0 0',
          }}
        >
          Department cannot be changed here
        </p>
      </div>

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
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
