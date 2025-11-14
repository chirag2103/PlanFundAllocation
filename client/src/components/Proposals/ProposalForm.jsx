import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ProposalForm = ({ proposal, onSubmit, onCancel, isLoading }) => {
  const { user } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues:
      proposal && proposal.items
        ? {
            fundCycle: proposal.fundCycle?._id || '',
            items: proposal.items.map((item) => ({
              itemKeyword: item.itemKeyword?._id || item.itemKeyword || '', // Handle both populated and unpopulated
              quantity: item.quantity || 1,
              unitCost: item.unitCost || 0,
              justification: item.justification || '',
            })),
            priority: proposal.priority || 'medium',
          }
        : {
            fundCycle: '',
            items: [
              { itemKeyword: '', quantity: 1, unitCost: 0, justification: '' },
            ],
            priority: 'medium',
          },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['fund-cycles-active'],
    queryFn: () => api.get('/api/cycles?status=active').then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  // UPDATED: Fetch items with department filter
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['item-keywords', user?.department],
    queryFn: () => api.get('/api/item-keywords').then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const itemsArray = watch('items');
  const selectedCycle = watch('fundCycle');

  const totalAmount = itemsArray.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const onFormSubmit = async (data) => {
    console.log('Form submitted with data:', data);

    if (!data.fundCycle) {
      toast.error('Please select a fund cycle');
      return;
    }

    if (!data.items || data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const validItems = data.items.every((item, idx) => {
      console.log(`Item ${idx}:`, item);
      return (
        item.itemKeyword &&
        item.quantity &&
        item.unitCost !== undefined &&
        item.unitCost !== '' &&
        item.justification &&
        item.justification.trim()
      );
    });

    if (!validItems) {
      toast.error(
        'All items must have: keyword, quantity, unit cost, and justification'
      );
      return;
    }

    try {
      const submitData = {
        fundCycle: data.fundCycle,
        items: data.items.map((item) => ({
          itemKeyword: item.itemKeyword,
          quantity: parseInt(item.quantity),
          unitCost: parseFloat(item.unitCost),
          totalCost: parseInt(item.quantity) * parseFloat(item.unitCost),
          justification: item.justification.trim(),
        })),
        totalAmount: totalAmount,
        priority: data.priority,
      };

      console.log('Submitting:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to save proposal');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Fund Cycle Selection */}
      <div className='form-group'>
        <label className='form-label'>Fund Cycle *</label>
        {cyclesLoading ? (
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Loading cycles...
          </p>
        ) : !cycles || cycles.length === 0 ? (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
            ⚠️ No active fund cycles available. Contact your coordinator.
          </p>
        ) : (
          <select
            className='form-control'
            {...register('fundCycle', { required: 'Fund cycle is required' })}
          >
            <option value=''>-- Select Fund Cycle --</option>
            {cycles.map((cycle) => (
              <option key={cycle._id} value={cycle._id}>
                {cycle.name} ({cycle.academicYear})
              </option>
            ))}
          </select>
        )}
        {errors.fundCycle && (
          <span className='form-error'>{errors.fundCycle.message}</span>
        )}
      </div>

      {/* Priority */}
      <div className='form-group'>
        <label className='form-label'>Priority</label>
        <select className='form-control' {...register('priority')}>
          <option value='low'>Low</option>
          <option value='medium'>Medium</option>
          <option value='high'>High</option>
        </select>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <label className='form-label' style={{ margin: 0 }}>
            Items * ({fields.length})
          </label>
          <Button
            variant='secondary'
            size='small'
            type='button'
            onClick={() =>
              append({
                itemKeyword: '',
                quantity: 1,
                unitCost: 0,
                justification: '',
              })
            }
          >
            + Add Item
          </Button>
        </div>

        {itemsLoading ? (
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Loading items...
          </p>
        ) : !items || items.length === 0 ? (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
            ⚠️ No items available for your department. Contact admin.
          </p>
        ) : (
          fields.map((field, index) => {
            // Get selected item to show if it's selected
            const selectedItemId = watch(`items.${index}.itemKeyword`);
            const selectedItem = items?.find(
              (item) => item._id === selectedItemId
            );

            return (
              <div
                key={field.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr auto',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: 'var(--secondary)',
                  borderRadius: 'var(--radius)',
                  alignItems: 'center',
                }}
              >
                {/* Item Keyword - FIXED: Auto-select and show selected value */}
                <div>
                  <select
                    className={`form-control ${
                      errors.items?.[index]?.itemKeyword
                        ? 'form-control-error'
                        : ''
                    }`}
                    {...register(`items.${index}.itemKeyword`, {
                      required: 'Select item',
                    })}
                    value={selectedItemId}
                  >
                    <option value=''>-- Select Item --</option>
                    {items?.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {/* Show selected item name */}
                  {/* {selectedItem && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-light)',
                        margin: '3px 0 0 0',
                      }}
                    >
                      ✓ {selectedItem.name}
                    </p>
                  )} */}
                  {errors.items?.[index]?.itemKeyword && (
                    <span
                      className='form-error'
                      style={{ fontSize: '0.75rem' }}
                    >
                      {errors.items[index].itemKeyword.message}
                    </span>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <input
                    type='number'
                    className={`form-control ${
                      errors.items?.[index]?.quantity
                        ? 'form-control-error'
                        : ''
                    }`}
                    placeholder='Qty'
                    min='1'
                    {...register(`items.${index}.quantity`, {
                      required: 'Qty required',
                      min: { value: 1, message: 'Min 1' },
                    })}
                  />
                  {errors.items?.[index]?.quantity && (
                    <span
                      className='form-error'
                      style={{ fontSize: '0.75rem' }}
                    >
                      {errors.items[index].quantity.message}
                    </span>
                  )}
                </div>

                {/* Unit Cost */}
                <div>
                  <input
                    type='number'
                    className={`form-control ${
                      errors.items?.[index]?.unitCost
                        ? 'form-control-error'
                        : ''
                    }`}
                    placeholder='Cost'
                    step='0.01'
                    {...register(`items.${index}.unitCost`, {
                      required: 'Cost required',
                      min: { value: 0, message: 'Min 0' },
                    })}
                  />
                  {errors.items?.[index]?.unitCost && (
                    <span
                      className='form-error'
                      style={{ fontSize: '0.75rem' }}
                    >
                      {errors.items[index].unitCost.message}
                    </span>
                  )}
                </div>

                {/* Justification */}
                <div>
                  <input
                    type='text'
                    className={`form-control ${
                      errors.items?.[index]?.justification
                        ? 'form-control-error'
                        : ''
                    }`}
                    placeholder='Why needed?'
                    {...register(`items.${index}.justification`, {
                      required: 'Justification required',
                    })}
                  />
                  {errors.items?.[index]?.justification && (
                    <span
                      className='form-error'
                      style={{ fontSize: '0.75rem' }}
                    >
                      {errors.items[index].justification.message}
                    </span>
                  )}
                </div>

                {/* Total */}
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  ₹
                  {(
                    (parseInt(watch(`items.${index}.quantity`)) || 0) *
                    (parseFloat(watch(`items.${index}.unitCost`)) || 0)
                  ).toLocaleString('en-IN')}
                </div>

                {/* Remove Button */}
                <Button
                  variant='danger'
                  size='small'
                  type='button'
                  onClick={() => remove(index)}
                >
                  ✕
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Total Amount Summary */}
      <div
        style={{
          backgroundColor: 'var(--secondary)',
          padding: '15px',
          borderRadius: 'var(--radius)',
          marginBottom: '20px',
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '600' }}>Total Amount:</span>
          <span
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--primary)',
            }}
          >
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
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
          disabled={isLoading || isSubmitting || !selectedCycle}
        >
          {isLoading || isSubmitting ? 'Saving...' : 'Save Proposal'}
        </Button>
      </div>
    </form>
  );
};

export default ProposalForm;
