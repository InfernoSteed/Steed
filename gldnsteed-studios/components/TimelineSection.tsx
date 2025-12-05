
import React, { ReactNode } from 'react';
import { Plus } from 'lucide-react';

interface TimelineSectionProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    onAdd?: () => void;
    isExpanded?: boolean;
    headerContent?: ReactNode; // Custom content for header (e.g. Nav Bar)
    className?: string;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
    title,
    icon,
    children,
    onAdd,
    isExpanded,
    headerContent,
    className = ''
}) => {
    return (
        <div className={`flex flex-col border-b border-theme-border/50 relative ${className}`}>
            {/* Section Header Area */}
            <div className="h-[40px] bg-[#2A2A2A] border-b border-white/5 flex items-center px-0 z-20 sticky left-0 w-full">
                {/* This header logic usually sits in the track list sidebar, but we need a section divider 
                     The design requests a 3-section layout. 
                     We might lift the "Add" button here or inside the track area.
                     Let's make this a container wrapper.
                 */}
                {headerContent ? (
                    <div className="w-full h-full">
                        {headerContent}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center px-4 justify-between group">
                        <div className="flex items-center gap-2">
                            {icon}
                            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">{title}</span>
                        </div>
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex items-center gap-1.5 px-3 py-1 bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent rounded text-[10px] font-medium transition-all transform active:scale-95"
                            >
                                <Plus size={12} />
                                <span>Add {title}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tracks Container */}
            <div className="flex-1 relative">
                {children}
            </div>
        </div>
    );
};
