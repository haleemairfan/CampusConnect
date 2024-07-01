
import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, router } from 'expo-router'
import { useAppContext } from '../context'

import SearchInput from '@/components/SearchInput'
import EmptyStateHome from '@/components/EmptyStateHome'
import { icons } from '../../constants'
import ImageButton from '@/components/ImageButton'



const Home = () => {
    const { getGlobalUserId } = useAppContext();
    const id = getGlobalUserId();
    const [refreshing, setRefreshing] = useState(false)
    const [userData, setUserData] = useState<String[]>([]);
    const [username, setUsername] = useState('');

    useEffect(() => {
        async function fetchUserData() {
          try {
            const userData = await fetch("http://172.31.17.153:3000/api/v1/getUserData", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },  
              body: JSON.stringify({ id })
            });
            const data = await userData.json();
    
            if (!userData.ok) {
              throw new Error(data.message);
            }
    
            setUsername(data.data.username);
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            Alert.alert('Error', 'Failed to load user data');        
          }
        }
        fetchUserData();
      }, [id]);
    

    const onRefresh = async () => {
        setRefreshing(true);
        // recall new posts to see if any new posts appeared
        setRefreshing(false);
    }

    return (
    <SafeAreaView className = 'bg-primary h-full'>
       <FlatList
       data = {[]}
       keyExtractor={(item) => item.$id}
       renderItem={({ item }) => (
        <Text className = "text-3xl text-white">{item.id}</Text>
       )}
       ListHeaderComponent={() => (
        <View className="my-6 px-4 space-y-6">
            <View className="flex-row justify-between items-center mb-6">
                    <Text className = "text-white font-bold" style={{ fontSize: 18 }}>
                        Great to have you back, {''}
                        <Text style = {{color: '#d8a838'}}>
                            Jaye
                        </Text>
                        !
                    </Text>
                    <ImageButton
                    imageSource={icons.direct_messages}
                    handlePress={() => router.push('/chatsPage')} 
                    imageContainerStyles = "w-[40px] h-[25px]" 
                    />
            </View>
            <SearchInput 
            placeholder = "Search something..."/>
        </View>
       )}
        ListEmptyComponent = {() => (
            <EmptyStateHome 
            title="Nothing to see..."
            subtitle="Be the first to upload a post!"
            />
        )}
        refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
       />
    </SafeAreaView>
  )
}

export default Home