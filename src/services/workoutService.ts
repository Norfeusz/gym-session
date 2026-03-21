import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { WorkoutSession, WorkoutExercise } from '../types/workout.types';

const SESSIONS = 'sessions';

export async function createWorkoutSession(
  data: Omit<WorkoutSession, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, SESSIONS), data);
  return ref.id;
}

export async function getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
  const q = query(
    collection(db, SESSIONS),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as WorkoutSession));
}

export async function getWorkoutSessionById(
  sessionId: string
): Promise<WorkoutSession | null> {
  const snap = await getDoc(doc(db, SESSIONS, sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WorkoutSession;
}

export async function updateWorkoutSession(
  sessionId: string,
  data: Partial<WorkoutSession>
): Promise<void> {
  await updateDoc(doc(db, SESSIONS, sessionId), data);
}

export async function deleteWorkoutSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, SESSIONS, sessionId));
}

/**
 * Returns the most recent WorkoutExercise data for a given exercise.
 * Used to display "Osiągi" suggestion before each exercise in the workout.
 *
 * Strategy: query sessions where userId matches, ordered by date desc,
 * scan through docs until the exercise is found — stops early to minimise reads.
 */
export async function getLastSessionForExercise(
  userId: string,
  exerciseId: string
): Promise<WorkoutExercise | null> {
  const q = query(
    collection(db, SESSIONS),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs as QueryDocumentSnapshot[]) {
    const session = d.data() as Omit<WorkoutSession, 'id'>;
    const found = session.exercises.find(e => e.exerciseId === exerciseId);
    if (found) return found;
  }
  return null;
}
