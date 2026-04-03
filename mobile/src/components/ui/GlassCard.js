import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function GlassCard({ children, style, intensity = Platform.OS === 'android' ? 80 : 50, tint = 'light' }) {
  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'android' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tint === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]} />
      ) : null}
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          tint === 'dark' 
            ? ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']
            : ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.2)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
    elevation: 5, // Add elevation for Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  gradientBorder: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  content: {
    padding: 20,
    zIndex: 1,
  },
});
