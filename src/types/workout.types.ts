import { Timestamp } from 'firebase/firestore';

export interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completedAt: Timestamp;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  date: Timestamp;
  startedAt: Timestamp;
  finishedAt?: Timestamp;
  exercises: WorkoutExercise[];
  totalVolume: number;
  notes?: string;
}
