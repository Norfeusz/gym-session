import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Exercise, MuscleGroup } from '../types/exercise.types';
import { WorkoutSession } from '../types/workout.types';

const EXERCISES = 'exercises';
const SESSIONS = 'sessions';

export async function getExercises(): Promise<Exercise[]> {
  const snap = await getDocs(collection(db, EXERCISES));
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Exercise));
}

export async function searchExercises(query_: string): Promise<Exercise[]> {
  const all = await getExercises();
  const lower = query_.toLowerCase();
  return all.filter(e => e.name.toLowerCase().includes(lower));
}

export async function filterByMuscleGroup(muscle: MuscleGroup): Promise<Exercise[]> {
  const q = query(
    collection(db, EXERCISES),
    where('primaryMuscle', '==', muscle)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Exercise));
}

/**
 * Returns exercises for a muscle group sorted from LEAST recently done (first)
 * to most recently done (last). Exercises with no history come first.
 *
 * Approach optimised for mobile:
 * 1. Fetch exercises for the muscle group from global library + user's custom exercises (2 reads).
 * 2. Fetch user's sessions that contain exercises of that muscle group (1 query).
 * 3. Build a map exerciseId → most recent date (client-side) — no extra Firestore reads.
 * 4. Sort: no-history exercises first, then ascending by last used date.
 */
export async function getExercisesSortedByLastDone(
  userId: string,
  muscle: MuscleGroup
): Promise<Exercise[]> {
  const [globalSnap, userSnap, sessionsSnap] = await Promise.all([
    getDocs(query(collection(db, EXERCISES), where('primaryMuscle', '==', muscle))),
    getDocs(
      query(
        collection(db, EXERCISES),
        where('userId', '==', userId),
        where('primaryMuscle', '==', muscle)
      )
    ),
    getDocs(
      query(
        collection(db, SESSIONS),
        where('userId', '==', userId)
      )
    ),
  ]);

  const exercises: Exercise[] = [
    ...globalSnap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Exercise)),
    ...userSnap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Exercise)),
  ];

  // Deduplicate by id (in case a user's custom exercise appears in both)
  const uniqueExercises = Array.from(new Map(exercises.map(e => [e.id, e])).values());

  // Build exerciseId → latest session date (in millis)
  const lastUsed = new Map<string, number>();
  sessionsSnap.docs.forEach((d: QueryDocumentSnapshot) => {
    const session = d.data() as Omit<WorkoutSession, 'id'>;
    const dateMs = session.date.toMillis();
    session.exercises.forEach(ex => {
      const prev = lastUsed.get(ex.exerciseId);
      if (prev === undefined || dateMs > prev) {
        lastUsed.set(ex.exerciseId, dateMs);
      }
    });
  });

  // Sort: no history first, then ascending by last used (least recent = closer to top)
  return uniqueExercises.sort((a, b) => {
    const aMs = lastUsed.get(a.id);
    const bMs = lastUsed.get(b.id);
    if (aMs === undefined && bMs === undefined) return 0;
    if (aMs === undefined) return -1;
    if (bMs === undefined) return 1;
    return aMs - bMs;
  });
}

export async function createCustomExercise(
  userId: string,
  data: Omit<Exercise, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, EXERCISES), {
    ...data,
    isCustom: true,
    userId,
  });
  return ref.id;
}

export async function getUserExercises(userId: string): Promise<Exercise[]> {
  const q = query(collection(db, EXERCISES), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as Exercise));
}
