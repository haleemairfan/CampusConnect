import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
      <Link href="/accountcreation" asChild>
        <TouchableOpacity
          style = {styles.button}>
            <ThemedText
              style = {styles.text}
              lightColor = '#2A2B2E'
              darkColor= '#F6F0ED'
              type = 'default'>
              Create an account 
            </ThemedText>
        </TouchableOpacity>
      </Link>
      
      
      <ThemedView
        style = {styles.signUpContainer}
        lightColor = "#F6F0ED"
        darkColor= '#2A2B2E'>
        <ThemedText
          style = {styles.text}
          lightColor = '#2A2B2E'
          darkColor= '#F6F0ED'
          type = 'default'>
          If you already have an account 
        </ThemedText>
        <Link href = "/login" asChild>
          <TouchableOpacity
              style = {styles.button}>
              <ThemedText
                style = {styles.text}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'
                type = 'default'>
                log in here!
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
    marginBottom: 100,
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