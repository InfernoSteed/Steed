import React, { useState } from 'react';
import { History, X, Search, RotateCcw } from 'lucide-react';

interface HistoryState {
    id: string;
    description: string;
    timestamp: number;
    thumbnail?: string;
}

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryState[];
    currentIndex: number;
    onRestore: (index: number) => void;
}

export function HistoryPanel({
    isOpen,
    onClose,
    history,
    currentIndex,
    onRestore
}: HistoryPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredHistory = history.filter(state =>
        state.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    };

    return (
        <div className="history-panel-overlay">
            <div className="history-panel">
                {/* Header */}
                <div className="history-header">
                    <div className="header-title">
                        <History size={20} className="icon" />
                        <h3>History</h3>
                        <span className="count">{history.length} states</span>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="history-search">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* History List */}
                <div className="history-list">
                    {filteredHistory.length === 0 ? (
                        <div className="empty-state">
                            <RotateCcw size={48} className="empty-icon" />
                            <p>No history found</p>
                        </div>
                    ) : (
                        filteredHistory.map((state, index) => {
                            const actualIndex = history.indexOf(state);
                            const isCurrent = actualIndex === currentIndex;

                            return (
                                <div
                                    key={state.id}
                                    className={`history-item ${isCurrent ? 'current' : ''}`}
                                    onClick={() => !isCurrent && onRestore(actualIndex)}
                                >
                                    {/* Thumbnail */}
                                    <div className="thumbnail">
                                        {state.thumbnail ? (
                                            <img src={state.thumbnail} alt={state.description} />
                                        ) : (
                                            <div className="thumbnail-placeholder">
                                                <History size={24} />
                                            </div>
                                        )}
                                        {isCurrent && (
                                            <div className="current-badge">Current</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="item-info">
                                        <div className="item-description">{state.description}</div>
                                        <div className="item-timestamp">{formatTimestamp(state.timestamp)}</div>
                                    </div>

                                    {/* Index */}
                                    <div className="item-index">#{actualIndex + 1}</div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style>{`
        .history-panel-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 400px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 150;
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .history-panel {
          width: 100%;
          height: 100%;
          background: #2D2D2D;
          border-left: 2px solid #FF6B35;
          display: flex;
          flex-direction: column;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 100%);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title .icon {
          color: #FF6B35;
        }

        .header-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        .header-title .count {
          font-size: 12px;
          color: #888;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 12px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .history-search {
          position: relative;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 32px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #FF6B35;
        }

        .search-input::placeholder {
          color: #666;
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .history-list::-webkit-scrollbar {
          width: 8px;
        }

        .history-list::-webkit-scrollbar-track {
          background: #1D1D1D;
        }

        .history-list::-webkit-scrollbar-thumb {
          background: #FF6B35;
          border-radius: 4px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .history-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #FF6B35;
          transform: translateX(-4px);
        }

        .history-item.current {
          background: rgba(255, 107, 53, 0.15);
          border-color: #FF6B35;
          cursor: default;
        }

        .history-item.current:hover {
          transform: none;
        }

        .thumbnail {
          position: relative;
          width: 80px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          background: #1D1D1D;
          flex-shrink: 0;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .current-badge {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: #FF6B35;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-description {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-timestamp {
          font-size: 12px;
          color: #888;
        }

        .item-index {
          font-size: 12px;
          color: #666;
          font-weight: 600;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
      `}</style>
        </div>
    );
}
