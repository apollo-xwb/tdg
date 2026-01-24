
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  theme?: 'dark' | 'light';
  className?: string;
  compact?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Select...', theme = 'dark', className = '', compact }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onOutside = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);
  const isDark = theme === 'dark';
  const selected = options.find(o => o.value === value);
  const pad = compact ? 'px-2 py-1.5' : 'p-3';
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 border ${pad} text-[10px] font-light text-left transition-colors ${isDark ? 'bg-white/5 border-white/20 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}
      >
        <span className={value ? '' : 'opacity-50'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-auto border shadow-lg ${isDark ? 'bg-neutral-900 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }} className={`w-full text-left px-3 py-2.5 text-[10px] font-light transition-colors ${o.value === value ? (isDark ? 'bg-white/15' : 'bg-gray-100') : ''} ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
