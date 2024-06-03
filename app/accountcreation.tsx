import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


export default function accountcreation() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

function handleSignUp() {
  const data = {
    Name: name,
    Email: email,
    Password: password
  };

  axios
    .post('http://127.0.0.1:5001/accountcreation', data)
    .then(res => console.log(res.data))
    .catch(e => console.log(e));

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
                value={name}
                onChangeText={setName}
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
