/**
 * Video Analysis Utility
 * Provides AI-powered video analysis features including:
 * - Scene detection
 * - Jump cut detection
 * - Black bar detection for auto-crop
 * - Motion analysis for stabilization
 * - Color balance analysis
 */

export interface SceneChange {
    time: number;
    confidence: number;
    difference: number;
}

export interface JumpCut {
    time: number;
    severity: number;
    type: 'motion' | 'color' | 'brightness';
}

export interface BlackBars {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface CropDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
    hasBlackBars: boolean;
}

export interface MotionData {
    time: number;
    motionX: number;
    motionY: number;
    intensity: number;
}

export interface ColorAnalysis {
    avgBrightness: number;
    avgContrast: number;
    avgSaturation: number;
    avgHue: number;
    suggestedAdjustments: {
        brightness: number;
        contrast: number;
        saturation: number;
    };
}

/**
 * Detect scene changes in video
 * @param videoElement - HTML video element
 * @param sensitivity - Detection sensitivity (0.1 to 1.0)
 * @returns Array of scene changes
 */
export async function detectScenes(
    videoElement: HTMLVideoElement,
    sensitivity: number = 0.5
): Promise<SceneChange[]> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    // Use smaller resolution for faster processing
    canvas.width = 160;
    canvas.height = 90;

    const scenes: SceneChange[] = [];
    const duration = videoElement.duration;
    const fps = 5; // Sample at 5 fps for performance
    const interval = 1 / fps;

    let previousHistogram: number[] | null = null;

    for (let time = 0; time < duration; time += interval) {
        videoElement.currentTime = time;
        await new Promise(resolve => {
            videoElement.onseeked = resolve;
        });

        // Draw current frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Calculate histogram
        const histogram = calculateHistogram(imageData);

        if (previousHistogram) {
            // Compare histograms
            const difference = compareHistograms(previousHistogram, histogram);

            // Threshold based on sensitivity
            const threshold = 0.3 * (1 - sensitivity) + 0.7 * sensitivity;

            if (difference > threshold) {
                scenes.push({
                    time,
                    confidence: Math.min(difference / threshold, 1.0),
                    difference
                });
            }
        }

        previousHistogram = histogram;
    }

    // Reset video
    videoElement.currentTime = 0;

    return scenes;
}

/**
 * Detect potential jump cuts
 * @param videoElement - HTML video element
 * @param threshold - Detection threshold (0.1 to 1.0)
 * @returns Array of jump cuts
 */
export async function detectJumpCuts(
    videoElement: HTMLVideoElement,
    threshold: number = 0.6
): Promise<JumpCut[]> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = 160;
    canvas.height = 90;

    const jumpCuts: JumpCut[] = [];
    const duration = videoElement.duration;
    const fps = 10; // Higher fps for jump cut detection
    const interval = 1 / fps;

    let previousFrame: ImageData | null = null;

    for (let time = interval; time < duration; time += interval) {
        videoElement.currentTime = time;
        await new Promise(resolve => {
            videoElement.onseeked = resolve;
        });

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (previousFrame) {
            // Analyze frame differences
            const motionDiff = calculateMotionDifference(previousFrame, currentFrame);
            const colorDiff = calculateColorDifference(previousFrame, currentFrame);
            const brightnessDiff = calculateBrightnessDifference(previousFrame, currentFrame);

            // Detect abrupt changes
            if (motionDiff > threshold) {
                jumpCuts.push({
                    time,
                    severity: motionDiff,
                    type: 'motion'
                });
            } else if (colorDiff > threshold) {
                jumpCuts.push({
                    time,
                    severity: colorDiff,
                    type: 'color'
                });
            } else if (brightnessDiff > threshold) {
                jumpCuts.push({
                    time,
                    severity: brightnessDiff,
                    type: 'brightness'
                });
            }
        }

        previousFrame = currentFrame;
    }

    videoElement.currentTime = 0;
    return jumpCuts;
}

/**
 * Detect black bars in video
 * @param videoElement - HTML video element
 * @returns Crop dimensions to remove black bars
 */
export async function detectBlackBars(
    videoElement: HTMLVideoElement
): Promise<CropDimensions> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Sample middle of video
    videoElement.currentTime = videoElement.duration / 2;
    await new Promise(resolve => {
        videoElement.onseeked = resolve;
    });

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const blackThreshold = 20; // Pixel values below this are considered black

    // Detect top black bar
    let top = 0;
    for (let y = 0; y < canvas.height; y++) {
        if (!isRowBlack(imageData, y, blackThreshold)) break;
        top = y + 1;
    }

    // Detect bottom black bar
    let bottom = 0;
    for (let y = canvas.height - 1; y >= 0; y--) {
        if (!isRowBlack(imageData, y, blackThreshold)) break;
        bottom = canvas.height - y;
    }

    // Detect left black bar
    let left = 0;
    for (let x = 0; x < canvas.width; x++) {
        if (!isColumnBlack(imageData, x, blackThreshold)) break;
        left = x + 1;
    }

    // Detect right black bar
    let right = 0;
    for (let x = canvas.width - 1; x >= 0; x--) {
        if (!isColumnBlack(imageData, x, blackThreshold)) break;
        right = canvas.width - x;
    }

    videoElement.currentTime = 0;

    const hasBlackBars = top > 0 || bottom > 0 || left > 0 || right > 0;

    return {
        x: left,
        y: top,
        width: canvas.width - left - right,
        height: canvas.height - top - bottom,
        hasBlackBars
    };
}

/**
 * Analyze motion in video for stabilization
 * @param videoElement - HTML video element
 * @returns Array of motion data
 */
export async function analyzeMotion(
    videoElement: HTMLVideoElement
): Promise<MotionData[]> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = 160;
    canvas.height = 90;

    const motionData: MotionData[] = [];
    const duration = videoElement.duration;
    const fps = 10;
    const interval = 1 / fps;

    let previousFrame: ImageData | null = null;

    for (let time = 0; time < duration; time += interval) {
        videoElement.currentTime = time;
        await new Promise(resolve => {
            videoElement.onseeked = resolve;
        });

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (previousFrame) {
            const motion = calculateOpticalFlow(previousFrame, currentFrame);
            motionData.push({
                time,
                motionX: motion.x,
                motionY: motion.y,
                intensity: Math.sqrt(motion.x * motion.x + motion.y * motion.y)
            });
        }

        previousFrame = currentFrame;
    }

    videoElement.currentTime = 0;
    return motionData;
}

/**
 * Analyze color balance across entire video
 * @param videoElement - HTML video element
 * @returns Color analysis with suggested adjustments
 */
export async function analyzeColorBalance(
    videoElement: HTMLVideoElement
): Promise<ColorAnalysis> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = 160;
    canvas.height = 90;

    const samples: { brightness: number; saturation: number; hue: number }[] = [];
    const duration = videoElement.duration;
    const sampleCount = 10; // Sample 10 frames throughout video
    const interval = duration / sampleCount;

    for (let i = 0; i < sampleCount; i++) {
        const time = i * interval;
        videoElement.currentTime = time;
        await new Promise(resolve => {
            videoElement.onseeked = resolve;
        });

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const analysis = analyzeFrameColor(imageData);
        samples.push(analysis);
    }

    // Calculate averages
    const avgBrightness = samples.reduce((sum, s) => sum + s.brightness, 0) / samples.length;
    const avgSaturation = samples.reduce((sum, s) => sum + s.saturation, 0) / samples.length;
    const avgHue = samples.reduce((sum, s) => sum + s.hue, 0) / samples.length;

    // Calculate suggested adjustments (target: brightness=50, saturation=50)
    const targetBrightness = 50;
    const targetSaturation = 50;

    const brightnessAdjustment = 100 + ((targetBrightness - avgBrightness) * 2);
    const saturationAdjustment = 100 + ((targetSaturation - avgSaturation) * 2);

    // Calculate contrast based on variance
    const brightnessVariance = samples.reduce((sum, s) =>
        sum + Math.pow(s.brightness - avgBrightness, 2), 0) / samples.length;
    const avgContrast = Math.sqrt(brightnessVariance);
    const contrastAdjustment = avgContrast < 15 ? 110 : 100; // Boost if low variance

    videoElement.currentTime = 0;

    return {
        avgBrightness,
        avgContrast,
        avgSaturation,
        avgHue,
        suggestedAdjustments: {
            brightness: Math.max(50, Math.min(150, brightnessAdjustment)),
            contrast: Math.max(80, Math.min(120, contrastAdjustment)),
            saturation: Math.max(80, Math.min(120, saturationAdjustment))
        }
    };
}

// Helper functions

function calculateHistogram(imageData: ImageData): number[] {
    const histogram = new Array(256).fill(0);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const brightness = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
        histogram[brightness]++;
    }

    // Normalize
    const total = imageData.width * imageData.height;
    return histogram.map(count => count / total);
}

function compareHistograms(hist1: number[], hist2: number[]): number {
    let difference = 0;
    for (let i = 0; i < hist1.length; i++) {
        difference += Math.abs(hist1[i] - hist2[i]);
    }
    return difference / 2; // Normalize to 0-1
}

function calculateMotionDifference(frame1: ImageData, frame2: ImageData): number {
    let diff = 0;
    const data1 = frame1.data;
    const data2 = frame2.data;

    for (let i = 0; i < data1.length; i += 4) {
        const d = Math.abs(data1[i] - data2[i]) +
            Math.abs(data1[i + 1] - data2[i + 1]) +
            Math.abs(data1[i + 2] - data2[i + 2]);
        diff += d;
    }

    return diff / (frame1.width * frame1.height * 3 * 255);
}

function calculateColorDifference(frame1: ImageData, frame2: ImageData): number {
    const color1 = getAverageColor(frame1);
    const color2 = getAverageColor(frame2);

    const diff = Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );

    return diff / (255 * Math.sqrt(3));
}

function calculateBrightnessDifference(frame1: ImageData, frame2: ImageData): number {
    const brightness1 = getAverageBrightness(frame1);
    const brightness2 = getAverageBrightness(frame2);

    return Math.abs(brightness1 - brightness2) / 255;
}

function getAverageColor(imageData: ImageData): { r: number; g: number; b: number } {
    const data = imageData.data;
    let r = 0, g = 0, b = 0;

    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }

    const count = imageData.width * imageData.height;
    return { r: r / count, g: g / count, b: b / count };
}

function getAverageBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let brightness = 0;

    for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    return brightness / (imageData.width * imageData.height);
}

function isRowBlack(imageData: ImageData, y: number, threshold: number): boolean {
    const data = imageData.data;
    const width = imageData.width;

    for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > threshold) return false;
    }

    return true;
}

function isColumnBlack(imageData: ImageData, x: number, threshold: number): boolean {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > threshold) return false;
    }

    return true;
}

function calculateOpticalFlow(frame1: ImageData, frame2: ImageData): { x: number; y: number } {
    // Simplified optical flow using block matching
    const blockSize = 16;
    const searchRange = 8;

    let totalX = 0;
    let totalY = 0;
    let count = 0;

    for (let y = 0; y < frame1.height - blockSize; y += blockSize) {
        for (let x = 0; x < frame1.width - blockSize; x += blockSize) {
            const motion = findBestMatch(frame1, frame2, x, y, blockSize, searchRange);
            totalX += motion.x;
            totalY += motion.y;
            count++;
        }
    }

    return {
        x: count > 0 ? totalX / count : 0,
        y: count > 0 ? totalY / count : 0
    };
}

function findBestMatch(
    frame1: ImageData,
    frame2: ImageData,
    x: number,
    y: number,
    blockSize: number,
    searchRange: number
): { x: number; y: number } {
    let bestMatch = { x: 0, y: 0 };
    let bestError = Infinity;

    for (let dy = -searchRange; dy <= searchRange; dy++) {
        for (let dx = -searchRange; dx <= searchRange; dx++) {
            const error = calculateBlockError(frame1, frame2, x, y, x + dx, y + dy, blockSize);
            if (error < bestError) {
                bestError = error;
                bestMatch = { x: dx, y: dy };
            }
        }
    }

    return bestMatch;
}

function calculateBlockError(
    frame1: ImageData,
    frame2: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    blockSize: number
): number {
    let error = 0;
    const data1 = frame1.data;
    const data2 = frame2.data;
    const width = frame1.width;

    for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
            const i1 = ((y1 + dy) * width + (x1 + dx)) * 4;
            const i2 = ((y2 + dy) * width + (x2 + dx)) * 4;

            if (i2 >= 0 && i2 < data2.length) {
                error += Math.abs(data1[i1] - data2[i2]) +
                    Math.abs(data1[i1 + 1] - data2[i2 + 1]) +
                    Math.abs(data1[i1 + 2] - data2[i2 + 2]);
            }
        }
    }

    return error;
}

function analyzeFrameColor(imageData: ImageData): { brightness: number; saturation: number; hue: number } {
    const data = imageData.data;
    let totalBrightness = 0;
    let totalSaturation = 0;
    let totalHue = 0;
    const count = imageData.width * imageData.height;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        // Brightness (0-100)
        totalBrightness += (max * 100);

        // Saturation (0-100)
        totalSaturation += max === 0 ? 0 : (delta / max * 100);

        // Hue (0-360)
        let hue = 0;
        if (delta !== 0) {
            if (max === r) {
                hue = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                hue = 60 * (((b - r) / delta) + 2);
            } else {
                hue = 60 * (((r - g) / delta) + 4);
            }
        }
        totalHue += hue < 0 ? hue + 360 : hue;
    }

    return {
        brightness: totalBrightness / count,
        saturation: totalSaturation / count,
        hue: totalHue / count
    };
}
