import React from 'react';
import { AudioEffect, AudioEffectType, EQ3Params, CompressorParams, ReverbParams, GainParams } from '../types';
import { Plus, Trash2, Sliders, Activity, Zap, Volume2, Power } from 'lucide-react';
import { generateId } from '../utils';
import { RangeSlider } from './RangeSlider';

interface AudioEffectsListProps {
    effects: AudioEffect[];
    onChange: (effects: AudioEffect[]) => void;
}

export const AudioEffectsList: React.FC<AudioEffectsListProps> = ({ effects, onChange }) => {

    const handleAddEffect = (type: AudioEffectType) => {
        const newEffect: AudioEffect = {
            id: generateId(),
            type,
            enabled: true,
            params: getDefaultParams(type)
        };
        onChange([...effects, newEffect]);
    };

    const handleUpdateEffect = (id: string, params: any) => {
        onChange(effects.map(e => e.id === id ? { ...e, params: { ...e.params, ...params } } : e));
    };

    const handleToggleEffect = (id: string) => {
        onChange(effects.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
    };

    const handleRemoveEffect = (id: string) => {
        onChange(effects.filter(e => e.id !== id));
    };

    const getDefaultParams = (type: AudioEffectType): any => {
        switch (type) {
            case 'eq3': return { low: 0, mid: 0, high: 0, lowFreq: 400, highFreq: 2500 };
            case 'compressor': return { threshold: -24, ratio: 4, attack: 0.003, release: 0.25, knee: 30 };
            case 'reverb': return { mix: 0.3, decay: 2.0 };
            case 'gain': return { gain: 0 };
            default: return {};
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase text-[#6B6B6B]">Effects Chain</label>
                <div className="flex gap-1">
                    <button onClick={() => handleAddEffect('eq3')} className="p-1 hover:bg-[#333] rounded text-[#6B6B6B] hover:text-white" title="Add EQ"><Sliders size={12} /></button>
                    <button onClick={() => handleAddEffect('compressor')} className="p-1 hover:bg-[#333] rounded text-[#6B6B6B] hover:text-white" title="Add Compressor"><Activity size={12} /></button>
                    <button onClick={() => handleAddEffect('reverb')} className="p-1 hover:bg-[#333] rounded text-[#6B6B6B] hover:text-white" title="Add Reverb"><Zap size={12} /></button>
                    <button onClick={() => handleAddEffect('gain')} className="p-1 hover:bg-[#333] rounded text-[#6B6B6B] hover:text-white" title="Add Gain"><Volume2 size={12} /></button>
                </div>
            </div>

            {effects.length === 0 && (
                <div className="text-center py-4 border border-dashed border-[#333] rounded text-xs text-[#6B6B6B]">
                    No effects added
                </div>
            )}

            {effects.map((effect, index) => (
                <div key={effect.id} className="bg-[#222] border border-[#333] rounded overflow-hidden">
                    <div className="h-8 flex items-center justify-between px-2 bg-[#2D2D2D] border-b border-[#333]">
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleEffect(effect.id)} className={`p-1 rounded ${effect.enabled ? 'text-theme-accent' : 'text-[#6B6B6B]'}`}>
                                <Power size={12} />
                            </button>
                            <span className="text-xs font-bold text-[#E0E0E0] uppercase">{effect.type}</span>
                        </div>
                        <button onClick={() => handleRemoveEffect(effect.id)} className="text-[#6B6B6B] hover:text-red-500">
                            <Trash2 size={12} />
                        </button>
                    </div>

                    {effect.enabled && (
                        <div className="p-2 space-y-2">
                            {effect.type === 'eq3' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-8 text-[#888]">Low</span>
                                        <RangeSlider value={(effect.params as EQ3Params).low} min={-24} max={24} onChange={(e) => handleUpdateEffect(effect.id, { low: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-8 text-[#888]">Mid</span>
                                        <RangeSlider value={(effect.params as EQ3Params).mid} min={-24} max={24} onChange={(e) => handleUpdateEffect(effect.id, { mid: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-8 text-[#888]">High</span>
                                        <RangeSlider value={(effect.params as EQ3Params).high} min={-24} max={24} onChange={(e) => handleUpdateEffect(effect.id, { high: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                </>
                            )}
                            {effect.type === 'compressor' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-12 text-[#888]">Thresh</span>
                                        <RangeSlider value={(effect.params as CompressorParams).threshold} min={-100} max={0} onChange={(e) => handleUpdateEffect(effect.id, { threshold: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-12 text-[#888]">Ratio</span>
                                        <RangeSlider value={(effect.params as CompressorParams).ratio} min={1} max={20} onChange={(e) => handleUpdateEffect(effect.id, { ratio: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                </>
                            )}
                            {effect.type === 'reverb' && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-8 text-[#888]">Mix</span>
                                        <RangeSlider value={(effect.params as ReverbParams).mix} min={0} max={1} step={0.01} onChange={(e) => handleUpdateEffect(effect.id, { mix: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] w-8 text-[#888]">Decay</span>
                                        <RangeSlider value={(effect.params as ReverbParams).decay} min={0.1} max={10} step={0.1} onChange={(e) => handleUpdateEffect(effect.id, { decay: parseFloat(e.target.value) })} className="flex-1" />
                                    </div>
                                </>
                            )}
                            {effect.type === 'gain' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] w-8 text-[#888]">Gain</span>
                                    <RangeSlider value={(effect.params as GainParams).gain} min={-60} max={24} onChange={(e) => handleUpdateEffect(effect.id, { gain: parseFloat(e.target.value) })} className="flex-1" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
