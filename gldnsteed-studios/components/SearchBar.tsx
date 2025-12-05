import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Track, Clip } from '../types';
import { searchClips, SearchFilters, parseDurationQuery } from '../utils/search';

interface SearchBarProps {
    tracks: Track[];
    onResultsChange: (clipIds: string[]) => void;
}

export function SearchBar({ tracks, onResultsChange }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [results, setResults] = useState<Clip[]>([]);

    const handleSearch = () => {
        const searchFilters: SearchFilters = {
            text: query || undefined,
            ...filters
        };

        const foundClips = searchClips(tracks, searchFilters);
        setResults(foundClips);
        onResultsChange(foundClips.map(c => c.id));
    };

    const handleClear = () => {
        setQuery('');
        setFilters({});
        setResults([]);
        onResultsChange([]);
    };

    const handleDurationQuery = (durationQuery: string) => {
        const parsed = parseDurationQuery(durationQuery);
        if (parsed) {
            setFilters(prev => ({
                ...prev,
                minDuration: parsed.min,
                maxDuration: parsed.max
            }));
        }
    };

    return (
        <div className="search-bar">
            <div className="search-input-container">
                <Search size={16} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search clips..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                />
                {(query || results.length > 0) && (
                    <button onClick={handleClear} className="clear-btn">
                        <X size={14} />
                    </button>
                )}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`filter-btn ${showFilters ? 'active' : ''}`}
                >
                    <Filter size={16} />
                </button>
            </div>

            {showFilters && (
                <div className="search-filters">
                    <div className="filter-row">
                        <label>Type:</label>
                        <select
                            value={filters.type || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any || undefined }))}
                        >
                            <option value="">All</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="image">Image</option>
                            <option value="text">Text</option>
                        </select>
                    </div>

                    <div className="filter-row">
                        <label>Duration:</label>
                        <input
                            type="text"
                            placeholder="e.g., 5-10 or >5"
                            onChange={(e) => handleDurationQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-row">
                        <label>
                            <input
                                type="checkbox"
                                checked={filters.hasEffects || false}
                                onChange={(e) => setFilters(prev => ({ ...prev, hasEffects: e.target.checked }))}
                            />
                            Has Effects
                        </label>
                    </div>

                    <div className="filter-row">
                        <label>
                            <input
                                type="checkbox"
                                checked={filters.hasKeyframes || false}
                                onChange={(e) => setFilters(prev => ({ ...prev, hasKeyframes: e.target.checked }))}
                            />
                            Has Keyframes
                        </label>
                    </div>
                </div>
            )}

            {results.length > 0 && (
                <div className="search-results">
                    Found {results.length} clip{results.length !== 1 ? 's' : ''}
                </div>
            )}

            <style>{`
        .search-bar {
          background: #2D2D2D;
          border-radius: 6px;
          padding: 8px;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px 12px;
        }

        .search-icon {
          color: #888;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 13px;
          outline: none;
        }

        .search-input::placeholder {
          color: #666;
        }

        .clear-btn, .filter-btn {
          padding: 4px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-btn:hover, .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .filter-btn.active {
          background: rgba(255, 107, 53, 0.2);
          color: #FF6B35;
        }

        .search-filters {
          margin-top: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .filter-row label {
          color: #888;
          min-width: 80px;
        }

        .filter-row select,
        .filter-row input[type="text"] {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 6px 8px;
          color: #fff;
          font-size: 12px;
          outline: none;
        }

        .filter-row input[type="checkbox"] {
          margin-right: 6px;
        }

        .search-results {
          margin-top: 8px;
          padding: 8px;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 4px;
          font-size: 12px;
          color: #FF6B35;
          text-align: center;
        }
      `}</style>
        </div>
    );
}
