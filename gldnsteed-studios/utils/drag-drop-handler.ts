/**
 * Desktop File Drag-and-Drop Handler
 * Handles file drops from desktop to timeline
 */

export interface DropZoneConfig {
    acceptedTypes: string[];
    maxFileSize?: number; // in bytes
    onDrop: (files: File[], dropPosition?: { x: number; y: number; time?: number }) => void;
    onError?: (error: string) => void;
}

/**
 * Setup drag-and-drop handlers
 */
export function setupDragAndDrop(
    element: HTMLElement,
    config: DropZoneConfig
): () => void {
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }

        element.classList.add('drag-over');
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        element.classList.remove('drag-over');
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        element.classList.remove('drag-over');

        if (!e.dataTransfer) return;

        const files = Array.from(e.dataTransfer.files);

        // Filter by accepted types
        const validFiles = files.filter(file => {
            const isValidType = config.acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    const category = type.split('/')[0];
                    return file.type.startsWith(category + '/');
                }
                return file.type === type;
            });

            const isValidSize = !config.maxFileSize || file.size <= config.maxFileSize;

            if (!isValidType) {
                config.onError?.(`File type not supported: ${file.type}`);
                return false;
            }

            if (!isValidSize) {
                config.onError?.(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            const dropPosition = {
                x: e.clientX,
                y: e.clientY
            };

            config.onDrop(validFiles, dropPosition);
        }
    };

    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);

    // Cleanup function
    return () => {
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('drop', handleDrop);
    };
}

/**
 * Create file from dropped file
 */
export async function processDroppedFile(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{
    url: string;
    duration: number;
    width?: number;
    height?: number;
    format: string;
}> {
    const url = URL.createObjectURL(file);
    const format = file.type.split('/')[1] || 'unknown';

    if (file.type.startsWith('video/')) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = url;

            video.onloadedmetadata = () => {
                resolve({
                    url,
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    format
                });
            };

            video.onerror = () => {
                reject(new Error('Failed to load video'));
            };
        });
    } else if (file.type.startsWith('audio/')) {
        return new Promise((resolve, reject) => {
            const audio = document.createElement('audio');
            audio.src = url;

            audio.onloadedmetadata = () => {
                resolve({
                    url,
                    duration: audio.duration,
                    format
                });
            };

            audio.onerror = () => {
                reject(new Error('Failed to load audio'));
            };
        });
    } else if (file.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;

            img.onload = () => {
                resolve({
                    url,
                    duration: 5, // Default 5 seconds for images
                    width: img.width,
                    height: img.height,
                    format
                });
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        });
    }

    throw new Error('Unsupported file type');
}

/**
 * Calculate drop position on timeline
 */
export function calculateTimelineDropPosition(
    dropX: number,
    dropY: number,
    timelineElement: HTMLElement,
    pixelsPerSecond: number,
    scrollLeft: number
): {
    time: number;
    trackIndex: number;
} {
    const rect = timelineElement.getBoundingClientRect();
    const relativeX = dropX - rect.left + scrollLeft;
    const relativeY = dropY - rect.top;

    const time = relativeX / pixelsPerSecond;
    const trackIndex = Math.floor(relativeY / 60); // Assuming 60px track height

    return {
        time: Math.max(0, time),
        trackIndex: Math.max(0, trackIndex)
    };
}

/**
 * Show drop indicator overlay
 */
export function showDropIndicator(
    element: HTMLElement,
    show: boolean
): void {
    if (show) {
        element.style.outline = '3px dashed #FF6B35';
        element.style.outlineOffset = '4px';
        element.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
    } else {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.backgroundColor = '';
    }
}

/**
 * Batch process multiple files
 */
export async function batchProcessFiles(
    files: File[],
    onProgress?: (current: number, total: number, fileName: string) => void
): Promise<Array<{
    file: File;
    url: string;
    duration: number;
    width?: number;
    height?: number;
    format: string;
}>> {
    const results = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress?.(i + 1, files.length, file.name);

        try {
            const data = await processDroppedFile(file);
            results.push({ file, ...data });
        } catch (error) {
            console.error(`Failed to process ${file.name}:`, error);
        }
    }

    return results;
}
