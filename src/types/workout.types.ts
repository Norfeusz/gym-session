import { Timestamp } from 'firebase/firestore';
import { MuscleGroup } from './exercise.types';

/** How the session was started */
export type WorkoutStartType = 'suggested' | 'plan' | 'free';

export interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  /** Rate of Perceived Exertion 1-10 */
  rpe?: number;
  completedAt: Timestamp;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  /** Last session data — shown as suggestion before the exercise */
  lastSessionWeight?: number;
  lastSessionReps?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  startType: WorkoutStartType;
  planId?: string;
  date: Timestamp;
  startedAt: Timestamp;
  finishedAt?: Timestamp;
  setsPerExercise: number;
  exercises: WorkoutExercise[];
  /** Sum of weight * reps across all sets */
  totalVolume: number;
  notes?: string;
}
