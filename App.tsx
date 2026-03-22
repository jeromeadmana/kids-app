import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import { SoundManager } from './src/utils/SoundManager';
import { HomeScreen } from './src/screens/HomeScreen';
import { SongSelectScreen } from './src/screens/SongSelectScreen';
import { SingAlongScreen } from './src/screens/SingAlongScreen';
import { StickerBookScreen } from './src/screens/StickerBookScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';

type RootStackParamList = {
  Home: undefined;
  SongSelect: undefined;
  SingAlong: { songId: string };
  StickerBook: undefined;
  ParentDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    SoundManager.init();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false, // Prevent swipe-back (toddler safety)
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SongSelect" component={SongSelectScreen} />
            <Stack.Screen name="SingAlong" component={SingAlongScreen} />
            <Stack.Screen name="StickerBook" component={StickerBookScreen} />
            <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
