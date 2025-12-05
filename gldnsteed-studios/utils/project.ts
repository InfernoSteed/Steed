
import { ProjectData, Track, Asset, DuckingSettings } from '../types';
import { generateId } from '../utils';

const PROJECT_VERSION = '1.0.0';
const LOCAL_STORAGE_KEY = 'vf_local_projects';

export const createProjectData = (
    name: string,
    tracks: Track[],
    assets: Asset[],
    duration: number,
    duckingSettings: DuckingSettings
): ProjectData => {
    return {
        version: PROJECT_VERSION,
        id: generateId(),
        name: name || 'Untitled Project',
        lastModified: Date.now(),
        duration,
        tracks,
        assets, // Note: Blob URLs in assets will expire if not handled
        duckingSettings
    };
};

export const validateProjectFile = (data: any): data is ProjectData => {
    if (!data || typeof data !== 'object') return false;
    // Basic schema check
    if (!data.version || !data.tracks || !data.assets) return false;
    // Version check (simple major version compatibility)
    if (data.version.split('.')[0] !== PROJECT_VERSION.split('.')[0]) {
        console.warn(`Version mismatch: Project is ${data.version}, App is ${PROJECT_VERSION}`);
        // In a real app, we'd have migration logic here
    }
    return true;
};

// Local Storage Helpers
export const getLocalProjects = (): ProjectData[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load local projects", e);
        return [];
    }
};

export const saveLocalProject = (project: ProjectData) => {
    const projects = getLocalProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id || p.name === project.name);
    
    let updatedProjects;
    if (existingIndex >= 0) {
        updatedProjects = [...projects];
        updatedProjects[existingIndex] = { ...project, lastModified: Date.now() };
    } else {
        updatedProjects = [project, ...projects];
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
};

export const deleteLocalProject = (id: string) => {
    const projects = getLocalProjects();
    const updated = projects.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

// File I/O Helpers
export const downloadProjectFile = (project: ProjectData) => {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
