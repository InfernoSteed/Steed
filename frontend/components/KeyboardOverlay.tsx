import React, { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { DEFAULT_SHORTCUTS, formatShortcut, ShortcutCategory } from '../utils/shortcuts';

interface KeyboardOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

export function KeyboardOverlay({ isVisible, onClose }: KeyboardOverlayProps) {
    const [activeCategory, setActiveCategory] = useState<ShortcutCategory | 'all'>('all');

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVisible) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const categories: { id: ShortcutCategory | 'all'; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'playback', label: 'Playback' },
        { id: 'editing', label: 'Editing' },
        { id: 'navigation', label: 'Navigation' },
        { id: 'tools', label: 'Tools' },
        { id: 'markers', label: 'Markers' },
        { id: 'effects', label: 'Effects' },
    ];

    const filteredShortcuts = activeCategory === 'all'
        ? DEFAULT_SHORTCUTS
        : DEFAULT_SHORTCUTS.filter(s => s.category === activeCategory);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#2D2D2D] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[#FF6B35]/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#FF6B35]/20 bg-gradient-to-r from-[#2D2D2D] to-[#3D3D3D]">
                    <div className="flex items-center gap-3">
                        <Keyboard size={24} className="text-[#FF6B35]" />
                        <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 px-6 py-3 bg-[#252525] border-b border-white/10 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat.id
                                ? 'bg-[#FF6B35] text-white shadow-lg'
                                : 'bg-[#3D3D3D] text-gray-400 hover:text-white hover:bg-[#4D4D4D]'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Shortcuts List */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredShortcuts.map(shortcut => (
                            <div
                                key={shortcut.id}
                                className="flex items-center justify-between p-3 bg-[#3D3D3D] rounded-lg hover:bg-[#4D4D4D] transition-colors border border-white/5"
                            >
                                <span className="text-sm text-gray-300">{shortcut.description}</span>
                                <kbd className="px-3 py-1.5 bg-[#1D1D1D] border border-[#FF6B35]/30 rounded text-xs font-mono text-[#FF6B35] shadow-sm">
                                    {formatShortcut(shortcut)}
                                </kbd>
                            </div>
                        ))}
                    </div>

                    {filteredShortcuts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No shortcuts in this category
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#252525] border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Press <kbd className="px-2 py-1 bg-[#3D3D3D] rounded text-[#FF6B35] font-mono">?</kbd> to toggle this overlay
                    </p>
                    <p className="text-xs text-gray-500">
                        {filteredShortcuts.length} shortcuts
                    </p>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1D1D1D;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FF6B35;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #FF8555;
        }
      `}</style>
        </div>
    );
}
