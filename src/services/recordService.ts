import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  QueryDocumentSnapshot,
  Transaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ExerciseRecord } from '../types/record.types';
import { WorkoutSession } from '../types/workout.types';

const RECORDS = 'records';

/**
 * Document ID strategy: `{userId}_{exerciseId}`
 * — O(1) lookup by userId + exerciseId, no extra query needed.
 * — Optimised for mobile: single getDoc instead of a getDocs query.
 */
function recordDocId(userId: string, exerciseId: string): string {
  return `${userId}_${exerciseId}`;
}

export async function getRecords(userId: string): Promise<ExerciseRecord[]> {
  const q = query(collection(db, RECORDS), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as ExerciseRecord));
}

export async function getRecordForExercise(
  userId: string,
  exerciseId: string
): Promise<ExerciseRecord | null> {
  const snap = await getDoc(doc(db, RECORDS, recordDocId(userId, exerciseId)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ExerciseRecord;
}

/**
 * After saving a session, iterates over every exercise and its sets.
 * For each set, compares weight, reps and volume against the stored record.
 * Updates via Firestore transaction only when a new best is detected.
 *
 * Uses deterministic document IDs so each transaction targets exactly one doc
 * per exercise — no need to read the whole records collection.
 */
export async function updateRecordIfBetter(
  userId: string,
  session: WorkoutSession
): Promise<void> {
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      const setVolume = set.weight * set.reps;
      const recordRef = doc(db, RECORDS, recordDocId(userId, exercise.exerciseId));

      await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(recordRef);

        if (!snap.exists()) {
          tx.set(recordRef, {
            userId,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            bestWeight: set.weight,
            bestReps: set.reps,
            bestVolume: setVolume,
            achievedAt: Timestamp.now(),
            sessionId: session.id,
          } satisfies Omit<ExerciseRecord, 'id'>);
          return;
        }

        const current = snap.data() as Omit<ExerciseRecord, 'id'>;
        const isNewBest =
          set.weight > current.bestWeight ||
          setVolume > current.bestVolume;

        if (isNewBest) {
          tx.update(recordRef, {
            bestWeight: Math.max(set.weight, current.bestWeight),
            bestReps: set.weight >= current.bestWeight ? set.reps : current.bestReps,
            bestVolume: Math.max(setVolume, current.bestVolume),
            achievedAt: Timestamp.now(),
            sessionId: session.id,
          });
        }
      });
    }
  }
}
