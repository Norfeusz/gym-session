export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/** Bottom 4 tabs */
export type AppTabParamList = {
  Exercises: undefined;
  Plans: undefined;
  Records: undefined;
  Calendar: undefined;
};

/** Stack screens on top of tabs */
export type AppStackParamList = {
  Tabs: undefined;
  // Workout flow
  StartWorkout: undefined;
  ChooseMuscleGroups: { planId?: string; mode: 'suggested' | 'plan' | 'free' };
  ExercisePicker: { muscleGroup: string; sessionId: string };
  ActiveSession: { sessionId: string };
  SessionSummary: { sessionId: string };
  // Detail screens
  ExerciseDetail: { exerciseId: string };
  PlanEditor: { planId?: string };
  SessionDetail: { sessionId: string };
  Settings: undefined;
};
