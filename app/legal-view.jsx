import React from 'react';
import { StyleSheet } from 'react-native';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';

export default function LegalView() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>Legal information is not available yet.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});
