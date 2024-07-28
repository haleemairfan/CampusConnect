
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, Animated, Easing, TouchableOpacity, Touchable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@/components/UserContext';
import { Redirect, router } from 'expo-router'

import EmptyStateHome from '@/components/EmptyStateHome';
import DropDownMenu from '@/components/DropDownMenu';
import { icons } from '../../constants';

interface Post {
  post_uuid: string;
  user_uuid: string;
  users: {
    username: string;
    user_flairs: string;
  };
  post_date: string;
  post_time: string;
  post_title: string;
  post_body: string;
  like_count: number;
  bookmark_count: number;
  liked: boolean;
  bookmarked: boolean;
  comment_count: number;
  tags: string;
  scaleValue: Animated.Value;
}

const Bookmarks = () => {
  const { userId } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Async Function to only get Bookmarked Posts
  async function getBookmarkedPosts() {
    setIsLoading(true)
    try {
        const results = await fetch(`http://192.168.1.98:3000/api/v1/getBookmarkedPosts/${userId.user_uuid}`, {
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
          liked: post.liked_by_user,
          bookmarked: post.bookmarked_by_user,
          scaleValue: new Animated.Value(1),
      }));

      setPosts(postsWithState);

    } catch (error) {
        console.error('Unable to get posts', error);
        Alert.alert('Error', 'Failed to get posts. Please try again later.');
  
    } finally {
        setIsLoading(false);
    }
}
  
useEffect(() => {
    getBookmarkedPosts();
  }, [userId.user_uuid]);

const onRefresh = async () => {
  setRefreshing(true);
  await getBookmarkedPosts();
  setRefreshing(false);
}

const updatePostCount = async (postId: string, likeCount: number, bookmarkCount: number, liked: boolean, bookmarked: boolean) => {
    try {
        const results = await fetch(`http://192.168.1.98:3000/api/v1/updatePostCount/${postId}`, {
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

const renderPost = ({ item }: {item: Post}) => {
  const handleNavigatetoComments = () => {
      router.push({
          pathname: '/comments',
          params: {
              postTitle: item.post_title,
              postBody: item.post_body,
              postUuid: item.post_uuid
          }
      });
  };

  const handleFlairPress = (flair: string ) => {
      router.push(`/search/${flair}`)
  }


  let userFlairs = item.users.user_flairs
  ? item.users.user_flairs
      .replace(/^\{|\}$/g, '') // Remove curly brackets at the start and end
      .split(',') // Split the string by commas
      .map((flair) => flair.replace(/"/g, '').trim()) // Remove any double quotes and trim whitespace
  : [];

let tags = item.tags
  ? item.tags
      .replace(/^\{|\}$/g, '') // Remove curly brackets at the start and end
      .split(',') // Split the string by commas
      .map((tag) => tag.replace(/"/g, '').trim()) // Remove any double quotes and trim whitespace
  : [];

  let userUuid = item.user_uuid
  let username = item.users.username
  
return (
  <ThemedView
  style={styles.postContainer}
  lightColor = "#F6F0ED"
  darkColor= "#161622">
      <View style = {styles.headerRow}>
          <View style = {styles.usernameTimeContainer}>
                <TouchableOpacity
                    style={styles.postUsernameContainer}
                    onPress={() => {
                        if (userId.user_uuid === item.user_uuid) {
                            router.push({ pathname: '/profile' });
                        } else {
                            router.push({ pathname: '/othersprofiles', params: { userUuid, username } });
                        }
                    }}>
                    <Text
                        style={styles.postUsername}
                        lightColor='#2A2B2E'
                        darkColor='#F6F0ED'>
                        {item.users.username} {' '}
                    </Text>
                </TouchableOpacity>

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
          postBody = {item.post_body}
          postTags = {item.tags} />
      </View>

      <View style={styles.flairsContainer}>
          {userFlairs.map((flair, index) => (
          <TouchableOpacity
              key={index}
              style={[styles.flairBox, { backgroundColor: getBackgroundColorForFlair(index) }]}
              onPress={() => handleFlairPress(flair)}>
              <Text style={[styles.flairText, {color: getTextColorForFlair(index) }]}>{flair}</Text>
          </TouchableOpacity>
          ))}
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

      <View style={styles.tagsContainer}>
          {tags.map((tags, index) => (
          <TouchableOpacity
              key={index}
              style={[styles.tagBox]}
              onPress={() => handleFlairPress(tags)}>
              <Text style={[styles.tagText]}>#{tags}</Text>
          </TouchableOpacity>
          ))}
      </View>

      <View style = {styles.bottomRow}>
          <TouchableOpacity onPress = {handleNavigatetoComments} style = {styles.commentsContainer}>
              <Image 
                  source = {icons.comment_icon}
                  className = "w-[30px] h-[30px] mt-3"
                  resizeMode = "contain" />
              <ThemedText style = {styles.commentText}>
              {item.comment_count === 1 
                  ? `${item.comment_count} comment` 
                  : `${item.comment_count} comments`}

              </ThemedText>
          </TouchableOpacity>

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
      </View>

  </ThemedView>
)};

  return (
    <ThemedView
    style={styles.container}
    lightColor="#F6F0ED"
    darkColor="#161622">
    <FlatList
      data={posts}
      keyExtractor={(item) => item.post_uuid}
      renderItem={renderPost}
      ListEmptyComponent = {() => (
        <EmptyStateHome 
        title="Nothing to see..."
        subtitle="Bookmark something!"
        />
    )}
    refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} />
    </ThemedView>
  );
};

export default Bookmarks;

const getBackgroundColorForFlair = (index: number) => {
  const backgroundColors = ['#B4C6E7', '#FFE699', '#FF7C80']; 
  return backgroundColors[index] || '#D3D3D3'; 
};

const getTextColorForFlair = (index: number) => {
  const textColors = ['#08204D', '#473C38', '#4D080A']; 
  return textColors[index] || '#000000'; 
};

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

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },

    usernameTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    commentsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    commentText: {
        fontSize: 14,
        marginTop: 11,
        marginLeft: 8,
        color: '#7b7b8b',
    },

    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 77,
    },

    icon: {
        marginRight: 9,
    },

    postUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#FFF',
    },

    postTime: {
        fontSize: 14,
        marginBottom: 8,
        color: '#7b7b8b',
    },

    postTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    postBody: {
        fontSize: 15,
    },

    postCount: {
        marginTop: 10,
        fontSize: 14,
        paddingRight: 14,
        alignItems: 'center',
    },

    flairsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    flairBox: {
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10, 
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 25,
    },
        
    flairText: {
    fontSize: 11,
    fontWeight: 'bold',
    },

    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    tagBox: {
    padding: 5,
    marginRight: 5,
    marginTop: 20,
    },
        
    tagText: {
    fontSize: 12,
    color: '#D0CECE',
    },

    postUsernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
})
  

