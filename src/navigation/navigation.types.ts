export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Workout: undefined;
  History: undefined;
  Plans: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  ExerciseDetail: { exerciseId: string };
  PlanEditor: { planId?: string };
  SessionDetail: { sessionId: string };
  Settings: undefined;
};
