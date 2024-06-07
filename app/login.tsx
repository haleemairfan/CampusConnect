import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';



export default function login() {

    const [identification, setIdentification] = useState('');
    const [password, setPassword] = useState('');

    async function handleSignUp() {
        //replace with your machine IP address
        await fetch('http://172.31.17.153:3000/api/v1/logIn', {
            method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },  
              body: JSON.stringify({
                    identification,
                    password
            }),
          });
       
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
                    Username/Email:
                </ThemedText>
    
                <TextInput
                    style={styles.input}
                    placeholder="Enter your username/email"
                    value={identification}
                    onChangeText={setIdentification}
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
                  Log in 
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
