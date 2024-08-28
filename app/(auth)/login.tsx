import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/components/UserContext';

import IPaddress from '@/IPaddress'
import socket from '../(chat)/chatClient';

export default function login() {

    const [identification, setIdentification] = useState('');
    const [password, setPassword] = useState('');

    const [focusedBox, setFocusedBox] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { setUserId } = useUser();

    async function handleSignUp() {
        setIsLoading(true)
        try {
            //replace with your machine IP address
            
            const results = await fetch(`http://${IPaddress}:3000/api/v1/logIn`, {
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
                const id = data.data;
                setUserId(id);

                socket.auth = { username: id.username };
                
                socket.connect();

                socket.on('connect', () => {
                    console.log('Connected to the server as:', id.username);
                });

                socket.on('connect_error', (err) => {
                    console.log('Connection error:', err);
                });

                socket.on('error', (error) => {
                    console.error('Socket error:', error);
                });

                router.push( "/home" );
                setIdentification('');
                setPassword('');
            }

            
        } catch (error) {
            console.error('Sign up error:', error);
            Alert.alert('Error', 'Incorrect username or password. Please try again.');
            setIdentification('');
            setPassword('');
      
        } finally {
            setIsLoading(false)
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
                darkColor= "#161622">
                    <ThemedText 
                        style = {styles.text}
                        lightColor = '#2A2B2E'
                        darkColor= '#F6F0ED'>
                        Username / Email
                    </ThemedText>
        
                    <TextInput
                        style={[styles.input, focusedBox === 'username' && styles.inputFocused]}
                        placeholder="Enter your username or email..."
                        placeholderTextColor="#7b7b8b"
                        value={identification}
                        onChangeText={setIdentification}
                        onFocus = {() => setFocusedBox('username')}
                        onBlur={() => setFocusedBox(null)}
                    />
                    <ThemedText 
                        style={styles.text}
                        lightColor = '#2A2B2E'
                        darkColor= '#F6F0ED'>
                        Password
                    </ThemedText>
                    <TextInput
                        style={[styles.input, focusedBox === 'password' && styles.inputFocused]}
                        placeholder="Enter your password..."
                        placeholderTextColor="#7b7b8b"
                        value={password}
                        secureTextEntry
                        onChangeText={setPassword}
                        onFocus = {() => setFocusedBox('password')}
                        onBlur={() => setFocusedBox(null)}
                    />
                    
                <TouchableOpacity
                    style={styles.button}
                    onPress={isLoading ? undefined: handleSignUp}
                    disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size = "small" color = "#d8a838" />
                    ) : (
                        <ThemedText
                        style = {styles.text}
                        lightColor = '#2A2B2E'
                        darkColor= '#F6F0ED'
                        type = 'default'>
                        {isLoading ? "Logging in..." : "Let's go!"}
                    </ThemedText>
                    )}
                </TouchableOpacity>

                <ThemedView
                style = {styles.signUpContainer}
                lightColor = "#F6F0ED"
                darkColor= '#161622'>
                <ThemedText
                    style = {styles.bottomtext}
                    lightColor = '#2A2B2E'
                    darkColor= '#F6F0ED'
                    type = 'default'>
                    Don't have an account with us? {'\n'}
                    Make one {''}
                    <Link href = "/accountcreation">
                        <ThemedText
                        style = {styles.bottomtextlink}
                        lightColor = '#2A2B2E'
                        darkColor= '#F6F0ED'
                        type = 'default'>
                        here!
                        </ThemedText>
                    </Link>
                </ThemedText>
                </ThemedView> 

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
      fontWeight: 'bold',
      fontSize: 18,
    },

    bottomtext: {
        textAlign: 'center',
        fontSize: 15,
        marginTop: 20,
    },

    bottomtextlink: {
        textAlign: 'center',
        fontSize: 15,
        marginTop: 20,
        fontWeight: "bold",
        color: "#77DD77"
    },
  
    input: {
      paddingHorizontal: 16,
      borderRadius: 16,
      paddingTop: 12,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      height: 50,
      width: 250,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 20,
      marginTop: 5,
      color: '#7b7b8b'
    },
    inputFocused: {
      borderColor: 'red'
    },
  
    button: {
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 16, 
      backgroundColor: 'transparent',
      borderColor: '#d8a838',
      borderWidth: 3,
      width: 220,
      marginTop: 20
    },

    signUpContainer: {
        alignItems:'center',
        flexDirection: 'row'
      },

    signUpButton: {
        backgroundColor: 'transparent',
    }
  });