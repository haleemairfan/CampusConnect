import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, Animated, Easing, TouchableOpacity, Touchable, ActivityIndicator, TextInput, ScrollView } from 'react-native'
import React, { useEffect, useState, useRef, useCallback} from 'react'
import { Redirect, router, useLocalSearchParams } from 'expo-router'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FormField from '@/components/FormField'

import SearchInput from '@/components/SearchInput'
import EmptyStateHome from '@/components/EmptyStateHome'
import DropDownMenu from '@/components/DropDownMenu';
import { icons } from '../../constants'
import ImageButton from '@/components/ImageButton'
import { useUser } from '@/components/UserContext';
import CommentDropdownMenu from '@/components/CommentDropDownMenu';
import IPaddress from '@/IPaddress';


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

interface Comment {
  users: {
    username: string;
  };
  comment_uuid: string;
  user_uuid: string;
  post_uuid: string;
  comment_date: string;
  comment_time: string;
  comment_body: string;
  comment_liked: boolean;
  comment_disliked: boolean;
  comment_like_count: number;
  comment_dislike_count: number;
  scaleValue: Animated.Value;
}

const Comments = () => {
  const post_items = useLocalSearchParams()
  const { userId } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [commentBody, setCommentBody] = useState('');

  async function getSinglePost() {
    setIsLoading(true)
    try {
        const results = await fetch(`http://${IPaddress}:3000/api/v1/singlePost/${post_items.postUuid}`, {
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
        setIsLoading(false)
    }
}

useEffect(() => {
  getSinglePost();
}, [userId.user_uuid]);

  async function getAllComments() {
    setIsLoading(true)
    try {
        const results = await fetch(`http://${IPaddress}:3000/api/v1/allComments/${post_items.postUuid}/${userId.user_uuid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },  
        })
        const data = await results.json();

        if (!results.ok) {
            throw new Error(data.message);
        } 

        const commentsWithState = data.data.comments.map((comment: any) => ({
            ...comment,
            comment_liked: comment.liked_by_user,
            comment_disliked: comment.disliked_by_user,
            scaleValue: new Animated.Value(1),
        }));

        setComments(commentsWithState);

    } catch (error) {
        console.error('Unable to get comments', error);
        Alert.alert('Error', 'Failed to get comments. Please try again later.');

    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    getAllComments();
  }, [post_items.postUuid]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllComments();
    setRefreshing(false);
}

  async function createComment() {
    if(!commentBody.trim()) {
      return Alert.alert('Please fill in all the fields.')
    }
    
    const trimmedBody = commentBody.trim(); // Ignores any trailing whitespace and newlines from body text

    setIsLoading(true)
    try {
      //replace with your machine IP address
      const results = await fetch(`http://${IPaddress}:3000/api/v1/createComment/${userId.user_uuid}/${post_items.postUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment_body: trimmedBody,
        }),
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      Alert.alert('Success', 'Comment created successfully!');
        setCommentBody('');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to create comment.',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
      } finally {
        setIsLoading(false);
      }
    };

  const updatePostCount = async (postId: string, likeCount: number, bookmarkCount: number, liked: boolean, bookmarked: boolean) => {
    try {
        const results = await fetch(`http://${IPaddress}:3000/api/v1/updatePostCount/${postId}`, {
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

const updateCommentCount = async (comment_uuid: string, commentLikeCount: number, commentDislikeCount: number, commentLiked: boolean, commentDisliked: boolean) => {
  try {
      const results = await fetch(`http://${IPaddress}:3000/api/v1/updatePostCount/${comment_uuid}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },  
          body: JSON.stringify({
              comment_like_count: commentLikeCount,
              comment_dislike_count: commentDislikeCount,
              comment_liked: commentLiked,
              comment_disliked: commentDisliked
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

  const handleCommentLikePress = useCallback(async (comment_uuid: string) => {
    const commentIndex = comments.findIndex(comment => comment.comment_uuid === comment_uuid);
    if (commentIndex !== -1) {
        const updatedComments = [...comments];

        updatedComments[commentIndex] = {
            ...updatedComments[commentIndex],
            comment_liked: !updatedComments[commentIndex].comment_liked,
            comment_like_count: updatedComments[commentIndex].comment_liked ? updatedComments[commentIndex].comment_like_count - 1 : updatedComments[commentIndex].comment_like_count + 1,
            scaleValue: new Animated.Value(1),
        }

        setComments(updatedComments);

    try {
        await updateCommentCount(
            comment_uuid, 
            updatedComments[commentIndex].comment_like_count, 
            updatedComments[commentIndex].comment_dislike_count, 
            updatedComments[commentIndex].comment_liked,
            updatedComments[commentIndex].comment_disliked
        );
    } catch (error) {
        console.error('Unable to update like count', error);
    }

    Animated.sequence([
        Animated.timing(updatedComments[commentIndex].scaleValue, {
            toValue: 1.2,
            duration: 75,
            easing: Easing.ease,
            useNativeDriver: true,
        }),

    Animated.timing(updatedComments[commentIndex].scaleValue, {
        toValue: 1,
        duration: 75,
        easing: Easing.ease,
        useNativeDriver: true,
    }),
  ]).start();
  }
  }, [comments]);

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

const handleCommentDislikePress = useCallback(async (comment_uuid: string) => {
  const commentIndex = comments.findIndex(comment => comment.comment_uuid === comment_uuid);
  if (commentIndex !== -1) {
      const updatedComments = [...comments];

      updatedComments[commentIndex] = {
          ...updatedComments[commentIndex],
          comment_disliked: !updatedComments[commentIndex].comment_disliked,
          comment_dislike_count: updatedComments[commentIndex].comment_disliked ? updatedComments[commentIndex].comment_dislike_count - 1 : updatedComments[commentIndex].comment_dislike_count + 1,
          scaleValue: new Animated.Value(1),
      }

      setComments(updatedComments);

  try {
      await updateCommentCount(
          comment_uuid, 
          updatedComments[commentIndex].comment_like_count, 
          updatedComments[commentIndex].comment_dislike_count, 
          updatedComments[commentIndex].comment_liked,
          updatedComments[commentIndex].comment_disliked
      );
  } catch (error) {
      console.error('Unable to update dislike count', error);
  }

  Animated.sequence([
      Animated.timing(updatedComments[commentIndex].scaleValue, {
          toValue: 1.2,
          duration: 75,
          easing: Easing.ease,
          useNativeDriver: true,
      }),

  Animated.timing(updatedComments[commentIndex].scaleValue, {
      toValue: 1,
      duration: 75,
      easing: Easing.ease,
      useNativeDriver: true,
  }),
]).start();
}
}, [comments]);

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
            postBody = {item.post_body} />
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
  

const renderComment = ({ item }: {item: Comment}) => (
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
                  {formatTimeDifference(item.comment_date, item.comment_time)}
              </ThemedText>
          </View>
          <CommentDropdownMenu
          commentUserId = {item.user_uuid}
          currentUserId = {userId.user_uuid}
          postUuid = {item.post_uuid}
          commentUuid = {item.comment_uuid}
          commentBody = {item.comment_body} />
      </View>

      <ThemedText
      style = {styles.postBody}
      lightColor = '#2A2B2E'
      darkColor= '#F6F0ED'>
          {item.comment_body}
      </ThemedText>

      <View style = {styles.bottomRow}>
          <ThemedView
          style={styles.iconsCommentContainer}
          lightColor = "#F6F0ED"
          darkColor= "#161622">
                
                <TouchableOpacity onPress = {() => handleCommentLikePress(item.comment_uuid)}>
                        <Animated.Image
                            source = {item.comment_liked ? icons.new_like_icon : icons.like_icon}
                            className = "w-[30px] h-[30px] mt-3"
                            resizeMode = 'contain'
                            style = {[styles.icon, {transform: [{ scale: item.scaleValue }] }]} />
                </TouchableOpacity>

                <ThemedText
                style = {styles.postCount}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'>
                    {item.comment_like_count}
                </ThemedText>

              <TouchableOpacity onPress = {() => handleCommentDislikePress(item.comment_uuid)}>
                  <Animated.Image
                      source = {item.comment_disliked ? icons.new_dislike_icon : icons.dislike_icon}
                      className = "w-[30px] h-[30px] mt-3"
                      resizeMode = 'contain'
                      style = {[styles.icon, {transform: [{ scale: item.scaleValue }] }]} />
              </TouchableOpacity>
              
              <ThemedText
              style = {styles.postCount}
              lightColor = '#2A2B2E'
              darkColor= '#F6F0ED'>
                  {item.comment_dislike_count}
              </ThemedText>
          </ThemedView>
      </View>

  </ThemedView>
  );


  return (
    <ThemedView
    style={styles.container}
    lightColor="#F6F0ED"
    darkColor="#161622">
    
    <ScrollView contentContainerStyle = {styles.scrollContainer} refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
    {/* Section 1: Posts */}
    <View style = {styles.postsContainer}>
    <FlatList
    data = {posts}
    keyExtractor={(item) => item.post_uuid}
    renderItem={renderPost}
    />
    </View>
    
    {/* Section 2: Make a Comment */}
    <View style = {styles.makeCommentContainer}>
    <ThemedText style= {styles.commentsHeader}>
        Make a Comment
    </ThemedText>

    <ThemedView 
    lightColor="#F6F0ED"
    darkColor="#161622"
    style = {styles.commentInputBox}>
      <TextInput 
      value = {commentBody}
      placeholder = "Comment something..."
      placeholderTextColor="#7b7b8b"
      onChangeText = {setCommentBody}
      multiline = {true}
      className="flex-1 text-white text-base"
      styles = {styles.commentInput}
      />
    </ThemedView>


    <TouchableOpacity
      style={styles.button}
      onPress={isLoading ? undefined: createComment}
      disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator size = "small" color = "#d8a838" />
      ) : (
        <ThemedText
        style={styles.buttonText}
        lightColor = "#2A2B2E"
        darkColor = "#F6F0ED"
        type="default">
        {isLoading ? "Publishing..." : "Create comment!"}
        </ThemedText>
      )}
    </TouchableOpacity>
    </View>
      
    {/* Section 3: Comments */}
    <View style = {styles.commentContainer}>
      <ThemedText style= {styles.commentsHeader}>
        Comments
      </ThemedText>

      <FlatList
      data = {comments}
      keyExtractor={(item) => item.comment_uuid}
      renderItem={renderComment}
      />
    </View>
    </ScrollView>
    </ThemedView>
  )
}

export default Comments

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
      paddingTop: 50,
    },

  scrollContainer: {
    paddingVertical: 20,
  },

  postsContainer: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d8a838',
  },

  commentInput: {
    flex: 1, 
    textAlignVertical: 'center',
    paddingVertical: 0,
  },

  commentInputBox: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#161622',
    borderRadius: 16,
    borderWidth: 2,
  },

  makeCommentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 15,
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#d8a838',
    },

  commentContainer: {
  },

  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 15,
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

  iconsCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 195,
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
      paddingRight: 14,
      alignItems: 'center',
  },

  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    alignItems: "center",
  },

  button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 16, 
    backgroundColor: 'transparent',
    borderColor: '#d8a838',
    borderWidth: 3,
    width: 325,
    marginTop: 20,
    alignItems: "center",
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