import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Card({ children, style, variant = 'default' }: any) {
  return <View style={[styles.card, variant === 'highlight' && styles.highlight, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  highlight: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 5,
    borderLeftColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
});