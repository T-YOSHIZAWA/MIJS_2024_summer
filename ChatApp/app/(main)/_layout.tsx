import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{ headerShown: true }}>
        <Drawer.Screen
          name='home'
          options={{
            title: "ホーム",
          }}
        />
        <Drawer.Screen
          name='setting'
          options={{
            title: '設定',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
