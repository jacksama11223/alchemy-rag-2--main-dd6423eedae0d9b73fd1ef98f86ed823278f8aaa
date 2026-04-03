import 'react-native-get-random-values';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { ApiKeyProvider } from './src/context/ApiKeyContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApiKeyProvider>
          <AuthProvider>
            <BottomSheetModalProvider>
              <AppNavigator />
              <StatusBar style="light" />
              <Toast />
            </BottomSheetModalProvider>
          </AuthProvider>
        </ApiKeyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
