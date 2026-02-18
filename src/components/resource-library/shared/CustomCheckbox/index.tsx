/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react';
import styles from './styles.module.css';

interface CustomCheckboxProps {
  id: string;
  checked: boolean | 'mixed';
  disabled?: boolean;
  label: string;
  onChange: () => void;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  'data-m'?: string;
}

export default function CustomCheckbox({
  id,
  checked,
  disabled = false,
  label,
  onChange,
  onClick,
  onKeyDown,
  'data-m': dataM,
}: CustomCheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
    onChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      if (!e.defaultPrevented) {
        e.preventDefault();
        onChange();
      }
    }
  };

  const getCheckboxClass = () => {
    let className = styles.checkbox;
    if (checked === true) {
      className += ` ${styles.checked}`;
    } else if (checked === 'mixed') {
      className += ` ${styles.indeterminate}`;
    }
    if (disabled) {
      className += ` ${styles.disabled}`;
    }
    return className;
  };

  return (
    <div className={styles.container}>
      <div
        id={id}
        className={getCheckboxClass()}
        data-m={dataM}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
      >
        <div className={styles.indicator}>
          {checked === true && (
            <svg
              className={styles.checkmark}
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.046 3.486a.75.75 0 0 1-.032 1.06l-7.93 7.474a.85.85 0 0 1-1.188-.022l-2.68-2.72a.75.75 0 1 1 1.068-1.053l2.234 2.267 7.468-7.038a.75.75 0 0 1 1.06.032Z"
                fill="currentColor"
              />
            </svg>
          )}
          {checked === 'mixed' && <div className={styles.minusSign}>−</div>}
        </div>
      </div>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
