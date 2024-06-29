import { Slot, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Sevillana: require('../assets/fonts/Inter-VariableFont_slnt,wght.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;            
  }


    return (
        <Stack>
            <Stack.Screen name = "index" options = {{ headerShown: false}} />
            <Stack.Screen name = "(auth)" options = {{ headerShown: false}} /> 
            <Stack.Screen name = "(tabs)" options = {{ headerShown: false}} />
            <Stack.Screen name = "(messages)" options = {{ headerShown: false}} />
            <Stack.Screen name = "search/[query]" options = {{ headerShown: false}} />      
        </Stack>
    )
}

export default RootLayout