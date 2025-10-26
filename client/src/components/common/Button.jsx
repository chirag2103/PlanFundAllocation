import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = disabled || loading ? 'btn-disabled' : '';

  const classes =
    `${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className='btn-spinner'></span>}
      {children}
    </button>
  );
};

export default Button;
