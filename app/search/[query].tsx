

import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useCallback} from 'react'
import { Redirect, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import SearchInput from '@/components/SearchInput'
import EmptyStateHome from '@/components/EmptyStateHome'
import { useLocalSearchParams } from 'expo-router'
import { useUser } from '@/components/UserContext'
import { icons } from '../../constants'

interface Post {
  post_uuid: string;
  users: {
    username: string;
  };
  post_date: string;
  post_time: string;
  post_title: string;
  post_body: string;
  like_count: number;
  bookmark_count: number;
  liked: boolean;
  bookmarked: boolean;
  scaleValue: Animated.Value;
}

const Search = () => {
  const { userId } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const { query } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function getSearchedPosts() {
    setIsLoading(true)
    try {
        const results = await fetch(`http://192.168.1.98:3000/api/v1/searchedPosts/${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },  
        })
        const data = await results.json();

        if (!results.ok) {
            throw new Error(data.message);
        } 

        const postsWithState = data.data.posts.map((post: any) => ({
            ...post,
            liked: post.liked || false,
            bookmarked: post.bookmarked || false,
            scaleValue: new Animated.Value(1),
        }));

        setPosts(postsWithState);

    } catch (error) {
        console.error('Unable to get posts', error);
        Alert.alert('Error', 'Failed to get posts. Please try again later.');
  
    } finally {
        setIsLoading(false)
    }
}

useEffect(() => {
    getSearchedPosts();
  }, [userId.user_uuid]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getSearchedPosts();
    setRefreshing(false);
}

  const updatePostCount = async (postId: string, likeCount: number, bookmarkCount: number) => {
    try {
        const results = await fetch(`http://192.168.1.98:3000/api/v1/updatePostCount/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },  
            body: JSON.stringify({
                postId: postId,
                like_count: likeCount,
                bookmark_count: bookmarkCount,
            }),
        });
        const data = await results.json();

    } catch (error) {
        console.error('Unable to update post count', error);
        Alert.alert('Error', 'Failed to update post count. Please try again later.');
  
    }
}

  const handleLikePress = useCallback(async (postId: string) => {
    const post = posts.find(post => post.post_uuid === postId);
    if (post) {
        const updatedLikeCount = post.liked ? post.like_count - 1: post.like_count + 1;

        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.post_uuid === postId
                    ? {...post, liked: !post.liked, like_count: updatedLikeCount, scaleValue: new Animated.Value(1) }
                    : post
            )
        );

    try {
        await updatePostCount(postId, updatedLikeCount, post.bookmark_count);
    } catch (error) {
        console.error('Unable to update like count', error);
    }

    Animated.sequence([
        Animated.timing(post.scaleValue, {
            toValue: 1.2,
            duration: 75,
            easing: Easing.ease,
            useNativeDriver: true,
        }),

    Animated.timing(post.scaleValue, {
        toValue: 1,
        duration: 75,
        easing: Easing.ease,
        useNativeDriver: true,
    }),
]).start();
}
}, [posts]);


const handleBookmarkPress = useCallback(async (postId: string) => {
    const post = posts.find(post => post.post_uuid === postId);
    if (post) {
        const updatedBookmarkCount = post.bookmarked ? post.bookmark_count - 1: post.bookmark_count + 1;

        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.post_uuid === postId
                    ? {...post, bookmarked: !post.bookmarked, bookmark_count: updatedBookmarkCount, scaleValue: new Animated.Value(1) }
                    : post
            )
        );

    try {
        await updatePostCount(postId, post.like_count, updatedBookmarkCount);
    } catch (error) {
        console.error('Unable to update bookmark count', error);
    }

    Animated.sequence([
        Animated.timing(post.scaleValue, {
            toValue: 1.2,
            duration: 75,
            easing: Easing.ease,
            useNativeDriver: true,
        }),

    Animated.timing(post.scaleValue, {
        toValue: 1,
        duration: 75,
        easing: Easing.ease,
        useNativeDriver: true,
    }),
]).start();
}
}, [posts]);

const formatTimeDifference = (postDate, postTime) => {
    const postDateTime = new Date(`${postDate}T${postTime}Z`);

    // Calculate current date/time adjusted for local timezone offset
    // This is because new Date() returns the date in UTC time and NOT local time
    const now = new Date();
    const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localNow = new Date(now.getTime() - timezoneOffsetMs)

    const difference = localNow - postDateTime
    const secondsDifference = Math.floor(difference / 1000);

    if (secondsDifference < 60) {
        return `${secondsDifference} seconds ago`;
    } else if (secondsDifference < 3600) {
        const minutes = Math.floor(secondsDifference / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (secondsDifference < 86400) {
        const hours = Math.floor(secondsDifference / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(secondsDifference / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

const renderPost = ({ item }: {item: Post}) => (
    <ThemedView
    style={styles.postContainer}
    lightColor = "#F6F0ED"
    darkColor= "#161622">
        <ThemedText
        style = {styles.postUsername}
        lightColor = '#2A2B2E'
        darkColor= '#F6F0ED'>
            {item.users.username} {' '}
            <ThemedText
            style = {styles.postTime}
            lightColor = '#2A2B2E'
            darkColor= '#F6F0ED'>
            {formatTimeDifference(item.post_date, item.post_time)}
            </ThemedText>
        </ThemedText>

        <ThemedText
        style = {styles.postTitle}
        lightColor = '#2A2B2E'
        darkColor= '#F6F0ED'>
            {item.post_title}
        </ThemedText>

        <ThemedText
        style = {styles.postBody}
        lightColor = '#2A2B2E'
        darkColor= '#F6F0ED'>
            {item.post_body}
        </ThemedText>

        <ThemedView
        style={styles.iconsContainer}
        lightColor = "#F6F0ED"
        darkColor= "#161622">

            <TouchableOpacity onPress = {() => handleLikePress(item.post_uuid)}>
                <Animated.Image
                    source = {item.liked ? icons.new_like_icon : icons.like_icon}
                    className = "w-[30px] h-[30px] mt-3"
                    resizeMode = 'contain'
                    style = {[styles.icon, {transform: [{ scale: item.scaleValue }] }]} />
            </TouchableOpacity>

            <ThemedText
            style = {styles.postCount}
            lightColor = '#2A2B2E'
            darkColor= '#F6F0ED'>
                {item.like_count}
            </ThemedText>

            <TouchableOpacity onPress = {() => handleBookmarkPress(item.post_uuid)}>
                <Animated.Image
                    source = {item.bookmarked ? icons.new_bookmark_icon : icons.bookmark_icon}
                    className = "w-[30px] h-[30px] mt-3"
                    resizeMode = 'contain'
                    style = {[styles.icon, {transform: [{ scale: item.scaleValue }] }]} />
            </TouchableOpacity>
            
            <ThemedText
            style = {styles.postCount}
            lightColor = '#2A2B2E'
            darkColor= '#F6F0ED'>
                {item.bookmark_count}
            </ThemedText>
        </ThemedView>
    </ThemedView>
)

return (
  <ThemedView
  style={styles.container}
  lightColor="#F6F0ED"
  darkColor="#161622">
     <FlatList
     data = {posts}
     keyExtractor={(item) => item.post_uuid}
     renderItem={renderPost}
     ListHeaderComponent={() => (
      <View className="my-6 px-4 space-y-6">
          <View className="flex-column items-start mb-6">
                  <ThemedText
                  style={styles.welcomeBanner}
                  lightColor="#2A2B2E"
                  darkColor="#F6F0ED">
                      You searched:
                  </ThemedText>
                  <Text
                  style = {styles.searchQuery}>
                    {query}
                  </Text>  
          </View>
          <SearchInput 
          placeholder = {query}/>
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
  </ThemedView>
)
}

export default Search

const styles = StyleSheet.create({
  container: {
      flex: 1,
      paddingTop: 35, 
    },

  welcomeBanner: {
      fontSize: 18,
      fontWeight: 'bold',
  },

  searchQuery: {
    color: '#d8a838',
    fontSize: 24,
    fontWeight: 'bold',
  },

  postContainer: {
      padding: 15,
      marginBottom: 16,
      marginLeft: 10,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#7b7b8b',
      width: 340,
      alignItems: 'flex-start',
  },

  iconsContainer: {
      backgroundColor: "transparent",
      flexDirection: 'row',
      alignItems: 'center',
      width: 330,
      justifyContent: 'flex-end',
  },

  icon: {
      marginRight: 10,
  },

  postUsername: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8
  },

  postTime: {
      fontSize: 14,
      marginBottom: 8,
      color: '#7b7b8b',
  },

  postTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
  },

  postBody: {
      fontSize: 14,
  },

  postCount: {
      marginTop: 10,
      fontSize: 14,
      marginRight: 20,
      alignItems: 'center',
  }
})