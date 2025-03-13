import { Dream } from './types';

const DREAMS_STORAGE_KEY = 'jungian_dreams';

/**
 * Save a dream to local storage
 */
export const saveDream = (dream: Dream): void => {
  try {
    const dreams = getDreams();
    dreams.push(dream);
    localStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams));
  } catch (error) {
    console.error('Error saving dream to local storage:', error);
  }
};

/**
 * Get all dreams from local storage
 */
export const getDreams = (): Dream[] => {
  try {
    const dreamsJson = localStorage.getItem(DREAMS_STORAGE_KEY);
    if (!dreamsJson) return [];
    
    const dreams = JSON.parse(dreamsJson);
    // Convert string dates back to Date objects
    return dreams.map((dream: any) => ({
      ...dream,
      timestamp: new Date(dream.timestamp),
      analysis: dream.analysis ? {
        ...dream.analysis,
        timestamp: new Date(dream.analysis.timestamp)
      } : undefined
    }));
  } catch (error) {
    console.error('Error retrieving dreams from local storage:', error);
    return [];
  }
};

/**
 * Delete a dream from local storage
 */
export const deleteDream = (dreamId: string): void => {
  try {
    const dreams = getDreams();
    const filteredDreams = dreams.filter(dream => dream.id !== dreamId);
    localStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(filteredDreams));
  } catch (error) {
    console.error('Error deleting dream from local storage:', error);
  }
};

/**
 * Clear all dreams from local storage
 */
export const clearDreams = (): void => {
  try {
    localStorage.removeItem(DREAMS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing dreams from local storage:', error);
  }
}; 