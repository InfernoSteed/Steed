import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Template, Track } from '../types';
import { PRESET_TEMPLATES, getCustomTemplates, saveCustomTemplate, deleteCustomTemplate } from '../utils/templates';
import { generateId, formatDuration } from '../utils';
import { LayoutTemplate, X, Save, Trash2, PlayCircle, Clock } from 'lucide-react';

interface TemplateModalProps {
  currentTracks: Track[];
  currentDuration: number;
  onClose: () => void;
  onLoadTemplate: (template: Template) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ 
    currentTracks, currentDuration, onClose, onLoadTemplate 
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleSaveCurrent = () => {
      if (!newTemplateName.trim()) return;
      
      const newTemplate: Template = {
          id: `custom-${generateId()}`,
          name: newTemplateName,
          description: `Custom template saved on ${new Date().toLocaleDateString()}`,
          category: 'custom',
          duration: currentDuration,
          tracks: currentTracks, // Saves the current state of tracks
      };
      
      saveCustomTemplate(newTemplate);
      setCustomTemplates(getCustomTemplates());
      setNewTemplateName('');
      setShowSaveForm(false);
      setActiveTab('custom');
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to delete this template?')) {
          deleteCustomTemplate(id);
          setCustomTemplates(getCustomTemplates());
      }
  };

  const displayedTemplates = activeTab === 'presets' ? PRESET_TEMPLATES : customTemplates;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-theme-panel border border-theme-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-surface">
            <h2 className="text-xl font-bold text-theme-text-highlight flex items-center gap-2">
                <LayoutTemplate className="text-theme-accent" />
                Project Templates
            </h2>
            <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme-border bg-theme-panel">
            <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-4 type-h3 text-[12px] tracking-wider transition-colors ${activeTab === 'presets' ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-surface/10' : 'text-theme-text-muted hover:text-theme-text'}`}
            >
                Presets ({PRESET_TEMPLATES.length})
            </button>
            <button 
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-4 type-h3 text-[12px] tracking-wider transition-colors ${activeTab === 'custom' ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-surface/10' : 'text-theme-text-muted hover:text-theme-text'}`}
            >
                My Templates ({customTemplates.length})
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-theme-bg custom-scrollbar">
            
            {/* Save Form (Only in Custom Tab) */}
            {activeTab === 'custom' && (
                <div className="mb-8 p-4 bg-theme-surface border border-theme-border rounded-lg">
                    {!showSaveForm ? (
                        <Button 
                            variant="primary" 
                            onClick={() => setShowSaveForm(true)} 
                            className="w-full py-3 border-dashed border-2 border-theme-border bg-transparent hover:bg-theme-panel text-theme-text-muted hover:text-theme-accent"
                            icon={<Save size={18} />}
                        >
                            Save Current Project as New Template
                        </Button>
                    ) : (
                        <div className="flex gap-2 items-end animate-in fade-in slide-in-from-top-2">
                            <div className="flex-1">
                                <label className="type-h3 text-[10px] block mb-1">Template Name</label>
                                <input 
                                    type="text" 
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="e.g., My Awesome Intro"
                                    className="w-full bg-theme-bg border border-theme-border rounded px-3 py-2 text-sm text-theme-text focus:border-theme-accent outline-none"
                                    autoFocus
                                />
                            </div>
                            <Button variant="primary" onClick={handleSaveCurrent} disabled={!newTemplateName.trim()}>Save</Button>
                            <Button variant="ghost" onClick={() => setShowSaveForm(false)}>Cancel</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedTemplates.map(template => (
                    <div key={template.id} className="group bg-theme-surface border border-theme-border rounded-lg overflow-hidden hover:border-theme-accent transition-all hover:shadow-lg flex flex-col h-full">
                        {/* Thumbnail Placeholder */}
                        <div className={`h-32 w-full flex items-center justify-center relative overflow-hidden ${activeTab === 'presets' ? 'bg-gradient-to-br from-theme-panel to-theme-bg' : 'bg-theme-panel'}`}>
                            {template.category === 'preset' ? (
                                <div className="text-theme-accent opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                                    <LayoutTemplate size={48} />
                                </div>
                            ) : (
                                <div className="text-theme-text-muted opacity-30 transform group-hover:scale-110 transition-transform duration-500">
                                    <Save size={48} />
                                </div>
                            )}
                            
                            {/* Overlay Stats */}
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                                <Clock size={10} />
                                {formatDuration(template.duration)}
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-theme-text-highlight group-hover:text-theme-accent transition-colors">{template.name}</h3>
                                {template.category === 'custom' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                                        className="text-theme-text-muted hover:text-theme-danger transition-colors p-1"
                                        title="Delete Template"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-theme-text-muted mb-4 line-clamp-2 flex-1">{template.description}</p>
                            
                            <div className="mt-auto pt-3 border-t border-theme-border flex items-center justify-between">
                                <span className="text-[10px] text-theme-text-muted">
                                    {template.tracks.reduce((acc, t) => acc + t.clips.length, 0)} Clips • {template.tracks.filter(t => t.clips.length > 0).length} Tracks
                                </span>
                                <Button 
                                    variant="secondary" 
                                    className="h-8 text-xs group-hover:bg-theme-accent group-hover:text-white group-hover:border-theme-accent"
                                    onClick={() => onLoadTemplate(template)}
                                    icon={<PlayCircle size={14} />}
                                >
                                    Load
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {displayedTemplates.length === 0 && (
                <div className="text-center py-12 text-theme-text-muted italic">
                    {activeTab === 'presets' ? "No presets found." : "You haven't saved any custom templates yet."}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};