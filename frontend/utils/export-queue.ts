/**
 * Export Queue Management
 * Handles multiple concurrent exports with progress tracking
 */

import { ExportJob, ExportSettings } from '../types';

const MAX_CONCURRENT_EXPORTS = 2;

/**
 * Create a new export job
 */
export function createExportJob(name: string, settings: ExportSettings): ExportJob {
    return {
        id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        settings,
        status: 'queued',
        progress: 0
    };
}

/**
 * Get active (processing) jobs
 */
export function getActiveJobs(queue: ExportJob[]): ExportJob[] {
    return queue.filter(job => job.status === 'processing');
}

/**
 * Get queued jobs
 */
export function getQueuedJobs(queue: ExportJob[]): ExportJob[] {
    return queue.filter(job => job.status === 'queued');
}

/**
 * Can start new export?
 */
export function canStartExport(queue: ExportJob[]): boolean {
    return getActiveJobs(queue).length < MAX_CONCURRENT_EXPORTS;
}

/**
 * Get next job to process
 */
export function getNextJob(queue: ExportJob[]): ExportJob | null {
    const queued = getQueuedJobs(queue);
    return queued.length > 0 ? queued[0] : null;
}

/**
 * Update job status
 */
export function updateJobStatus(
    queue: ExportJob[],
    jobId: string,
    status: ExportJob['status']
): ExportJob[] {
    return queue.map(job =>
        job.id === jobId ? { ...job, status } : job
    );
}

/**
 * Update job progress
 */
export function updateJobProgress(
    queue: ExportJob[],
    jobId: string,
    progress: number
): ExportJob[] {
    return queue.map(job =>
        job.id === jobId ? { ...job, progress } : job
    );
}

/**
 * Mark job as completed
 */
export function completeJob(
    queue: ExportJob[],
    jobId: string,
    blob: Blob,
    size: string
): ExportJob[] {
    return queue.map(job =>
        job.id === jobId
            ? {
                ...job,
                status: 'completed',
                progress: 100,
                endTime: Date.now(),
                outputBlob: blob,
                outputSize: size
            }
            : job
    );
}

/**
 * Mark job as failed
 */
export function failJob(
    queue: ExportJob[],
    jobId: string,
    error: string
): ExportJob[] {
    return queue.map(job =>
        job.id === jobId
            ? {
                ...job,
                status: 'failed',
                endTime: Date.now(),
                error
            }
            : job
    );
}

/**
 * Remove job from queue
 */
export function removeJob(queue: ExportJob[], jobId: string): ExportJob[] {
    return queue.filter(job => job.id !== jobId);
}

/**
 * Pause job
 */
export function pauseJob(queue: ExportJob[], jobId: string): ExportJob[] {
    return queue.map(job =>
        job.id === jobId && job.status === 'processing'
            ? { ...job, status: 'paused' }
            : job
    );
}

/**
 * Resume job
 */
export function resumeJob(queue: ExportJob[], jobId: string): ExportJob[] {
    return queue.map(job =>
        job.id === jobId && job.status === 'paused'
            ? { ...job, status: 'queued' }
            : job
    );
}

/**
 * Clear completed jobs
 */
export function clearCompleted(queue: ExportJob[]): ExportJob[] {
    return queue.filter(job => job.status !== 'completed' && job.status !== 'failed');
}

/**
 * Get estimated time remaining
 */
export function getEstimatedTimeRemaining(job: ExportJob): number {
    if (!job.startTime || job.progress === 0) return 0;

    const elapsed = Date.now() - job.startTime;
    const rate = job.progress / elapsed;
    const remaining = (100 - job.progress) / rate;

    return Math.round(remaining / 1000); // Convert to seconds
}

/**
 * Format time for display
 */
export function formatEstimatedTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}
