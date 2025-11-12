import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CycleForm = ({ cycle, onSubmit, onCancel, isLoading }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: cycle
      ? {
          name: cycle.name,
          academicYear: cycle.academicYear,
          startDate: new Date(cycle.startDate),
          endDate: new Date(cycle.endDate),
          allocatedBudget: cycle.allocatedBudget || 0,
          description: cycle.description,
        }
      : {
          name: '',
          academicYear: '',
          startDate: new Date(),
          endDate: new Date(),
          allocatedBudget: 0,
          description: '',
        },
  });

  const allocatedBudget = watch('allocatedBudget');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate cycle duration
  const getDurationDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const onFormSubmit = (data) => {
    // Validate dates
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    if (data.allocatedBudget <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    onSubmit({
      name: data.name,
      academicYear: data.academicYear,
      startDate: data.startDate,
      endDate: data.endDate,
      allocatedBudget: parseFloat(data.allocatedBudget) || 0,
      description: data.description,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Cycle Name */}
      <div className='form-group'>
        <label className='form-label'>Cycle Name *</label>
        <input
          type='text'
          className='form-control'
          placeholder='e.g., Fund Cycle 2024-25'
          {...register('name', { required: 'Cycle name is required' })}
        />
        {errors.name && (
          <span className='form-error'>{errors.name.message}</span>
        )}
      </div>

      {/* Academic Year */}
      <div className='form-group'>
        <label className='form-label'>Academic Year *</label>
        <input
          type='text'
          className='form-control'
          placeholder='e.g., 2024-2025'
          {...register('academicYear', {
            required: 'Academic year is required',
          })}
        />
        {errors.academicYear && (
          <span className='form-error'>{errors.academicYear.message}</span>
        )}
      </div>

      {/* Start and End Dates */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}
      >
        <div className='form-group'>
          <label className='form-label'>Start Date *</label>
          <Controller
            control={control}
            name='startDate'
            rules={{ required: 'Start date is required' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat='yyyy-MM-dd'
                className='form-control'
                minDate={new Date()}
              />
            )}
          />
          {errors.startDate && (
            <span className='form-error'>{errors.startDate.message}</span>
          )}
        </div>

        <div className='form-group'>
          <label className='form-label'>End Date *</label>
          <Controller
            control={control}
            name='endDate'
            rules={{ required: 'End date is required' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat='yyyy-MM-dd'
                className='form-control'
                minDate={startDate || new Date()}
              />
            )}
          />
          {errors.endDate && (
            <span className='form-error'>{errors.endDate.message}</span>
          )}
        </div>
      </div>

      {/* Allocated Budget */}
      <div className='form-group'>
        <label className='form-label'>Department Budget (₹) *</label>
        <input
          type='number'
          className='form-control'
          placeholder='e.g., 5000000'
          step='100000'
          {...register('allocatedBudget', {
            required: 'Budget is required',
            min: { value: 0, message: 'Budget must be positive' },
          })}
        />
        {errors.allocatedBudget && (
          <span className='form-error'>{errors.allocatedBudget.message}</span>
        )}
      </div>

      {/* Description */}
      <div className='form-group'>
        <label className='form-label'>Description</label>
        <textarea
          className='form-control'
          placeholder='Add description for this fund cycle (Optional)'
          rows='3'
          {...register('description')}
        />
      </div>

      {/* Cycle Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--secondary)',
          padding: '15px',
          borderRadius: 'var(--radius)',
          marginBottom: '20px',
          border: '1px solid var(--border)',
        }}
      >
        <h4 style={{ margin: '0 0 15px 0', color: 'var(--text)' }}>
          📊 Cycle Summary
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '0.9rem',
          }}
        >
          {/* Duration */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Duration:</span>
            <strong>
              {getDurationDays()} days ({(getDurationDays() / 30).toFixed(1)}{' '}
              months)
            </strong>
          </div>

          {/* Start Date */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Starts:</span>
            <strong>
              {startDate
                ? new Date(startDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </strong>
          </div>

          {/* End Date */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Ends:</span>
            <strong>
              {endDate ? new Date(endDate).toLocaleDateString('en-IN') : 'N/A'}
            </strong>
          </div>

          {/* Budget Allocated */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Budget:</span>
            <strong style={{ color: 'var(--primary)' }}>
              ₹{(parseFloat(allocatedBudget || 0) / 100000).toFixed(2)}L
            </strong>
          </div>

          {/* Academic Year */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Academic Year:</span>
            <strong>{watch('academicYear') || 'N/A'}</strong>
          </div>
        </div>

        {/* Info Banner */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: 'rgba(26, 115, 232, 0.1)',
            borderLeft: '3px solid var(--primary)',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: 'var(--text)',
          }}
        >
          <strong>ℹ️ Note:</strong> This fund cycle will only be visible to
          faculty in your department. Other departments can have overlapping
          cycles.
        </div>
      </div>

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button
          variant='secondary'
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant='primary'
          type='submit'
          loading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? 'Saving...' : 'Save Cycle'}
        </Button>
      </div>
    </form>
  );
};

export default CycleForm;
