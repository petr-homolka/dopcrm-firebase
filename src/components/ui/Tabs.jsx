import React from 'react';
import { cn } from './cn.js';

/**
 * Podtržené taby dle DESIGN.md §5.3. Kontrolovaná komponenta:
 * `items` = [{ value, label, count? }], `value`/`onChange` řídí aktivní tab.
 */
export default function Tabs({ items, value, onChange, className }) {
  return (
    <div className={cn('border-b border-border-default', className)}>
      <nav className="flex gap-6 overflow-x-auto">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={cn(
                'shrink-0 whitespace-nowrap border-b-2 pb-3 pt-4 text-sm transition',
                active
                  ? 'border-brand-500 font-semibold text-brand-600'
                  : 'border-transparent font-medium text-ink-500 hover:text-ink-800'
              )}
            >
              {item.label}
              {item.count != null && <span className="ml-1.5 text-ink-400">({item.count})</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
