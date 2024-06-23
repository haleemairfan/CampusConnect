import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


export default function accountcreation() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [date_of_birth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignUp() {
    try {
      //replace with your machine IP address
      const results = await fetch('http://172.31.17.153:3000/api/v1/createAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify({
              username,
              email,
              date_of_birth,
              password,
        }),
      });
      const data = await results.json();

      if (!results.ok) {
          throw new Error(data.message);
      }

      Alert.alert('Success', 'Account created successfully', 
                 [{text: 'Continue', onPress: () => console.log('pressed')}]);

    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again later.');
    }
  }
  
  
  return (
    <ThemedView 
        style={styles.container}
        lightColor = "#F6F0ED"
        darkColor= '#2A2B2E'>
            <ThemedText 
                style = {styles.text}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'>
                Name:
            </ThemedText>

            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={username}
                onChangeText={setUsername}
            />
            <ThemedText 
                style={styles.text}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'>
                Email:
            </ThemedText>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
            />
            <ThemedText 
                style={styles.text}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'>
                Date Of Birth:
            </ThemedText>
            <TextInput
                style={styles.input}
                placeholder="Enter your date of birth"
                value={date_of_birth}
                onChangeText={setDateOfBirth}
            />
            <ThemedText 
                style={styles.text}
                lightColor = '#2A2B2E'
                darkColor= '#F6F0ED'>
                Password:
            </ThemedText>
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
            />
            
        <TouchableOpacity
          style = {styles.button}
          onPress = {handleSignUp}>
            <ThemedText
              style = {styles.text}
              lightColor = '#2A2B2E'
              darkColor= '#F6F0ED'
              type = 'default'>
              Create an account 
            </ThemedText>
        </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    
    text: {
        textAlign: 'center',
    },


    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
    },

    button: {
        backgroundColor: 'transparent'
    }
});
