import { ProjectState } from '../types/editor';

const STORAGE_KEY = 'online_photoshop_pro_project_v1';

export function saveProjectToStorage(state: ProjectState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save to localStorage (quota exceeded or disabled)', e);
  }
}

export function loadProjectFromStorage(): ProjectState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectState;
  } catch (e) {
    console.error('Failed to load saved project', e);
    return null;
  }
}

export function clearSavedProject(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear saved project', e);
  }
}
