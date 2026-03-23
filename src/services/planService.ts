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
  writeBatch,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { TrainingPlan } from '../types/plan.types';

const PLANS = 'plans';

export async function createPlan(data: Omit<TrainingPlan, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, PLANS), data);
  return ref.id;
}

export async function getPlans(userId: string): Promise<TrainingPlan[]> {
  const q = query(collection(db, PLANS), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as TrainingPlan));
}

export async function getPlanById(planId: string): Promise<TrainingPlan | null> {
  const snap = await getDoc(doc(db, PLANS, planId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as TrainingPlan;
}

export async function updatePlan(
  planId: string,
  data: Partial<TrainingPlan>
): Promise<void> {
  await updateDoc(doc(db, PLANS, planId), data);
}

export async function deletePlan(planId: string): Promise<void> {
  await deleteDoc(doc(db, PLANS, planId));
}

/**
 * Sets one plan as active and deactivates all other plans for the user.
 * Uses a batch write to guarantee atomicity — critical for mobile (offline/reconnect edge cases).
 */
export async function setActivePlan(userId: string, planId: string): Promise<void> {
  const q = query(collection(db, PLANS), where('userId', '==', userId));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  snap.docs.forEach((d: QueryDocumentSnapshot) => {
    batch.update(d.ref, { isActive: d.id === planId });
  });
  await batch.commit();
}
