import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiText } from 'moti';

export default function AnimatedText({ text, style, delay = 0, duration = 300 }) {
  const words = text.split(' ');

  return (
    <View style={styles.container}>
      {words.map((word, index) => (
        <MotiText
          key={index}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: duration,
            delay: delay + index * 100, // Stagger effect
          }}
          style={[style, styles.word]}
        >
          {word}{' '}
        </MotiText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    // Keep styling from parent
  },
});
