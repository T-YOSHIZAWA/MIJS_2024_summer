import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "設定",
                    // Hide the header for all other routes.
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
