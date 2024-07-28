import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/components/UserContext';

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
    const { userId } = useUser();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [followers, setFollowers] = useState(100);  // Example count
    const [following, setFollowing] = useState(150);  // Example count
    const [username, setUsername] = useState("");
  

    useEffect(() => { setUsername(userId.username); });


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
  <SafeAreaView className = "bg-primary h-full">
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../assets/images/favicon.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.username}> {username} </Text>
        <View style={styles.followContainer}>
          <Text style={styles.followText}>{followers} Followers {'  '}</Text>
          <Text style={styles.followText}>{following} Following</Text>
        </View>
      </View>
      <Tab.Navigator>
        <Tab.Screen name="Posts" component={Posts} />
        <Tab.Screen name="Reposts" component={Reposts} />
      </Tab.Navigator>
    </View>
  </SafeAreaView>
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