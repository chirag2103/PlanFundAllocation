import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showHeader = true,
  showCloseButton = true,
  onBackdropClick = true,
  className = '',
  style = {},
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Apply styles to prevent scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      document.documentElement.style.overflow = 'hidden';

      // Store scroll position for restoration
      document.body.dataset.scrollTop = scrollTop;
    } else {
      // Restore scroll
      const scrollTop = document.body.dataset.scrollTop || 0;
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.documentElement.style.overflow = 'unset';

      // Restore scroll position
      window.scrollTo(0, scrollTop);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClass =
    {
      small: 'modal-small',
      medium: 'modal-medium',
      large: 'modal-large',
      fullscreen: 'modal-fullscreen',
    }[size] || 'modal-medium';

  const modalContent = (
    <div
      className='modal-overlay'
      onClick={onBackdropClick ? onClose : undefined}
    >
      <div
        className={`modal ${sizeClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        {/* Header */}
        {showHeader && (
          <div className='modal-header'>
            <h2 className='modal-title'>{title}</h2>
            {showCloseButton && (
              <button
                className='modal-close-btn'
                onClick={onClose}
                aria-label='Close modal'
                type='button'
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className='modal-body'>{children}</div>
      </div>
    </div>
  );

  // Use React Portal to render modal at document root
  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
