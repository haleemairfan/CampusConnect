import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '../context';

export default function CampusAccommodation() {
    const { getGlobalUserId } = useAppContext();
    const id = getGlobalUserId();

    const [accommodation, setAccommodation] = useState('');

    async function insertAccommodation() {
        if (accommodation == '') {
            return;
        }

        try {

            const results = await fetch("http://172.31.17.153:3000/api/v1/insertAccommodation", {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accommodation,
                    id,
                }),
            });
            
            const data = await results.json();

            if (!results.ok) {
                throw new Error(data.message);
            }
            router.push({ pathname: '../(tabs)/profilepage' })
        } catch (error) {
            console.error('Invalid Accommodation inputted:', error);
            Alert.alert('Error', 'Invalid Accommodation inputted',
                [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);

        }
    }

        


    return (
        <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#2A2B2E">
        <ThemedText style={styles.welcomeText} lightColor="#2A2B2E" darkColor="#F6F0ED">
            What type of campus accommodation do you stay in?
        </ThemedText>
        <ThemedView style={styles.inputContainer} lightColor="#fff" darkColor="#333">
            <TextInput
            style={styles.input}
            placeholder="Enter your accommodation type"
            value={accommodation}
            onChangeText={setAccommodation}
            />
        </ThemedView>
        <TouchableOpacity style={styles.continueButton} onPress={insertAccommodation}>
            <ThemedText style={styles.continueButtonText} lightColor="#F6F0ED" darkColor="#2A2B2E">
            Continue
            </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={insertAccommodation}>
            <ThemedText style={styles.skipButtonText} lightColor="#F6F0ED" darkColor="#2A2B2E">
            Skip
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
        padding: 20,
    },
    welcomeText: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        height: 40,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 8,
    },
    continueButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    skipButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    skipButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    });
