import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ProjectData } from '../types';
import { getLocalProjects, saveLocalProject, deleteLocalProject, downloadProjectFile, validateProjectFile } from '../utils/project';
import { FolderOpen, Save, Trash2, FileJson, X, Download, Upload, AlertTriangle, Clock } from 'lucide-react';
import { formatDuration } from '../utils';

interface ProjectManagerModalProps {
  currentProject: ProjectData;
  onClose: () => void;
  onLoadProject: (project: ProjectData) => void;
  onSaveCurrent: () => void; // Trigger an update to current state before saving logic
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({ 
    currentProject, onClose, onLoadProject, onSaveCurrent 
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'file'>('local');
  const [localProjects, setLocalProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    setLocalProjects(getLocalProjects());
  }, []);

  const handleSaveLocal = () => {
      onSaveCurrent(); // Ensure parent updates state first (optional depending on React flow)
      // We assume currentProject passed in is fresh
      saveLocalProject(currentProject);
      setLocalProjects(getLocalProjects());
      alert("Project saved locally!");
  };

  const handleDelete = (id: string) => {
      if (confirm("Are you sure you want to delete this saved project?")) {
          deleteLocalProject(id);
          setLocalProjects(getLocalProjects());
      }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (validateProjectFile(json)) {
                  onLoadProject(json);
              } else {
                  alert("Invalid project file format.");
              }
          } catch (err) {
              alert("Failed to parse project file.");
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-theme-panel border border-theme-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-theme-border bg-theme-surface">
            <h2 className="text-xl font-bold text-theme-text-highlight flex items-center gap-2">
                <FolderOpen className="text-theme-accent" />
                Project Manager
            </h2>
            <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
        </div>

        <div className="flex border-b border-theme-border bg-theme-panel">
            <button 
                onClick={() => setActiveTab('local')}
                className={`flex-1 py-3 type-h3 text-[10px] tracking-wider transition-colors ${activeTab === 'local' ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-surface/10' : 'text-theme-text-muted hover:text-theme-text'}`}
            >
                Browser Storage
            </button>
            <button 
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-3 type-h3 text-[10px] tracking-wider transition-colors ${activeTab === 'file' ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-surface/10' : 'text-theme-text-muted hover:text-theme-text'}`}
            >
                Import / Export File
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-theme-bg">
            
            {activeTab === 'local' && (
                <div className="space-y-4">
                    <div className="bg-theme-surface/50 border border-theme-border rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-theme-text-highlight">{currentProject.name} (Current)</h3>
                            <p className="text-xs text-theme-text-muted">Unsaved changes will be lost if you load another project.</p>
                        </div>
                        <Button variant="primary" onClick={handleSaveLocal} icon={<Save size={16} />}>Save Snapshot</Button>
                    </div>

                    <h3 className="type-h3 mt-6 mb-2">Saved Snapshots</h3>
                    {localProjects.length === 0 ? (
                        <p className="text-sm text-theme-text-muted italic">No local projects saved yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {localProjects.map(proj => (
                                <div key={proj.id} className="group bg-theme-surface border border-theme-border rounded-lg p-3 flex items-center justify-between hover:border-theme-accent transition-colors">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-theme-text-highlight">{proj.name}</div>
                                        <div className="flex items-center gap-3 text-[10px] text-theme-text-muted mt-1">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(proj.lastModified).toLocaleDateString()} {new Date(proj.lastModified).toLocaleTimeString()}</span>
                                            <span>{formatDuration(proj.duration)}</span>
                                            <span>{proj.tracks.reduce((acc,t) => acc + t.clips.length, 0)} clips</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" onClick={() => onLoadProject(proj)} className="text-xs h-8">Load</Button>
                                        <button onClick={() => handleDelete(proj.id)} className="p-2 text-theme-text-muted hover:text-theme-danger transition-colors" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-200 flex gap-2">
                         <AlertTriangle size={16} className="shrink-0" />
                         <p>Note: Browser storage is temporary. Media files (videos/audio) might need to be re-linked if you clear browser cache. Use "Export File" for backups.</p>
                    </div>
                </div>
            )}

            {activeTab === 'file' && (
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-theme-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-theme-border">
                            <Download size={32} className="text-theme-accent" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-theme-text-highlight">Export Project File</h3>
                        <p className="text-sm text-theme-text-muted mb-4 max-w-xs mx-auto">Download a .vf (JSON) file containing your timeline structure, effects, and text.</p>
                        <Button variant="primary" onClick={() => downloadProjectFile(currentProject)} icon={<FileJson size={18} />}>
                            Download Project File
                        </Button>
                    </div>

                    <div className="w-full h-px bg-theme-border"></div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-theme-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-theme-border">
                            <Upload size={32} className="text-theme-accent" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-theme-text-highlight">Open Project File</h3>
                        <p className="text-sm text-theme-text-muted mb-4 max-w-xs mx-auto">Restore a previously saved .vf or .json project file.</p>
                        <div className="relative">
                            <Button variant="secondary" icon={<FolderOpen size={18} />}>Select File</Button>
                            <input 
                                type="file" 
                                accept=".json,.vf" 
                                onChange={handleFileImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};