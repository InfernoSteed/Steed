import React, { useState } from 'react';
import { Folder, FolderPlus, Edit2, Trash2, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Bin } from '../utils/project-bins';
import { Asset } from '../types';

interface ProjectBinsProps {
    bins: Bin[];
    assets: Asset[];
    onCreateBin: (name: string, parentId?: string) => void;
    onDeleteBin: (binId: string) => void;
    onRenameBin: (binId: string, newName: string) => void;
    onChangeBinColor: (binId: string, color: string) => void;
    onMoveAsset: (assetId: string, fromBinId: string, toBinId: string) => void;
    onToggleExpansion: (binId: string) => void;
    onAssetClick: (assetId: string) => void;
}

export function ProjectBins({
    bins,
    assets,
    onCreateBin,
    onDeleteBin,
    onRenameBin,
    onChangeBinColor,
    onMoveAsset,
    onToggleExpansion,
    onAssetClick
}: ProjectBinsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingBinId, setEditingBinId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);
    const [draggedFromBinId, setDraggedFromBinId] = useState<string | null>(null);

    const renderBin = (bin: Bin, level: number = 0) => {
        const binAssets = assets.filter(a => bin.assetIds.includes(a.id));
        const childBins = bins.filter(b => b.parentId === bin.id);
        const isEditing = editingBinId === bin.id;

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (draggedAssetId && draggedFromBinId && draggedFromBinId !== bin.id) {
                onMoveAsset(draggedAssetId, draggedFromBinId, bin.id);
            }

            setDraggedAssetId(null);
            setDraggedFromBinId(null);
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        return (
            <div key={bin.id} className="bin-item" style={{ marginLeft: `${level * 20}px` }}>
                <div
                    className="bin-header"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{ borderLeft: bin.color ? `3px solid ${bin.color}` : 'none' }}
                >
                    <button
                        className="expand-btn"
                        onClick={() => onToggleExpansion(bin.id)}
                    >
                        {bin.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <Folder size={16} style={{ color: bin.color || '#888' }} />

                    {isEditing ? (
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => {
                                onRenameBin(bin.id, editingName);
                                setEditingBinId(null);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onRenameBin(bin.id, editingName);
                                    setEditingBinId(null);
                                }
                            }}
                            autoFocus
                            className="bin-name-input"
                        />
                    ) : (
                        <span className="bin-name">{bin.name}</span>
                    )}

                    <span className="asset-count">{binAssets.length}</span>

                    <div className="bin-actions">
                        <button
                            onClick={() => {
                                setEditingBinId(bin.id);
                                setEditingName(bin.name);
                            }}
                            title="Rename"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button
                            onClick={() => onDeleteBin(bin.id)}
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </button>
                        <button
                            onClick={() => onCreateBin('New Bin', bin.id)}
                            title="Add Sub-bin"
                        >
                            <FolderPlus size={12} />
                        </button>
                    </div>
                </div>

                {bin.isExpanded && (
                    <div className="bin-content">
                        {/* Assets */}
                        {binAssets.map(asset => (
                            <div
                                key={asset.id}
                                className="asset-item"
                                draggable
                                onDragStart={() => {
                                    setDraggedAssetId(asset.id);
                                    setDraggedFromBinId(bin.id);
                                }}
                                onClick={() => onAssetClick(asset.id)}
                            >
                                <div className="asset-thumbnail">
                                    {asset.type === 'video' || asset.type === 'image' ? (
                                        <img src={asset.source} alt={asset.name} />
                                    ) : (
                                        <div className="audio-icon">🎵</div>
                                    )}
                                </div>
                                <div className="asset-info">
                                    <div className="asset-name">{asset.name}</div>
                                    <div className="asset-meta">{asset.format} • {Math.round(asset.duration)}s</div>
                                </div>
                            </div>
                        ))}

                        {/* Child bins */}
                        {childBins.map(childBin => renderBin(childBin, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const rootBins = bins.filter(b => b.parentId === null);
    const filteredBins = searchQuery
        ? bins.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : rootBins;

    return (
        <div className="project-bins">
            <div className="bins-header">
                <h3>Project Bins</h3>
                <button onClick={() => onCreateBin('New Bin')} className="add-bin-btn">
                    <FolderPlus size={16} />
                </button>
            </div>

            <div className="bins-search">
                <Search size={14} />
                <input
                    type="text"
                    placeholder="Search bins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bins-list">
                {filteredBins.map(bin => renderBin(bin))}
            </div>

            <style>{`
        .project-bins {
          background: #2D2D2D;
          border-radius: 8px;
          padding: 16px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .bins-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .bins-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .add-bin-btn {
          padding: 6px;
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.4);
          border-radius: 4px;
          color: #FF6B35;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-bin-btn:hover {
          background: rgba(255, 107, 53, 0.3);
        }

        .bins-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .bins-search svg {
          color: #888;
        }

        .bins-search input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 12px;
          outline: none;
        }

        .bins-list {
          flex: 1;
          overflow-y: auto;
        }

        .bin-item {
          margin-bottom: 4px;
        }

        .bin-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bin-header:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .expand-btn {
          padding: 0;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .bin-name {
          flex: 1;
          font-size: 13px;
          color: #fff;
        }

        .bin-name-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #FF6B35;
          border-radius: 4px;
          padding: 4px 8px;
          color: #fff;
          font-size: 13px;
          outline: none;
        }

        .asset-count {
          font-size: 11px;
          color: #666;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 10px;
        }

        .bin-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .bin-header:hover .bin-actions {
          opacity: 1;
        }

        .bin-actions button {
          padding: 4px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 3px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bin-actions button:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .bin-content {
          margin-left: 20px;
          margin-top: 4px;
        }

        .asset-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .asset-item:hover {
          background: rgba(255, 107, 53, 0.1);
        }

        .asset-thumbnail {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          background: #1D1D1D;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .asset-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .audio-icon {
          font-size: 20px;
        }

        .asset-info {
          flex: 1;
          min-width: 0;
        }

        .asset-name {
          font-size: 12px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .asset-meta {
          font-size: 10px;
          color: #666;
        }
      `}</style>
        </div>
    );
}
