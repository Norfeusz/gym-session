import { Timestamp } from 'firebase/firestore';

export interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
}

export interface PlanDay {
  dayLabel: string;
  exercises: PlanExercise[];
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  daysPerWeek: number;
  days: PlanDay[];
  createdAt: Timestamp;
  isActive: boolean;
}
