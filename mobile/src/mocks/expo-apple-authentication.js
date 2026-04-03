// Mock shim for expo-apple-authentication
// This module is only supported on iOS native builds.
// On web and Android, Apple Sign-In is not available.

export const AppleAuthenticationScope = {
  FULL_NAME: 0,
  EMAIL: 1,
};

export async function signInAsync(_options) {
  throw new Error('Apple Authentication is only supported on iOS.');
}

export function isAvailableAsync() {
  return Promise.resolve(false);
}

export default {
  AppleAuthenticationScope,
  signInAsync,
  isAvailableAsync,
};
