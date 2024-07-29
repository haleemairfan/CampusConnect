

import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const chatsLayout = () => {
  return (
    <>
        <Stack>
            <Stack.Screen
                name="messages"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name = "chat"
                options = {{
                  headerShown: false
                }}
            />
        </Stack>

        <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default chatsLayout;