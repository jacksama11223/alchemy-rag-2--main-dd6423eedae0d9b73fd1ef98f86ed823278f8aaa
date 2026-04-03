import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '@expo/metro-runtime';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';
import App from './App';

enableScreens();
registerRootComponent(App);
