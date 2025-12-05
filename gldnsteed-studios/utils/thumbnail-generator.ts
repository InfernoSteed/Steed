/**
 * Thumbnail Generator
 * Extracts video frames for scrubbing preview
 */

export interface ThumbnailData {
    thumbnails: string[]; // Base64 data URLs
    interval: number; // Seconds between thumbnails
    duration: number;
}

/**
 * Generate thumbnails from video URL
 */
export async function generateThumbnails(
    videoUrl: string,
    interval: number = 1,
    width: number = 160,
    height: number = 90
): Promise<ThumbnailData> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.src = videoUrl;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        const thumbnails: string[] = [];
        let currentTime = 0;

        video.onloadedmetadata = () => {
            const duration = video.duration;

            const captureFrame = () => {
                if (currentTime >= duration) {
                    resolve({
                        thumbnails,
                        interval,
                        duration
                    });
                    return;
                }

                video.currentTime = currentTime;
            };

            video.onseeked = () => {
                // Draw frame to canvas
                ctx.drawImage(video, 0, 0, width, height);

                // Convert to base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                thumbnails.push(dataUrl);

                currentTime += interval;
                captureFrame();
            };

            captureFrame();
        };

        video.onerror = () => {
            reject(new Error('Failed to load video'));
        };
    });
}

/**
 * Get thumbnail at specific time
 */
export function getThumbnailAtTime(
    thumbnailData: ThumbnailData,
    time: number
): string {
    const index = Math.floor(time / thumbnailData.interval);
    const clampedIndex = Math.max(0, Math.min(index, thumbnailData.thumbnails.length - 1));
    return thumbnailData.thumbnails[clampedIndex];
}

/**
 * Cache thumbnails in IndexedDB
 */
export async function cacheThumbnails(
    videoUrl: string,
    data: ThumbnailData
): Promise<void> {
    const db = await openThumbnailDB();
    const transaction = db.transaction(['thumbnails'], 'readwrite');
    const store = transaction.objectStore('thumbnails');

    await store.put({
        url: videoUrl,
        data,
        timestamp: Date.now()
    });
}

/**
 * Get cached thumbnails
 */
export async function getCachedThumbnails(
    videoUrl: string
): Promise<ThumbnailData | null> {
    const db = await openThumbnailDB();
    const transaction = db.transaction(['thumbnails'], 'readonly');
    const store = transaction.objectStore('thumbnails');

    return new Promise((resolve, reject) => {
        const request = store.get(videoUrl);
        request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Open IndexedDB for thumbnail caching
 */
function openThumbnailDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ThumbnailCache', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('thumbnails')) {
                db.createObjectStore('thumbnails', { keyPath: 'url' });
            }
        };
    });
}

/**
 * Generate single thumbnail at specific time
 */
export async function generateSingleThumbnail(
    videoUrl: string,
    time: number,
    width: number = 160,
    height: number = 90
): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.src = videoUrl;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        video.onloadedmetadata = () => {
            video.currentTime = time;
        };

        video.onseeked = () => {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
        };

        video.onerror = () => {
            reject(new Error('Failed to load video'));
        };
    });
}
