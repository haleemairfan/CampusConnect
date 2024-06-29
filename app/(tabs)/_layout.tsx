
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import { TabBarIcon } from '@/componentss/navigation/TabBarIcon';
import MessagesStack from './MessagesStack'

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className = "items-center justify-center gap-2">
      <Image 
        source = {icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text style={{color:color}}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
        <Tabs
        screenOptions ={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFA001',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: {
            backgroundColor: '#161622',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 84,
          }

        }}
        >
          <Tabs.Screen
            name="home" 
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.home_icon}
                  color={color}
                  name='Home'
                  focused={focused}
                  />
              )
            }}
          />
          <Tabs.Screen
            name="profile" 
            options={{
              title: 'Profile',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.user_icon}
                  color={color}
                  name='Profile'
                  focused={focused}
                  />
              )
            }}
          />
          <Tabs.Screen
            name="create" 
            options={{
              title: 'Create',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.draw_icon}
                  color={color}
                  name='Create'
                  focused={focused}
                  />
              )
            }}
          />
            <Tabs.Screen
            name="settings" 
            options={{
              title: 'Settings',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.settings_icon}
                  color={color}
                  name='Settings'
                  focused={focused}
                  />
              )
            }}
          />
        </Tabs>
    </>
  )
}

export default TabsLayout