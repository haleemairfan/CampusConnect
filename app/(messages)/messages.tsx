
import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, router } from 'expo-router'

import { icons } from '../../constants'
import ImageButton from '../../components/ImageButton'
import EmptyStateMessages from '@/components/EmptyStateMessages'
import SearchInput from '@/components/SearchInput'

const messages = () => {
  return (
    <SafeAreaView className = 'bg-primary h-full'>
        <FlatList
            ListHeaderComponent = {() => (
                <View className = "my-6 px-4 space-y-6">
                    <View className = "flex-row items-center mb-6">
                        <ImageButton 
                            imageSource={icons.back_icon}
                            handlePress={() => router.push('/home')} 
                            imageContainerStyles = "w-[40px] h-[25px]" 
                            />
                        <Text className = "text-white font-bold ml-5" style={{ fontSize: 20 }}>
                            Messages
                        </Text>
                    </View>
                    <SearchInput 
                    placeholder = "Search"/>
                </View>
            )}
            /* ListEmptyComponent = {() => (
                <EmptyStateMessages
               title="No messages"
                />
            )}
            */
        />
    </SafeAreaView>
  )
}

export default messages