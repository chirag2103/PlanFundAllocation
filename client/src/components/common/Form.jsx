import React from 'react';

// Form Container
export const Form = ({ onSubmit, children, className = '', style = {} }) => {
  return (
    <form onSubmit={onSubmit} className={`form ${className}`} style={style}>
      {children}
    </form>
  );
};

// Form Group (wrapper for label + input)
export const FormGroup = ({ children, className = '', style = {} }) => {
  return (
    <div className={`form-group ${className}`} style={style}>
      {children}
    </div>
  );
};

// Label
export const Label = ({
  htmlFor,
  children,
  required = false,
  className = '',
  style = {},
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`form-label ${className}`}
      style={style}
    >
      {children}
      {required && <span className='form-required'>*</span>}
    </label>
  );
};

// Input Field
export const Input = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  required = false,
  className = '',
  style = {},
  min,
  max,
  step,
  pattern,
  autoComplete,
  maxLength,
  ...props
}) => {
  return (
    <>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`form-control ${
          error ? 'form-control-error' : ''
        } ${className}`}
        style={style}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        autoComplete={autoComplete}
        maxLength={maxLength}
        {...props}
      />
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// Textarea
export const Textarea = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  required = false,
  rows = 4,
  className = '',
  style = {},
  maxLength,
  ...props
}) => {
  return (
    <>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`form-control ${
          error ? 'form-control-error' : ''
        } ${className}`}
        style={style}
        maxLength={maxLength}
        {...props}
      />
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// Select Dropdown
export const Select = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  required = false,
  className = '',
  style = {},
  options = [],
  placeholder = '-- Select --',
  children,
  ...props
}) => {
  return (
    <>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`form-control ${
          error ? 'form-control-error' : ''
        } ${className}`}
        style={style}
        {...props}
      >
        {placeholder && <option value=''>{placeholder}</option>}
        {options.length > 0
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// Checkbox
export const Checkbox = ({
  id,
  name,
  checked,
  onChange,
  disabled = false,
  label,
  error,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <>
      <div className={`form-checkbox ${className}`} style={style}>
        <input
          type='checkbox'
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`form-checkbox-input ${error ? 'form-control-error' : ''}`}
          {...props}
        />
        {label && (
          <label htmlFor={id} className='form-checkbox-label'>
            {label}
          </label>
        )}
      </div>
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// Radio Button Group
export const RadioGroup = ({
  name,
  value,
  onChange,
  options = [],
  error,
  className = '',
  style = {},
  direction = 'vertical',
  ...props
}) => {
  return (
    <>
      <div
        className={`form-radio-group form-radio-${direction} ${className}`}
        style={style}
      >
        {options.map((option) => (
          <div key={option.value} className='form-radio'>
            <input
              type='radio'
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className={`form-radio-input ${
                error ? 'form-control-error' : ''
              }`}
              {...props}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className='form-radio-label'
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// File Input
export const FileInput = ({
  id,
  name,
  onChange,
  disabled = false,
  error,
  accept,
  multiple = false,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <>
      <input
        type='file'
        id={id}
        name={name}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        className={`form-file-input ${
          error ? 'form-control-error' : ''
        } ${className}`}
        style={style}
        {...props}
      />
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// Error Message
export const FormError = ({ message, className = '', style = {} }) => {
  if (!message) return null;
  return (
    <div className={`form-error-message ${className}`} style={style}>
      ⚠️ {message}
    </div>
  );
};

// Success Message
export const FormSuccess = ({ message, className = '', style = {} }) => {
  if (!message) return null;
  return (
    <div className={`form-success-message ${className}`} style={style}>
      ✓ {message}
    </div>
  );
};

// Form Actions (Buttons)
export const FormActions = ({
  children,
  align = 'flex-end',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`form-actions ${className}`}
      style={{
        display: 'flex',
        justifyContent: align,
        gap: '10px',
        marginTop: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Form Row (for side-by-side form groups)
export const FormRow = ({
  children,
  columns = 2,
  gap = '15px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`form-row ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        gap: gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Form Section (for grouping related fields)
export const FormSection = ({
  title,
  children,
  className = '',
  style = {},
}) => {
  return (
    <div className={`form-section ${className}`} style={style}>
      {title && <h4 className='form-section-title'>{title}</h4>}
      <div className='form-section-content'>{children}</div>
    </div>
  );
};

// Combo Input with addon (e.g., currency input)
export const InputAddon = ({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  addon,
  addonPosition = 'left',
  disabled = false,
  error,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <>
      <div
        className={`form-input-addon form-input-addon-${addonPosition} ${className}`}
        style={style}
      >
        {addonPosition === 'left' && (
          <span className='form-addon'>{addon}</span>
        )}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`form-control form-control-addon ${
            error ? 'form-control-error' : ''
          }`}
          {...props}
        />
        {addonPosition === 'right' && (
          <span className='form-addon'>{addon}</span>
        )}
      </div>
      {error && <span className='form-error'>{error}</span>}
    </>
  );
};

// Helper text below form field
export const FormHelper = ({ children, className = '', style = {} }) => {
  return (
    <p className={`form-helper ${className}`} style={style}>
      {children}
    </p>
  );
};
