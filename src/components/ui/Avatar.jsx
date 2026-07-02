import React from 'react';
import { cn } from './cn.js';

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export default function Avatar({ name, src, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-entity-family-bg font-semibold text-entity-family-text',
        SIZES[size],
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
