import { LogBox, Platform } from 'react-native';

const dependencyWarnings = [
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'Animated: `useNativeDriver` is not supported',
];

if (Platform.OS === 'web') {
  LogBox.ignoreLogs(dependencyWarnings);

  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (dependencyWarnings.some((warning) => message.includes(warning))) return;
    originalWarn(...args);
  };
}
