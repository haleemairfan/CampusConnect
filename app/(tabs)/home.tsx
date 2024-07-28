
import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, Animated, Easing, TouchableOpacity, Touchable } from 'react-native'
import React, { useEffect, useState, useRef, useCallback} from 'react'
import { Redirect, router } from 'expo-router'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import SearchInput from '@/components/SearchInput'
import EmptyStateHome from '@/components/EmptyStateHome'
import DropDownMenu from '@/components/DropDownMenu';
import { icons } from '../../constants'
import ImageButton from '@/components/ImageButton'
import { useUser } from '@/components/UserContext';

interface Post {
    post_uuid: string;
    user_uuid: string;
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

const Home = () => {
    const { userId } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [offset, setOffset] = useState(0);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const fetchPosts = async (isInitialLoad = false) => {
        if (isLoading || (!isInitialLoad && !hasMore)) return;

        setIsLoading(true);
        try {

            const results = await fetch(`http://192.168.50.176:3000/api/v1/memoryBasedCollaborativeFiltering?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            
            const data = await results.json();

            if (!results.ok) {
                throw new Error(data.message);
            }

            const postsWithState = data.data.posts.map((post: any) => ({
                ...post,
                liked: post.liked_by_user,
                bookmarked: post.bookmarked_by_user,
                scaleValue: new Animated.Value(1),
            }));

            setPosts(prevPosts => isInitialLoad ? postsWithState : [...prevPosts, ...postsWithState]);
            setHasMore(postsWithState.length === limit);
            setOffset(prevOffset => prevOffset + limit);
        } catch (error) {
            console.error('Unable to get posts', error);
            Alert.alert('Error', 'Failed to get posts. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(true);
    }, [userId.user_uuid]);

    const onRefresh = async () => {
        setRefreshing(true);
        fetchPosts(true);
        setRefreshing(false);
    };
    const loadMore = async () => {
        if (hasMore) {
            await fetchPosts(false);
        }
    };




    const updatePostCount = async (postId: string, likeCount: number, bookmarkCount: number, liked: boolean, bookmarked: boolean) => {
        try {
            const results = await fetch(`http://172.31.17.153:3000/api/v1/updatePostCount/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },  
                body: JSON.stringify({
                    like_count: likeCount,
                    bookmark_count: bookmarkCount,
                    liked: liked,
                    bookmarked: bookmarked
                }),
            });
            const data = await results.json();

        } catch (error) {
            console.error('Unable to update post count', error);
            Alert.alert('Error', 'Failed to update post count. Please try again later.');
      
        }
    }

    const handleLikePress = useCallback(async (postId: string) => {
        const postIndex = posts.findIndex(post => post.post_uuid === postId);
        if (postIndex !== -1) {
            const updatedPosts = [...posts];

            updatedPosts[postIndex] = {
                ...updatedPosts[postIndex],
                liked: !updatedPosts[postIndex].liked,
                like_count: updatedPosts[postIndex].liked ? updatedPosts[postIndex].like_count - 1 : updatedPosts[postIndex].like_count + 1,
                scaleValue: new Animated.Value(1),
            }

            setPosts(updatedPosts);

        try {
            await updatePostCount(
                postId, 
                updatedPosts[postIndex].like_count, 
                updatedPosts[postIndex].bookmark_count, 
                updatedPosts[postIndex].liked,
                updatedPosts[postIndex].bookmarked
            );
        } catch (error) {
            console.error('Unable to update like count', error);
        }

        Animated.sequence([
            Animated.timing(updatedPosts[postIndex].scaleValue, {
                toValue: 1.2,
                duration: 75,
                easing: Easing.ease,
                useNativeDriver: true,
            }),

        Animated.timing(updatedPosts[postIndex].scaleValue, {
            toValue: 1,
            duration: 75,
            easing: Easing.ease,
            useNativeDriver: true,
        }),
    ]).start();
    }
    }, [posts]);


    const handleBookmarkPress = useCallback(async (postId: string) => {
        const postIndex = posts.findIndex(post => post.post_uuid === postId);
        if (postIndex !== -1) {
            const updatedPosts = [...posts];

            updatedPosts[postIndex] = {
                ...updatedPosts[postIndex],
                bookmarked: !updatedPosts[postIndex].bookmarked,
                bookmark_count: updatedPosts[postIndex].bookmarked ? updatedPosts[postIndex].bookmark_count - 1 : updatedPosts[postIndex].bookmark_count + 1,
                scaleValue: new Animated.Value(1),
            }

            setPosts(updatedPosts);
    
        try {
            await updatePostCount(
                postId, 
                updatedPosts[postIndex].like_count, 
                updatedPosts[postIndex].bookmark_count, 
                updatedPosts[postIndex].liked,
                updatedPosts[postIndex].bookmarked
            );
        } catch (error) {
            console.error('Unable to update bookmark count', error);
        }

        Animated.sequence([
            Animated.timing(updatedPosts[postIndex].scaleValue, {
                toValue: 1.2,
                duration: 75,
                easing: Easing.ease,
                useNativeDriver: true,
            }),

        Animated.timing(updatedPosts[postIndex].scaleValue, {
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
            <View style = {styles.headerRow}>
                <View style = {styles.usernameTimeContainer}>
                    <ThemedText
                        style = {styles.postUsername}
                        lightColor = '#2A2B2E'
                        darkColor= '#F6F0ED'>
                        {item.users.username} {' '}
                    </ThemedText>

                    <ThemedText
                        style = {styles.postTime}
                        lightColor = '#2A2B2E'
                        darkColor= '#F6F0ED'>
                        {formatTimeDifference(item.post_date, item.post_time)}
                    </ThemedText>
                </View>
                <DropDownMenu 
                postUserId = {item.user_uuid}
                currentUserId = {userId.user_uuid}
                postUuid = {item.post_uuid}
                postTitle = {item.post_title}
                postBody = {item.post_body} />
            </View>

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
    data={posts}
    keyExtractor={(item) => item.post_uuid}
    renderItem={renderPost}
    ListHeaderComponent={() => (
        <View className="my-6 px-4 space-y-6">
            <View className="flex-row justify-between items-center mb-6">
                <ThemedText
                    style={styles.welcomeBanner}
                    lightColor="#2A2B2E"
                    darkColor="#F6F0ED"
                >
                    Great to have you, {''}
                    <Text style={{ color: '#d8a838' }}>
                        {userId.username}
                    </Text>
                    !
                </ThemedText>
                <ImageButton
                    imageSource={icons.direct_messages}
                    handlePress={() => router.push('/messages')}
                    imageContainerStyles="w-[40px] h-[25px]"
                />
            </View>
            <SearchInput
                placeholder="Search something..."
            />
        </View>
    )}
    ListEmptyComponent={() => (
        <EmptyStateHome
            title="Nothing to see..."
            subtitle="Be the first to upload a post!"
        />
    )}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    onEndReached={loadMore}
    onEndReachedThreshold={0.5}
    />

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 35, 
      },

    welcomeBanner: {
        fontSize: 18,
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

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },

    usernameTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    