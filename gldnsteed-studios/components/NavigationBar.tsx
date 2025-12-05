
import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    action: () => void;
}

interface NavigationBarProps {
    items: NavItem[];
    onClose: () => void;
    title: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ items, onClose, title }) => {
    return (
        <div className="flex items-center h-full bg-[#252525] border-b border-theme-border px-2 animate-in slide-in-from-left duration-200">
            <div className="mr-4 font-bold text-xs text-theme-text-muted uppercase tracking-wider border-r border-white/10 pr-4 h-6 flex items-center">
                {title}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-white/5 min-w-[60px] group transition-colors"
                        title={item.label}
                    >
                        <item.icon size={16} className="mb-1 text-theme-text-muted group-hover:text-theme-accent transition-colors" />
                        <span className="text-[9px] text-theme-text-muted group-hover:text-white whitespace-nowrap">{item.label}</span>
                    </button>
                ))}
            </div>
            <button
                onClick={onClose}
                className="ml-2 p-1 hover:bg-white/10 rounded text-xs text-white/50 hover:text-white"
            >
                ✕
            </button>
        </div>
    );
};
