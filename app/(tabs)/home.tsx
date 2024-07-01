
import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, router } from 'expo-router'

import SearchInput from '@/components/SearchInput'
import EmptyStateHome from '@/components/EmptyStateHome'
import { icons } from '../../constants'
import ImageButton from '@/components/ImageButton'

const Home = () => {
    const [data, setData] = useState([]);
    const [isLoading, setisLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    async function getAllPosts () {
        try {
            const results = await fetch('http://192.168.1.98:3000/api/v1/Posts');
            const data = await results.json();
            const post = data.data.posts;
            const postTitle = post.post_title;
            const postBody = post.post_body;
            console.log(postTitle);
            console.log(postBody)
        } catch (error) {
            console.error('Error fetching posts:', error.message);
            return [];
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setisLoading(true);
        
        try {
            const response = await getAllPosts();
            setData(response)
        } catch (error) {
            Alert.alert('Error', error.message)
        } finally {
            setisLoading(false);
        }
        }
        fetchData();  
    }, []);
    console.log(data)

    const onRefresh = async () => {
        setRefreshing(true);
        await getAllPosts();
        setRefreshing(false);
    }


    return (
    <SafeAreaView className = 'bg-primary h-full'>
       <FlatList
       data = {data}
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
                    handlePress={() => router.push('/messages')} 
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