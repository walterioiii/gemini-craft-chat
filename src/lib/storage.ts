import { Cabinet, ProjectSettings } from './types';

const STORAGE_KEY = 'cabinet-nester-data';

interface StoredData {
  cabinets: Cabinet[];
  settings: ProjectSettings;
}

export function loadProject(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    cabinets: [],
    settings: { name: '', materialThickness: 0.75, frameDepth: 0.75 },
  };
}

export function saveProject(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
