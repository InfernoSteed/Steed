import { AudioEffect, EQ3Params, CompressorParams, ReverbParams, GainParams } from '../types';

export const createEffectChain = (
    ctx: AudioContext,
    source: AudioNode,
    destination: AudioNode,
    effects: AudioEffect[]
) => {
    let currentNode = source;

    effects.forEach(effect => {
        if (!effect.enabled) return;

        switch (effect.type) {
            case 'eq3': {
                const params = effect.params as EQ3Params;

                // Low Shelf
                const low = ctx.createBiquadFilter();
                low.type = 'lowshelf';
                low.frequency.value = params.lowFreq || 400;
                low.gain.value = params.low;

                // Mid Peaking
                const mid = ctx.createBiquadFilter();
                mid.type = 'peaking';
                mid.frequency.value = 1000; // Center freq
                mid.Q.value = 1;
                mid.gain.value = params.mid;

                // High Shelf
                const high = ctx.createBiquadFilter();
                high.type = 'highshelf';
                high.frequency.value = params.highFreq || 2500;
                high.gain.value = params.high;

                currentNode.connect(low);
                low.connect(mid);
                mid.connect(high);
                currentNode = high;
                break;
            }
            case 'compressor': {
                const params = effect.params as CompressorParams;
                const comp = ctx.createDynamicsCompressor();
                comp.threshold.value = params.threshold;
                comp.ratio.value = params.ratio;
                comp.attack.value = params.attack;
                comp.release.value = params.release;
                if (params.knee) comp.knee.value = params.knee;

                currentNode.connect(comp);
                currentNode = comp;
                break;
            }
            case 'gain': {
                const params = effect.params as GainParams;
                const gain = ctx.createGain();
                // Convert dB to linear gain: 10^(dB/20)
                gain.gain.value = Math.pow(10, params.gain / 20);

                currentNode.connect(gain);
                currentNode = gain;
                break;
            }
            case 'reverb': {
                const params = effect.params as ReverbParams;
                // Simple convolution reverb requires an impulse response buffer.
                // For now, we'll simulate a simple delay/decay or just a placeholder gain if no buffer.
                // To do this properly we need to load an IR file.
                // For this MVP, let's use a ConvolverNode but generate a synthetic impulse.

                const convolver = ctx.createConvolver();
                const duration = params.decay;
                const decay = 2.0;
                const rate = ctx.sampleRate;
                const length = rate * duration;
                const impulse = ctx.createBuffer(2, length, rate);
                const left = impulse.getChannelData(0);
                const right = impulse.getChannelData(1);

                for (let i = 0; i < length; i++) {
                    // Simple exponential decay noise
                    const n = i / length;
                    left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
                    right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
                }
                convolver.buffer = impulse;

                // Wet/Dry Mix
                const dry = ctx.createGain();
                const wet = ctx.createGain();
                dry.gain.value = 1 - params.mix;
                wet.gain.value = params.mix;

                currentNode.connect(dry);
                currentNode.connect(convolver);
                convolver.connect(wet);

                const merger = ctx.createChannelMerger(2); // Merge back for next stage? 
                // Actually, simpler to just sum them into a gain node
                const output = ctx.createGain();
                dry.connect(output);
                wet.connect(output);

                currentNode = output;
                break;
            }
        }
    });

    currentNode.connect(destination);
};
