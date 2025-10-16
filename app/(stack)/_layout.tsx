import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#22c55e',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="home" size={24} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
        }}
      />
      <Stack.Screen
        name="supplies"
        options={{
          title: 'Supplies',
        }}
      />
      <Stack.Screen
        name="academy"
        options={{
          title: 'Academy',
        }}
      />
      <Stack.Screen
        name="finance"
        options={{
          title: 'Finance',
        }}
      />
      <Stack.Screen
        name="rentals"
        options={{
          title: 'Rentals',
        }}
      />
      <Stack.Screen
        name="ads"
        options={{
          title: 'Ads',
        }}
      />
      <Stack.Screen
        name="facility-care"
        options={{
          title: 'Facility Care',
        }}
      />
      <Stack.Screen
        name="plus"
        options={{
          title: 'LocalPro Plus',
        }}
      />
    </Stack>
  );
}
