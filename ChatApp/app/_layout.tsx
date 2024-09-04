import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack>
          <Stack.Screen
            name="(main)"
            options={{
              // Hide the header for all other routes.
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              title: "ホーム",
              // Hide the header for all other routes.
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              title: "ログイン",
              // Set the presentation mode to modal for our modal route.
              presentation: 'modal',
            }}
          />
        </Stack>
      );
    }
