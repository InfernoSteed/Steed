import React, { useEffect, useRef } from 'react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  custom?: React.ReactNode;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  // Prevent menu from going off-screen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - (items.length * 40));

  return (
    <div 
      ref={ref}
      className="fixed z-[100] min-w-[200px] bg-[#2D2D2D]/95 backdrop-blur-md border border-[#FF6B35]/30 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left"
      style={{ top: adjustedY, left: adjustedX }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.separator) {
            return <div key={index} className="h-px bg-white/10 my-1 mx-2" />;
        }
        
        if (item.custom) {
            return <div key={index}>{item.custom}</div>;
        }
        
        return (
            <button
            key={index}
            onClick={() => { if (!item.disabled) { item.action(); onClose(); } }}
            disabled={item.disabled}
            className={`w-full h-9 px-3 flex items-center justify-between text-sm transition-colors group
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : item.danger ? 'text-theme-danger hover:bg-red-500/10' : 'text-[#B8B8B8] hover:bg-[#FF6B35]/15 hover:text-white'}
            `}
            >
            <span className="flex items-center gap-2">
                {item.icon && <span className={`opacity-70 transition-opacity ${!item.disabled && 'group-hover:opacity-100'}`}>{item.icon}</span>}
                {item.label}
            </span>
            {item.shortcut && <span className="text-xs text-[#6B6B6B] font-mono group-hover:text-[#FF6B35]/70">{item.shortcut}</span>}
            </button>
        );
      })}
    </div>
  );
};