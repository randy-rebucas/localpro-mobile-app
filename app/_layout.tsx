import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import { ProviderModeProvider } from "../contexts/ProviderModeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProviderModeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(stack)" />
        </Stack>
      </ProviderModeProvider>
    </AuthProvider>
  );
}