import { Stack } from 'expo-router';
import '../services/locationTask';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Início' }} />
    </Stack>
  );
}