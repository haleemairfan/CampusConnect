import { Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Link, Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <ThemedView
      style = {styles.container}
      lightColor = "#F6F0ED"
      darkColor= '#161622'>
        <Image
          style = {styles.image}
          source = {require('../assets/images/intro.png')} />
        <ThemedText
          style = {styles.title}
          lightColor = '#161622'
          darkColor= '#F6F0ED'
          type = 'title'>
          Welcome to {'\n'} CampusConnect! 
        </ThemedText>
        <ThemedText
        style = {styles.text}
        lightColor = '#161622'
        darkColor= '#F6F0ED'
        type = 'default'>
          Your handy higher-ed helper! 🎉
        </ThemedText>

        <TouchableOpacity
          style = {styles.button}
          onPress = {() => router.push('/accountcreation')}>
          <ThemedText
            style = {styles.buttonText}
            lightColor = '#2A2B2E'
            darkColor= '#F6F0ED'
            type = 'default'>
            Create an Account
          </ThemedText>  
        </TouchableOpacity>
        
        <TouchableOpacity
          style = {styles.button}
          onPress = {() => router.push('/login')}>
          <ThemedText
            style = {styles.buttonText}
            lightColor = '#2A2B2E'
            darkColor= '#F6F0ED'
            type = 'default'>
            Log In
          </ThemedText>  
        </TouchableOpacity>
  </ThemedView>);
}


const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: -300,
    marginBottom: 30,
  },
  
  text: {
    textAlign: 'center',
    marginRight: 5
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },

  image: {
    height: 600,
    width: 600,
    resizeMode: 'contain',
    marginTop: -110
  },

  button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 16, 
    backgroundColor: 'transparent',
    borderColor: '#d8a838',
    borderWidth: 3,
    width: 250,
    marginTop: 20,
  },

  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },

  signUpContainer: {
    alignItems:'center',
    flexDirection: 'row'
  }

});