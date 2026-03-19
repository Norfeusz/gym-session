import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlansScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plans</Text>
      <Text style={styles.subtitle}>Training plans — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { marginTop: 8, color: '#888' },
});
