import * as TaskManager from 'expo-task-manager';
import { useRunStore } from '../store/useRunStore';

export const LOCATION_TASK_NAME = 'NIXRUN_BACKGROUND_LOCATION';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Erro na tarefa de GPS:", error);
    return; 
  }
  
  if (data) {
    const { locations } = data as { locations: any[] };
    const maisRecente = locations[0];
    

    useRunStore.getState().setCurrentLocation({
      latitude: maisRecente.coords.latitude,
      longitude: maisRecente.coords.longitude,
    });
  }
});