import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabParamList, AppStackParamList } from './navigation.types';
import ExercisesScreen from '@features/exercises/ExercisesScreen';
import PlansScreen from '@features/plans/PlansScreen';
import RecordsScreen from '@features/records/RecordsScreen';
import CalendarScreen from '@features/calendar/CalendarScreen';
import StartWorkoutScreen from '@features/workout/StartWorkoutScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/** Floating "Rozpocznij trening" button rendered above tab bar */
function StartWorkoutFAB({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.fabText}>Rozpocznij trening</Text>
    </TouchableOpacity>
  );
}

function TabNavigator({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator>
        <Tab.Screen name="Exercises" component={ExercisesScreen} options={{ title: 'Ćwiczenia' }} />
        <Tab.Screen name="Plans" component={PlansScreen} options={{ title: 'Plany' }} />
        <Tab.Screen name="Records" component={RecordsScreen} options={{ title: 'Osiągi' }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Kalendarz' }} />
      </Tab.Navigator>
      <StartWorkoutFAB onPress={() => navigation.navigate('StartWorkout')} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="StartWorkout"
        component={StartWorkoutScreen}
        options={{ title: 'Co dziś robimy?' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

