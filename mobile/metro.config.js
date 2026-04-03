const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Redirect expo-apple-authentication to a mock shim on non-iOS platforms.
// This package is iOS-only and cannot be bundled for web or Android.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-apple-authentication': path.resolve(__dirname, 'src/mocks/expo-apple-authentication.js'),
};

module.exports = config;
