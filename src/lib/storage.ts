import { Cabinet, ProjectSettings } from './types';

const STORAGE_KEY = 'cabinet-nester-data';

interface StoredData {
  cabinets: Cabinet[];
  settings: ProjectSettings;
}

export function loadProject(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Ensure faceframeOverhang has a default value for existing projects
      if (data.settings && typeof data.settings.faceframeOverhang === 'undefined') {
        data.settings.faceframeOverhang = 0.25;
      }
      return data;
    }
  } catch { /* ignore */ }
  return {
    cabinets: [],
    settings: { name: '', materialThickness: 0.75, frameDepth: 0.75, faceframeOverhang: 0.25 },
  };
}

export function saveProject(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
