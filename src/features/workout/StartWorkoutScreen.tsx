import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@navigation/navigation.types';

type Props = NativeStackScreenProps<AppStackParamList, 'StartWorkout'>;

/**
 * "Co dziś robimy?" screen.
 * User picks how to start the session:
 *   1. Sugerowany plan — auto-suggested based on training history
 *   2. Wybierz plan — manually pick a training plan
 *   3. Wybierz ćwiczenia — free session, no plan
 */
export default function StartWorkoutScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Co dziś robimy?</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ChooseMuscleGroups', { mode: 'suggested' })}
      >
        <Text style={styles.optionTitle}>Sugerowany plan</Text>
        <Text style={styles.optionSub}>Na podstawie historii treningów</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ChooseMuscleGroups', { mode: 'plan' })}
      >
        <Text style={styles.optionTitle}>Wybierz plan treningowy</Text>
        <Text style={styles.optionSub}>Z Twoich zapisanych planów</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ChooseMuscleGroups', { mode: 'free' })}
      >
        <Text style={styles.optionTitle}>Wybierz ćwiczenia</Text>
        <Text style={styles.optionSub}>Dowolna sesja bez planu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  optionTitle: { fontSize: 18, fontWeight: '600' },
  optionSub: { marginTop: 4, color: '#888' },
});
