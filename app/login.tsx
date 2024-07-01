import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { useAppContext } from './context'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';



export default function login() {
    const { setGlobalUserId } = useAppContext();
    const [identification, setIdentification] = useState('');
    const [password, setPassword] = useState('');

    async function handleSignUp() {
        try {
            //replace with your machine IP address
            const results = await fetch('http://172.31.17.153:3000/api/v1/logIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },  
                body: JSON.stringify({
                        identification,
                        password
                }),
            })
            const data = await results.json();


            if (!results.ok) {
                throw new Error(data.message);
            } else {
                const id = data.data.user;
                setGlobalUserId(id);    
                router.push({ pathname: "./(tabs)/profilepage"});
            }

            
        } catch (error) {
            console.error('Sign up error:', error);
            Alert.alert('Error', 'Failed to sign in. Please try again later.');
      
        }
    }
   
  
    return (
        <TouchableWithoutFeedback
            onPress = {
                () => { Keyboard.dismiss(); }
            } >
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
        </TouchableWithoutFeedback>
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