import { Timestamp } from 'firebase/firestore';

/**
 * Personal record for a specific exercise.
 * Updated automatically when a session is saved and a new best is detected.
 */
export interface ExerciseRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  /** Best single-set weight */
  bestWeight: number;
  /** Reps at best weight */
  bestReps: number;
  /** Best single-set volume: weight * reps */
  bestVolume: number;
  achievedAt: Timestamp;
  /** Session in which the record was set */
  sessionId: string;
}

/**
 * Snapshot of an exercise performance in a single session.
 * Used to build progress charts (weight over time).
 */
export interface ExerciseProgressEntry {
  sessionId: string;
  date: Timestamp;
  maxWeight: number;
  totalVolume: number;
}
