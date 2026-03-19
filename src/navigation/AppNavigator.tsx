import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './navigation.types';
import DashboardScreen from '@features/workout/DashboardScreen';
import WorkoutScreen from '@features/workout/WorkoutScreen';
import HistoryScreen from '@features/analytics/HistoryScreen';
import PlansScreen from '@features/plans/PlansScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Plans" component={PlansScreen} />
    </Tab.Navigator>
  );
}
