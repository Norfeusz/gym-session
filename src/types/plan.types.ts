import { Timestamp } from 'firebase/firestore';
import { MuscleGroup } from './exercise.types';

/**
 * One muscle group entry inside a plan:
 * - which muscle group
 * - how many exercises to pick (chosen during workout, not stored here)
 */
export interface PlanMuscleGroup {
  muscleGroup: MuscleGroup;
  exerciseCount: number;
}

/**
 * Training plan stores the *structure* of a session, not specific exercises.
 * Exercises are chosen by the user during the workout.
 */
export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  /** Number of sets for every exercise in the session, e.g. 4 */
  setsPerExercise: number;
  /** Rest time between sets in seconds */
  restBetweenSets: number;
  /** Ordered list of muscle groups with exercise counts */
  muscleGroups: PlanMuscleGroup[];
  createdAt: Timestamp;
  isActive: boolean;
}
