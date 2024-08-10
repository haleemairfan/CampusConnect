import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const ConfigLayout = () => {
  return (
    <>
        <Stack>
            <Stack.Screen
                name="interests"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="major"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="university"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="yearofstudy"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="updateinterests"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="updatemajor"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="updateuniversity"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="updateyearofstudy"
                options={{
                    headerShown: false
                }}
            />
        </Stack>

        <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default ConfigLayout