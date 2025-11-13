import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const ReportFilters = ({
  cycles,
  departments,
  selectedCycle,
  selectedDepartment,
  onCycleChange,
  onDepartmentChange,
}) => {
  return (
    <Card style={{ marginBottom: '25px' }}>
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              fontSize: '0.9rem',
            }}
          >
            Fund Cycle
          </label>
          <select
            className='form-control'
            value={selectedCycle || ''}
            onChange={(e) => onCycleChange(e.target.value || null)}
          >
            <option value=''>-- All Cycles --</option>
            {cycles?.map((cycle) => (
              <option key={cycle._id} value={cycle._id}>
                {cycle.name} ({cycle.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              fontSize: '0.9rem',
            }}
          >
            Department
          </label>
          <select
            className='form-control'
            value={selectedDepartment || ''}
            onChange={(e) => onDepartmentChange(e.target.value || null)}
          >
            <option value=''>-- All Departments --</option>
            {departments?.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>

        <Button
          variant='secondary'
          onClick={() => {
            onCycleChange(null);
            onDepartmentChange(null);
          }}
        >
          Clear Filters
        </Button>
      </div>
    </Card>
  );
};

export default ReportFilters;
