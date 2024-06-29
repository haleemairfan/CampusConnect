
import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, router } from 'expo-router'

import { icons } from '../../constants'
import CustomButton from '@/components/CustomButton';

const settings = () => {
  return (
    <SafeAreaView className = 'bg-primary h-full'>
        <FlatList
          ListHeaderComponent = {() => (
              <View className = "my-6 px-4">
                  <View className = "flex-row items-center mb-6">
                      <Text className = "text-white font-bold ml-5" style={{ fontSize: 20 }}>
                          Settings
                      </Text>
                  </View>

                  <View className = "items-center">
                    <CustomButton 
                      title="Change Account Details"
                      handlePress={() => router.push('/login')}
                      containerStyles="w-full justify-center mt-3 mb-3"
                      textStyles="text-lg text-center font-bold"
                      buttonColor = "#d8a838"
                      buttonWidth = "90%"
                      maxButtonWidth = "400" 
                    />
                  </View>

                  <View className = "items-center">
                    <CustomButton 
                      title="Change Password"
                      handlePress={() => router.push('/login')}
                      containerStyles="w-full justify-center mt-3 mb-3"
                      textStyles="text-lg text-center font-bold"
                      buttonColor = "#d8a838"
                      buttonWidth = "90%"
                      maxButtonWidth = "400" 
                    />
                  </View>

                  <View className = "items-center">
                    <CustomButton 
                      title="Change Display Settings"
                      handlePress={() => router.push('/login')}
                      containerStyles="w-full justify-center mt-3 mb-3"
                      textStyles="text-lg text-center font-bold"
                      buttonColor = "#d8a838"
                      buttonWidth = "90%"
                      maxButtonWidth = "400" 
                    />
                  </View>

                  <View className = "items-center">
                    <CustomButton 
                      title="Reported Posts"
                      handlePress={() => router.push('/login')}
                      containerStyles="w-full justify-center mt-3 mb-3"
                      textStyles="text-lg text-center font-bold"
                      buttonColor = "#d8a838"
                      buttonWidth = "90%"
                      maxButtonWidth = "400" 
                    />
                  </View>

                  <View className = "items-center">
                    <CustomButton 
                      title="Reported Comments"
                      handlePress={() => router.push('/login')}
                      containerStyles="w-full justify-center mt-3 mb-3"
                      textStyles="text-lg text-center font-bold"
                      buttonColor = "#d8a838"
                      buttonWidth = "90%"
                      maxButtonWidth = "400" 
                    />
                  </View>

                  <View className = "items-center">
                    <CustomButton 
                      title="Blocked Accounts"
                      handlePress={() => router.push('/login')}
                      containerStyles="w-full justify-center mt-3 mb-3"
                      textStyles="text-lg text-center font-bold"
                      buttonColor = "#d8a838"
                      buttonWidth = "90%"
                      maxButtonWidth = "400" 
                    />
                  </View>

              </View>
        )}
      />
    </SafeAreaView>
  )
}

export default settings