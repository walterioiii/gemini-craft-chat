import { useState, useCallback, useEffect } from 'react';
import { Cabinet, ProjectSettings } from '@/lib/types';
import { loadProject, saveProject } from '@/lib/storage';

export function useProject() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [settings, setSettings] = useState<ProjectSettings>({
    name: '',
    materialThickness: 0.75,
    frameDepth: 0.75,
  });

  // Load on mount
  useEffect(() => {
    const data = loadProject();
    setCabinets(data.cabinets);
    setSettings(data.settings);
  }, []);

  // Persist on change
  useEffect(() => {
    saveProject({ cabinets, settings });
  }, [cabinets, settings]);

  const addCabinet = useCallback((cabinet: Omit<Cabinet, 'id'>) => {
    setCabinets(prev => [...prev, { ...cabinet, id: crypto.randomUUID() }]);
  }, []);

  const updateCabinet = useCallback((id: string, updates: Partial<Cabinet>) => {
    setCabinets(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCabinet = useCallback((id: string) => {
    setCabinets(prev => prev.filter(c => c.id !== id));
  }, []);

  const duplicateCabinet = useCallback((id: string, newName: string) => {
    setCabinets(prev => {
      const source = prev.find(c => c.id === id);
      if (!source) return prev;
      return [...prev, { ...source, id: crypto.randomUUID(), name: newName }];
    });
  }, []);

  return {
    cabinets,
    settings,
    setSettings,
    addCabinet,
    updateCabinet,
    removeCabinet,
    duplicateCabinet,
  };
}
