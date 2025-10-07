// Polyfill for crypto.getRandomValues() (needed for uuid)
import 'expo-crypto';
import { getRandomValues } from 'expo-crypto';

// @ts-ignore
if (typeof global.crypto !== 'object') {
  // @ts-ignore
  global.crypto = {};
}
// @ts-ignore
if (typeof global.crypto.getRandomValues !== 'function') {
  // @ts-ignore
  global.crypto.getRandomValues = getRandomValues;
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

