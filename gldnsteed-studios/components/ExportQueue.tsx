import React, { useState } from 'react';
import { Download, X, Pause, Play, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ExportJob } from '../types';
import { getEstimatedTimeRemaining, formatEstimatedTime } from '../utils/export-queue';

interface ExportQueueProps {
    queue: ExportJob[];
    onPause: (jobId: string) => void;
    onResume: (jobId: string) => void;
    onCancel: (jobId: string) => void;
    onDownload: (jobId: string) => void;
    onClearCompleted: () => void;
}

export function ExportQueue({
    queue,
    onPause,
    onResume,
    onCancel,
    onDownload,
    onClearCompleted
}: ExportQueueProps) {
    const activeJobs = queue.filter(j => j.status === 'processing' || j.status === 'queued');
    const completedJobs = queue.filter(j => j.status === 'completed' || j.status === 'failed');

    const getStatusColor = (status: ExportJob['status']) => {
        switch (status) {
            case 'completed': return 'text-green-400';
            case 'failed': return 'text-red-400';
            case 'processing': return 'text-blue-400';
            case 'paused': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: ExportJob['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} />;
            case 'failed': return <XCircle size={16} />;
            case 'processing': return <Clock size={16} className="animate-spin" />;
            case 'paused': return <Pause size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="export-queue">
            <div className="queue-header">
                <h3>Export Queue</h3>
                {completedJobs.length > 0 && (
                    <button onClick={onClearCompleted} className="clear-btn">
                        Clear Completed
                    </button>
                )}
            </div>

            {queue.length === 0 ? (
                <div className="empty-state">
                    <p>No exports in queue</p>
                </div>
            ) : (
                <div className="queue-list">
                    {activeJobs.map(job => (
                        <div key={job.id} className="queue-item">
                            <div className="job-info">
                                <div className="job-header">
                                    <span className={`job-status ${getStatusColor(job.status)}`}>
                                        {getStatusIcon(job.status)}
                                        {job.status.toUpperCase()}
                                    </span>
                                    <span className="job-name">{job.name}</span>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>

                                <div className="job-details">
                                    <span>{Math.round(job.progress)}%</span>
                                    {job.status === 'processing' && job.startTime && (
                                        <span>
                                            ~{formatEstimatedTime(getEstimatedTimeRemaining(job))} remaining
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="job-actions">
                                {job.status === 'processing' && (
                                    <button onClick={() => onPause(job.id)} title="Pause">
                                        <Pause size={16} />
                                    </button>
                                )}
                                {job.status === 'paused' && (
                                    <button onClick={() => onResume(job.id)} title="Resume">
                                        <Play size={16} />
                                    </button>
                                )}
                                <button onClick={() => onCancel(job.id)} title="Cancel">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {completedJobs.map(job => (
                        <div key={job.id} className={`queue-item ${job.status}`}>
                            <div className="job-info">
                                <div className="job-header">
                                    <span className={`job-status ${getStatusColor(job.status)}`}>
                                        {getStatusIcon(job.status)}
                                        {job.status.toUpperCase()}
                                    </span>
                                    <span className="job-name">{job.name}</span>
                                </div>

                                {job.status === 'completed' && job.outputSize && (
                                    <div className="job-details">
                                        <span>{job.outputSize}</span>
                                    </div>
                                )}

                                {job.status === 'failed' && job.error && (
                                    <div className="error-message">{job.error}</div>
                                )}
                            </div>

                            <div className="job-actions">
                                {job.status === 'completed' && (
                                    <button onClick={() => onDownload(job.id)} title="Download">
                                        <Download size={16} />
                                    </button>
                                )}
                                <button onClick={() => onCancel(job.id)} title="Remove">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .export-queue {
          background: #2D2D2D;
          border-radius: 8px;
          padding: 16px;
          max-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .queue-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .clear-btn {
          padding: 4px 12px;
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.4);
          border-radius: 4px;
          color: #FF6B35;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: rgba(255, 107, 53, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 32px;
          color: #666;
          font-size: 14px;
        }

        .queue-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .queue-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .queue-item.completed {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .queue-item.failed {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .job-info {
          flex: 1;
          min-width: 0;
        }

        .job-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .job-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .job-name {
          font-size: 13px;
          color: #fff;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6B35 0%, #FF8C5A 100%);
          transition: width 0.3s ease;
        }

        .job-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888;
        }

        .error-message {
          font-size: 11px;
          color: #ef4444;
          margin-top: 4px;
        }

        .job-actions {
          display: flex;
          gap: 6px;
        }

        .job-actions button {
          padding: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 4px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-center;
        }

        .job-actions button:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
      `}</style>
        </div>
    );
}
