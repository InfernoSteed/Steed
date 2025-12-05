import React, { useState } from 'react';
import { Sparkles, Volume2, Video, Type, Loader2, X } from 'lucide-react';
import { Button } from './Button';
import { RangeSlider } from './RangeSlider';
import { CaptionPreset } from '../types';

interface AIToolsPanelProps {
    selectedClipId: string | null;
    onDetectSilence: (threshold: number, minDuration: number) => void;
    onDetectBeats: (sensitivity: number) => void;
    onDetectScenes: (sensitivity: number) => void;
    onDetectJumpCuts: (threshold: number) => void;
    onAutoColorBalance: () => void;
    onAutoCrop: (platform: string) => void;
    onStabilizeVideo: () => void;
    onAutoGenerateCaptions: (presetId: string) => void;
    onSmartDucking: () => void;
    onBatchAnalysis: (operations: string[]) => void;
    onCancelOperation: () => void;
    captionPresets: CaptionPreset[];
    isProcessing: boolean;
    processingProgress: number;
    processingOperation: string;
}

export function AIToolsPanel({
    selectedClipId,
    onDetectSilence,
    onDetectBeats,
    onDetectScenes,
    onDetectJumpCuts,
    onAutoColorBalance,
    onAutoCrop,
    onStabilizeVideo,
    onAutoGenerateCaptions,
    onSmartDucking,
    onBatchAnalysis,
    onCancelOperation,
    captionPresets,
    isProcessing,
    processingProgress,
    processingOperation
}: AIToolsPanelProps) {
    const [silenceThreshold, setSilenceThreshold] = useState(-40);
    const [silenceMinDuration, setSilenceMinDuration] = useState(0.5);
    const [beatSensitivity, setBeatSensitivity] = useState(0.5);
    const [sceneSensitivity, setSceneSensitivity] = useState(0.5);
    const [jumpCutThreshold, setJumpCutThreshold] = useState(0.6);
    const [selectedCaptionPreset, setSelectedCaptionPreset] = useState('classic');
    const [selectedPlatform, setSelectedPlatform] = useState('16:9');
    const [expandedSection, setExpandedSection] = useState<string | null>('audio');
    const [batchOperations, setBatchOperations] = useState<string[]>([]);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const toggleBatchOperation = (operation: string) => {
        setBatchOperations(prev =>
            prev.includes(operation)
                ? prev.filter(op => op !== operation)
                : [...prev, operation]
        );
    };

    const platformPresets = [
        { value: '16:9', label: '16:9 - YouTube/TV' },
        { value: '9:16', label: '9:16 - Instagram Story/TikTok' },
        { value: '1:1', label: '1:1 - Instagram Post' },
        { value: '4:5', label: '4:5 - Instagram Portrait' },
    ];

    return (
        <div className="ai-tools-panel">
            <div className="panel-header">
                <Sparkles size={18} />
                <h3>AI Tools</h3>
            </div>

            {isProcessing && (
                <div className="processing-overlay">
                    <div className="processing-content">
                        <Loader2 size={24} className="spinner" />
                        <p>{processingOperation}</p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${processingProgress}%` }} />
                        </div>
                        <Button onClick={onCancelOperation} className="cancel-btn">
                            <X size={16} />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Audio Analysis Section */}
            <div className="tool-section">
                <button
                    className={`section-header ${expandedSection === 'audio' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('audio')}
                >
                    <Volume2 size={16} />
                    <span>Audio Analysis</span>
                    <span className="expand-icon">{expandedSection === 'audio' ? '−' : '+'}</span>
                </button>

                {expandedSection === 'audio' && (
                    <div className="section-content">
                        <div className="tool-group">
                            <label>Silence Detection</label>
                            <RangeSlider
                                label="Threshold (dB)"
                                value={silenceThreshold}
                                onChange={setSilenceThreshold}
                                min={-60}
                                max={-20}
                                step={1}
                                showValue
                            />
                            <RangeSlider
                                label="Min Duration (s)"
                                value={silenceMinDuration}
                                onChange={setSilenceMinDuration}
                                min={0.1}
                                max={2}
                                step={0.1}
                                showValue
                            />
                            <Button
                                onClick={() => onDetectSilence(silenceThreshold, silenceMinDuration)}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Detect Silence
                            </Button>
                        </div>

                        <div className="tool-group">
                            <label>Beat Detection</label>
                            <RangeSlider
                                label="Sensitivity"
                                value={beatSensitivity}
                                onChange={setBeatSensitivity}
                                min={0.1}
                                max={1}
                                step={0.1}
                                showValue
                            />
                            <Button
                                onClick={() => onDetectBeats(beatSensitivity)}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Detect Beats
                            </Button>
                        </div>

                        <div className="tool-group">
                            <label>Smart Background Music</label>
                            <Button
                                onClick={onSmartDucking}
                                disabled={isProcessing}
                                className="tool-btn"
                            >
                                Enable Auto-Ducking
                            </Button>
                            <p className="tool-hint">Automatically reduces music volume when voice is detected</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Video Analysis Section */}
            <div className="tool-section">
                <button
                    className={`section-header ${expandedSection === 'video' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('video')}
                >
                    <Video size={16} />
                    <span>Video Analysis</span>
                    <span className="expand-icon">{expandedSection === 'video' ? '−' : '+'}</span>
                </button>

                {expandedSection === 'video' && (
                    <div className="section-content">
                        <div className="tool-group">
                            <label>Auto Color Balance</label>
                            <Button
                                onClick={onAutoColorBalance}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Apply Auto Color
                            </Button>
                            <p className="tool-hint">Analyzes and applies consistent color grading</p>
                        </div>

                        <div className="tool-group">
                            <label>Scene Detection</label>
                            <RangeSlider
                                label="Sensitivity"
                                value={sceneSensitivity}
                                onChange={setSceneSensitivity}
                                min={0.1}
                                max={1}
                                step={0.1}
                                showValue
                            />
                            <Button
                                onClick={() => onDetectScenes(sceneSensitivity)}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Detect Scenes
                            </Button>
                        </div>

                        <div className="tool-group">
                            <label>Jump Cut Detection</label>
                            <RangeSlider
                                label="Threshold"
                                value={jumpCutThreshold}
                                onChange={setJumpCutThreshold}
                                min={0.1}
                                max={1}
                                step={0.1}
                                showValue
                            />
                            <Button
                                onClick={() => onDetectJumpCuts(jumpCutThreshold)}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Detect Jump Cuts
                            </Button>
                        </div>

                        <div className="tool-group">
                            <label>Auto-Crop</label>
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="platform-select"
                            >
                                {platformPresets.map(preset => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={() => onAutoCrop(selectedPlatform)}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Apply Auto-Crop
                            </Button>
                        </div>

                        <div className="tool-group">
                            <label>Stabilization</label>
                            <Button
                                onClick={onStabilizeVideo}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Stabilize Video
                            </Button>
                            <p className="tool-hint">Reduces camera shake</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Caption Generation Section */}
            <div className="tool-section">
                <button
                    className={`section-header ${expandedSection === 'captions' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('captions')}
                >
                    <Type size={16} />
                    <span>Caption Generation</span>
                    <span className="expand-icon">{expandedSection === 'captions' ? '−' : '+'}</span>
                </button>

                {expandedSection === 'captions' && (
                    <div className="section-content">
                        <div className="tool-group">
                            <label>Caption Style</label>
                            <select
                                value={selectedCaptionPreset}
                                onChange={(e) => setSelectedCaptionPreset(e.target.value)}
                                className="preset-select"
                            >
                                {captionPresets.map(preset => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={() => onAutoGenerateCaptions(selectedCaptionPreset)}
                                disabled={!selectedClipId || isProcessing}
                                className="tool-btn"
                            >
                                Generate Captions
                            </Button>
                            <p className="tool-hint">Auto-transcribe and create styled captions</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Batch Operations Section */}
            <div className="tool-section">
                <button
                    className={`section-header ${expandedSection === 'batch' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('batch')}
                >
                    <Sparkles size={16} />
                    <span>Batch Operations</span>
                    <span className="expand-icon">{expandedSection === 'batch' ? '−' : '+'}</span>
                </button>

                {expandedSection === 'batch' && (
                    <div className="section-content">
                        <div className="tool-group">
                            <label>Select Operations</label>
                            <div className="batch-checkboxes">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={batchOperations.includes('silence')}
                                        onChange={() => toggleBatchOperation('silence')}
                                    />
                                    Silence Detection
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={batchOperations.includes('beats')}
                                        onChange={() => toggleBatchOperation('beats')}
                                    />
                                    Beat Detection
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={batchOperations.includes('scenes')}
                                        onChange={() => toggleBatchOperation('scenes')}
                                    />
                                    Scene Detection
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={batchOperations.includes('jumpcuts')}
                                        onChange={() => toggleBatchOperation('jumpcuts')}
                                    />
                                    Jump Cut Detection
                                </label>
                            </div>
                            <Button
                                onClick={() => onBatchAnalysis(batchOperations)}
                                disabled={batchOperations.length === 0 || isProcessing}
                                className="tool-btn batch-btn"
                            >
                                Analyze All ({batchOperations.length})
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .ai-tools-panel {
          width: 280px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          position: relative;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(139, 92, 246, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .processing-content {
          text-align: center;
          padding: 24px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #8b5cf6;
          margin-bottom: 12px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin: 12px auto;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          transition: width 0.3s ease;
        }

        .cancel-btn {
          margin-top: 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
        }

        .cancel-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .tool-section {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .section-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .section-header:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .section-header.expanded {
          background: rgba(139, 92, 246, 0.1);
        }

        .expand-icon {
          margin-left: auto;
          font-size: 18px;
          color: #8b5cf6;
        }

        .section-content {
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.2);
        }

        .tool-group {
          margin-bottom: 16px;
        }

        .tool-group:last-child {
          margin-bottom: 0;
        }

        .tool-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #a78bfa;
          margin-bottom: 8px;
        }

        .tool-btn {
          width: 100%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border: none;
          padding: 8px 12px;
          font-size: 12px;
          margin-top: 8px;
        }

        .tool-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
        }

        .tool-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tool-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin: 4px 0 0 0;
          font-style: italic;
        }

        .platform-select,
        .preset-select {
          width: 100%;
          padding: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .platform-select:focus,
        .preset-select:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .batch-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #fff;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .batch-btn {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .batch-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #047857);
        }
      `}</style>
        </div>
    );
}
