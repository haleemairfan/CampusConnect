import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '.././context'


const Tab = createMaterialTopTabNavigator();

const Posts = () => (
  <ThemedView style={styles.tabContainer} lightColor="#F6F0ED" darkColor="#2A2B2E">
    <ThemedText lightColor="#2A2B2E" darkColor="#F6F0ED">Posts</ThemedText>
    {/* Render posts here */}
  </ThemedView>
);

const Reposts = () => (
  <ThemedView style={styles.tabContainer} lightColor="#F6F0ED" darkColor="#2A2B2E">
    <ThemedText lightColor="#2A2B2E" darkColor="#F6F0ED">Reposts</ThemedText>
    {/* Render reposts here */}
  </ThemedView>
);

export default function ProfilePage() {
  const { getGlobalUserId } = useAppContext();
  const id = getGlobalUserId();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [followers, setFollowers] = useState(100);  // Example count
  const [following, setFollowing] = useState(150);  // Example count
  const [username, setUsername] = useState("");

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

  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

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
    <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#2A2B2E">
      <ThemedView style={styles.profileContainer} lightColor="#F6F0ED" darkColor="#2A2B2E">
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../assets/images/favicon.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <ThemedText style={styles.username} lightColor="#2A2B2E" darkColor="#F6F0ED"> {username} </ThemedText>
        <ThemedView style={styles.followContainer} lightColor="#F6F0ED" darkColor="#2A2B2E">
          <ThemedText style={styles.followText} lightColor="#2A2B2E" darkColor="#F6F0ED">{followers} Followers</ThemedText>
          <ThemedText style={styles.followText} lightColor="#2A2B2E" darkColor="#F6F0ED">{following} Following</ThemedText>
        </ThemedView>
      </ThemedView>
      <Tab.Navigator>
        <Tab.Screen name="Posts" component={Posts} />
        <Tab.Screen name="Reposts" component={Reposts} />
      </Tab.Navigator>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
