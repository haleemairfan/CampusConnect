

import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const otherTabsLayout = () => {
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
            name="editing"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="comments"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="othersprofiles"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="commentediting"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="changeaccountdetails"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
        name="changepassword"
        options={{
            headerShown: false
        }}
        />
        <Stack.Screen
        name="blockedaccounts"
        options={{
            headerShown: false
        }}
        />
        <Stack.Screen
        name="deleteaccount"
        options={{
            headerShown: false
        }}
        />
        </Stack>

        <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default otherTabsLayout