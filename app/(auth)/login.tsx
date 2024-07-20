import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import socket from '../chatClient';
import { useAppContext } from '../context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Login() {
    const { setGlobalUserId, getGlobalUserId } = useAppContext();
    const [identification, setIdentification] = useState('');
    const [password, setPassword] = useState('');
    const [focusedBox, setFocusedBox] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignUp() {
        setIsLoading(true)
        try {
            //replace with your machine IP address
            const results = await fetch('http://192.168.50.176:3000/api/v1/logIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },  
                body: JSON.stringify({
                        identification,
                        password
                }),
            });
            const data = await results.json();

            if (!results.ok) {
                throw new Error(data.message);
            } else {
                socket.auth = {
                    username: data.data.username
                }
                socket.connect();
                socket.on('connect', () => {
                    console.log('Connected to the server');
                });

                const id = data.data.userID;
                setGlobalUserId(id);
                console.log("UserID set in context:", getGlobalUserId());
                setTimeout(() => {
                    router.push({ pathname: "../(tabs)/profile", params: { id }});
                }, 100);
            }
        } catch (error) {
            console.error('Sign up error:', error);
            Alert.alert('Error', 'Failed to sign in. Please try again later.');
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
            <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#161622">
                <ThemedText style={styles.text} lightColor='#2A2B2E' darkColor='#F6F0ED'>
                    Username / Email
                </ThemedText>
                <TextInput
                    style={[styles.input, focusedBox === 'username' && styles.inputFocused]}
                    placeholder="Enter your username or email..."
                    placeholderTextColor="#7b7b8b"
                    value={identification}
                    onChangeText={setIdentification}
                    onFocus={() => setFocusedBox('username')}
                    onBlur={() => setFocusedBox(null)}
                />
                <ThemedText style={styles.text} lightColor='#2A2B2E' darkColor='#F6F0ED'>
                    Password
                </ThemedText>
                <TextInput
                    style={[styles.input, focusedBox === 'password' && styles.inputFocused]}
                    placeholder="Enter your password..."
                    placeholderTextColor="#7b7b8b"
                    value={password}
                    secureTextEntry
                    onChangeText={setPassword}
                    onFocus={() => setFocusedBox('password')}
                    onBlur={() => setFocusedBox(null)}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={isLoading ? undefined : handleSignUp}
                    disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#d8a838" />
                    ) : (
                        <ThemedText style={styles.text} lightColor='#2A2B2E' darkColor='#F6F0ED' type='default'>
                            Let's go!
                        </ThemedText>
                    )}
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
        fontWeight: 'bold',
        fontSize: 18,
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
    }
});
