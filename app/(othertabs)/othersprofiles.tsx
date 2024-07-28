
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, Animated, Easing, TouchableOpacity, Touchable } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import OthersPosts from './othersprofileposts';
import { useLocalSearchParams } from 'expo-router';

const Tab = createMaterialTopTabNavigator();

export default function othersProfile() {
    // 1. Use State Hooks
    const params = useLocalSearchParams()
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [major, setMajor] = useState('');
    const [university, setUniversity] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    const [interests, setInterests] = useState([])

    // 2. Colour Scheme for Tab Navigation Bar
    const colorScheme = useColorScheme();
    const screenOptions = {
      tabBarStyle: {
        backgroundColor: colorScheme === 'dark' ? '#161622': '#FFFFFF',
      },
      tabBarActiveTintColor: colorScheme === 'dark' ? '#F6F0ED': '#2A2B2E',
      tabBarInactiveTintColor: '#7b7b8b'
    };
  
    // 3. Get User Flairs + Interests Details
    async function getUserConfig() {
      setIsLoading(true)
      try {
          const results = await fetch(`http://192.168.1.98:3000/api/v1/getUserConfig/${params.userUuid}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              },  
          })
          const data = await results.json();
          
          setMajor(data.data.major)
          setUniversity(data.data.university)
          setYearOfStudy(data.data.year_of_study)
          setInterests(data.data.interests)

          if (!results.ok) {
              throw new Error(data.message);
          } 
  
      } catch (error) {
          console.error('Unable to get configuration details', error);
          Alert.alert('Error', 'Failed to get configuration details. Please try again later.');
    
      } finally {
          setIsLoading(false)
      }
  }

  useEffect(() => {
    getUserConfig();
  }, [params.userUuid]);

const onRefresh = async () => {
    setRefreshing(true);
    await getUserConfig();
    setRefreshing(false);
}

  // 4. Picking Profile Picture Image
  async function pickImage() {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          try {
            // Get the file extension from URI
            const fileExt = uri.split('.').pop();
            const fileName = `profile_picture.${fileExt}`;
  
            // Fetch the image file as a blob
            const fetchResponse = await fetch(uri);
            const blob = await fetchResponse.blob();
            
            // Create a FormData object to send the image file
            const formData = new FormData();
            formData.append('file', {
              uri,
              name: fileName,
              type: fetchResponse.headers.get('content-type') || 'image/jpeg',
            });
  
            // Upload the image to your backend
            const uploadResponse = await fetch(`http://192.168.1.98:3000/api/v1/uploadImage`, {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            
            const uploadData = await uploadResponse.json();
  
            if (!uploadResponse.ok) {
              throw new Error(uploadData.message);
            }
  
            // Extract the image URL from the response
            const imageUrl = uploadData.data.imageUrl;
  
            // Update the profile image URL in the database
            const updateResponse = await fetch(`http://192.168.1.98:3000/api/v1/updateProfileImage/${params.userUuid}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ profile_image_url: imageUrl }),
            });
  
            const updateData = await updateResponse.json();
  
            if (!updateResponse.ok) {
              throw new Error(updateData.message);
            }
  
            // Update local state with the new profile image URL
            setProfileImage(imageUrl);
  
          } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
          }
        }
      }
    });
  }

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
            {params.username}
          </ThemedText>
          <ThemedText
            style={styles.description}
            lightColor="#2A2B2E"
            darkColor="#F6F0ED">
            {yearOfStudy} Student studying {major} at {university}
          </ThemedText>
          <View style={styles.interestsContainer}>
                {interests.map((interest, index) => (
                    <View key={index} style={styles.interestBox}>
                        <Text style={styles.interestText}>{interest}</Text>
                    </View>
                ))}
          </View>
      </ThemedView>
      <Tab.Navigator screenOptions = {screenOptions}>
        <Tab.Screen name="Posts"> 
        {() => <OthersPosts userUuid = {params.userUuid} />}
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
    marginTop: 35,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#D0CECE'
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
  },
  interestBox: {
      backgroundColor: '#128F8B',
      padding: 10,
      borderRadius: 15,
      margin: 5,
  },
  interestText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#E2EFDA'
  },
});