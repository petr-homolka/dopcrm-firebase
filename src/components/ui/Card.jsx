import React from 'react';
import { cn } from './cn.js';

// Connecteam redesign (DESIGN.md §4.4) — bílá karta, jemný border, shadow-sm.
export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-border-subtle bg-white p-5 shadow-sm md:p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}
