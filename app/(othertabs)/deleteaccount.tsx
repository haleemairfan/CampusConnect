import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/components/UserContext';


export default function deletYourAccount() {
    const [focusedBox, setFocusedBox] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { userId } = useUser();
    const userUuid = userId.user_uuid

    async function deleteAccount(userUuid) {
        try {
            const results = await fetch(`http://192.168.1.98:3000/api/v1/deleteAccount/${userUuid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
    
            const data = await results.json();
    
            if (!results.ok) {
                throw new Error(data.message || 'Failed to delete post');
            } 
        } catch (error) {
            console.error('Failed to delete user information', error);
            Alert.alert('Error', 'Failed to delete user information. Please try again later.');
        }
    }
    
      // Function to handle deleting a post
      const handleDeleteAccount = async () => {
        Alert.alert(
            'Warning!',
            'Are you sure you want to permanently delete your account?',
            [
                {
                    text: `I've changed my mind`,
                    onPress: () => {
                        Alert.alert('Phew!', 'Your account was not deleted');
                        router.push({ pathname: '/home' });
                    },
                    style: 'cancel',
                },
                {
                    text: `Yes, I'm sure`,
                    onPress: () => {
                        Alert.alert(
                            'Last chance!',
                            'Are you for SURE you want to delete your account?',
                            [
                                {
                                    text: `I've changed my mind`,
                                    onPress: () => {
                                        Alert.alert('Phew!', 'Your account was not deleted');
                                        router.push({ pathname: '/home' });
                                    },
                                    style: 'cancel',
                                },
                                {
                                    text: `Yes, I'm sure`,
                                    onPress: async () => {
                                        // Call your deleteAccount function here
                                        await deleteAccount(userUuid);
                                        Alert.alert('Goodbye!', 'We are sorry to see you go!');
                                        router.push({ pathname: '/accountcreation' });
                                    },
                                },
                            ],
                            { cancelable: false }
                        );
                    },
                },
            ],
            { cancelable: false }
        );
    };
    
    
   
  
    return (
        <ThemedView 
            style={styles.container}
            lightColor="#F6F0ED"
            darkColor="#161622">
            <ThemedText 
                style={styles.warningText}
                lightColor='#2A2B2E'
                darkColor='#F6F0ED'>
                Warning!
            </ThemedText>

            <ThemedView 
            style={styles.textContainer}
            lightColor="#F6F0ED"
            darkColor="#161622">
                <ThemedText 
                    style={styles.text}
                    lightColor='#2A2B2E'
                    darkColor='#F6F0ED'>
                    This action is {''}
                    <Text style={styles.irreversibleText}>
                        IRREVERSIBLE!
                    </Text>
                    {'\n'}
                    {'\n'}
                    Deleting your account means deleting everything: posts, comments, and messages!
                    {'\n'}
                    {'\n'}
                    Are you sure you want to delete your account?
                </ThemedText>
            </ThemedView>

                
            <TouchableOpacity
                style={styles.button}
                onPress={isLoading ? undefined: handleDeleteAccount}
                disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size = "small" color = "#d8a838" />
                ) : (
                    <ThemedText
                    style = {styles.buttonText}
                    lightColor = '#2A2B2E'
                    darkColor= '#F6F0ED'
                    type = 'default'>
                    {isLoading ? "Deleting" : "Yes, delete my account"}
                </ThemedText>
                )}
            </TouchableOpacity>

        </ThemedView>
      );
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, 
    },

    textContainer: {
        width: '80%', 
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },

    text: {
        textAlign: 'center',
        fontSize: 18,
    },

    button: {
        paddingVertical: 10, 
        borderRadius: 16, 
        backgroundColor: 'transparent',
        borderColor: '#d8a838',
        borderWidth: 3,
        width: 220,
        marginTop: 20,
        justifyContent: 'center', 
        alignItems: 'center', 
    },

    buttonText: {
        fontWeight: 'bold',
        fontSize: 18,
    },

    signUpContainer: {
        alignItems:'center',
        flexDirection: 'row'
    },

    signUpButton: {
        backgroundColor: 'transparent',
    },

    warningText: {
        fontWeight: 'bold',
        fontSize: 30,
        color: '#F2BE5C',
        paddingBottom: 20,
        textAlign: 'center', 
    },

    irreversibleText: {
        color: '#FF0013',
        fontWeight: 'bold',
        fontSize: 18,
    }
});