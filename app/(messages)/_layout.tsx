

import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
const MessagesLayout = () => {
  return (
    <>
        <Stack>
            <Stack.Screen
                name="chatsPage"
                options={{
                    headerShown: false
                }}
            />
        </Stack>

        <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default MessagesLayout