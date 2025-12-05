
export const WORKER_CODE = `
self.onmessage = async (e) => {
  const { id, type, payload } = e.data;
  try {
    let result;
    
    if (type === 'AUDIO_WAVEFORM') {
       // payload: { channelData: Float32Array, samples: number }
       const { channelData, samples } = payload;
       const blockSize = Math.floor(channelData.length / samples);
       const waveform = [];
       
       for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
             sum += Math.abs(channelData[i * blockSize + j]);
          }
          waveform.push(sum / blockSize);
       }
       
       // Normalize
       const max = Math.max(...waveform);
       result = waveform.map(n => max === 0 ? 0 : n / max);
    } else if (type === 'ANALYZE_COLOR') {
        const { data } = payload;
        // data is Uint8ClampedArray (RGBA)
        let r = 0, g = 0, b = 0;
        const len = data.length;
        
        // Sampling (every 10th pixel for speed optimization)
        const step = 40; // 4 channels * 10 pixels
        let sampledCount = 0;

        for (let i = 0; i < len; i += step) {
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            sampledCount++;
        }

        if (sampledCount > 0) {
            const avgR = r / sampledCount;
            const avgG = g / sampledCount;
            const avgB = b / sampledCount;
            
            // Calculate Luma (Rec. 601)
            const luma = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

            // Auto Correction Logic
            // Target Luma ~128 (Mid-gray)
            // Formula: Base 100 + (Difference * dampening)
            const brightness = Math.max(80, Math.min(130, 100 + (128 - luma) * 0.6));
            
            // Simple heuristic: Boost contrast/saturation slightly to "pop"
            // If luma is very extreme, be gentle with contrast
            const contrast = 110; 
            const saturation = 110;

            result = {
                brightness,
                contrast,
                saturation
            };
        } else {
            result = null;
        }
    } else if (type === 'FILTER_FRAME') {
        // Placeholder for OffscreenCanvas logic if needed
        result = null;
    }

    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: err.message });
  }
};
`;

export const createWorker = (): Worker => {
  const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};
