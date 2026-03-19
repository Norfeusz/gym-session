export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  primaryMuscle: MuscleGroup;
  equipment: Equipment;
  description?: string;
  isCustom?: boolean;
  userId?: string;
}
