import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
<<<<<<< HEAD
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context';

const Tab = createMaterialTopTabNavigator();

const Posts = () => (
  <View style={styles.tabContainer}>
    <Text>Posts</Text>
    {/* Render posts here */}
  </View>
);

const Reposts = () => (
  <View style={styles.tabContainer}>
    <Text>Reposts</Text>
    {/* Render reposts here */}
  </View>
);

export default function ProfilePage() {
    const { getGlobalUserId } = useAppContext();
    const id = getGlobalUserId();
=======

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import { useUser } from '@/components/UserContext';
import Posts from '../(othertabs)/posts';
import Reposts from '../(othertabs)/reposts';

const Tab = createMaterialTopTabNavigator();

export default function ProfilePage() {
    // 1. Use State Hooks
    const { userId } = useUser();
>>>>>>> d2efe95eb77000f24b5becb6b6336b037807a6df
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [followers, setFollowers] = useState(100);  // Example count
    const [following, setFollowing] = useState(150);  // Example count
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [username, setUsername] = useState("");

<<<<<<< HEAD
    useEffect(() => {
        async function fetchUserData() {
            try {
              console.log(id)
              const userData = await fetch("http://192.168.50.176:3000/api/v1/getUserData", {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },  
                  
                  body: JSON.stringify({
                      id
                  })

              })
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
=======
    // 2. Colour Scheme for Tab Navigation Bar
    const colorScheme = useColorScheme();
    const screenOptions = {
      style: {
        backgroundColor: colorScheme === 'dark' ? '#161622': '#FFFFFF',
      },
      activeTintColor: colorScheme === 'dark' ? '#F6F0ED': '#2A2B2E',
      inactiveTintColor: '#7b7b8b'
    };
    
    // 3. Async Function to Get All Posts from User
    async function getUserPosts() {
      setIsLoading(true)
      try {
          const results = await fetch(`http://192.168.1.98:3000/api/v1/getPosts/${userId.user_uuid}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              },  
          })
          const data = await results.json();

          if (!results.ok) {
              throw new Error(data.message);
          } 
          
          setPosts(data.data.posts);

      } catch (error) {
          console.error('Unable to get posts', error);
          Alert.alert('Error', 'Failed to get posts. Please try again later.');
    
      } finally {
          setIsLoading(false);
      }
  }
    
  useEffect(() => {
      getUserPosts();
    }, [userId.user_uuid]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserPosts();
    setRefreshing(false);
  }
>>>>>>> d2efe95eb77000f24b5becb6b6336b037807a6df

  // 4. Picking Profile Picture Image
  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    const Reposts = () => (
      <View style={styles.tabContainer}>
        <Text>Reposts</Text>
        {/* Render reposts here */}
      </View>
    );

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setProfileImage(uri);
        } else {
          setProfileImage(null);
        }
      }
    });
  };

  return (
    <ThemedView
    style={styles.container}
    lightColor="#F6F0ED"
    darkColor="#161622">
      <ThemedView
        style={styles.profileContainer}
        lightColor="#F6F0ED"
        darkColor="#161622">
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../assets/images/favicon.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
          <ThemedText
            style={styles.username}
            lightColor="#2A2B2E"
            darkColor="#F6F0ED">
            {userId.username}
          </ThemedText>
        <View style={styles.followContainer}>
          <ThemedText
            style={styles.followText}
            lightColor="#2A2B2E"
            darkColor="#F6F0ED">
            {followers} Followers
          </ThemedText>
          <ThemedText
          style={styles.followText}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          {following} Following
        </ThemedText>
        </View>
      </ThemedView>
      <Tab.Navigator tabBarOptions = {screenOptions}>
        <Tab.Screen name="Posts"> 
        {() => <Posts posts={posts} refreshing={refreshing} onRefresh={onRefresh}/>}
        </Tab.Screen>
        <Tab.Screen name="Reposts"> 
        {() => <Reposts posts={posts} refreshing={refreshing} onRefresh={onRefresh}/>}
        </Tab.Screen>
      </Tab.Navigator>
  </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 10,
  },
  followText: {
    fontSize: 16,
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});