import { Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Link, Redirect, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '@/components/CustomButton';

export default function HomeScreen() {
  return (
    <ThemedView
      style = {styles.container}
      lightColor = "#F6F0ED"
      darkColor= '#2A2B2E'>
      <Image
        style = {styles.image}
        source = {require('../assets/images/intro.png')} />
      <ThemedText
        style = {styles.title}
        lightColor = '#2A2B2E'
        darkColor= '#F6F0ED'
        type = 'title'>
        Welcome to {'\n'} CampusConnect! 
      </ThemedText>
      <ThemedView>
        <Text className='text-white text-lg'>
          Your handy higher-ed helper 🎉
        </Text>
      </ThemedView>

      <CustomButton 
      title="Create an account"
      handlePress={() => router.push('/accountcreation')}
      containerStyles="w-full justify-center mt-3"
      textStyles="text-lg text-center font-bold"
      buttonColor = "#d8a838"
      buttonWidth = "70%"
      maxButtonWidth = "400"
      />
      
      <CustomButton 
      title="Log in"
      handlePress={() => router.push('/login')}
      containerStyles="w-full justify-center mt-3 mb-3"
      textStyles="text-lg text-center font-bold"
      buttonColor = "#d8a838"
      buttonWidth = "70%"
      maxButtonWidth = "400"
      />
        <ThemedView
        style = {styles.signUpContainer}
        lightColor = "#F6F0ED"
        darkColor= '#2A2B2E'>
        <ThemedText
          style = {styles.text}
          lightColor = '#2A2B2E'
          darkColor= '#F6F0ED'
          type = 'default'>
          Click here to view the 
        </ThemedText>
        <Link href = "/home" asChild>
          <TouchableOpacity
              style = {styles.button}>
              <ThemedText
                style = {styles.text}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'
                type = 'default'>
                tabs.
              </ThemedText>  
            </TouchableOpacity>
          </Link>
        </ThemedView> 
  </ThemedView>);
}


const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: -300,
    marginBottom: 50,
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
    marginTop: -200
  },

  button: {
    backgroundColor: 'transparent'
  },

  signUpContainer: {
    alignItems:'center',
    flexDirection: 'row'
  }

});