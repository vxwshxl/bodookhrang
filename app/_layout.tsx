import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  const [loaded, error] = useFonts({
    'twk': require('@/assets/fonts/twk.otf'),
    'fgr': require('@/assets/fonts/fgr.otf'),
  });

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
  );
}
