import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, Pressable, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import socket from '../chatClient';
import { useAppContext } from '../context';

export default function AccountCreation() {
  const { setGlobalUserId }= useAppContext();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [date_of_birth, setDateOfBirth] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [password, setPassword] = useState('');

  const [focusedBox, setFocusedBox] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      const currentDate = selectedDate;
      setShowPicker(false);
      setDate(currentDate);
      setDateOfBirth(currentDate.toISOString().split('T')[0]); 
    } else {
      setShowPicker(false);
    }
  };

  async function handleSignUp() {
    setIsLoading(true);
    try {
      //replace with your machine IP address
      const results = await fetch('http://172.31.16.94:3000/api/v1/createAccount', {
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

      socket.auth = {
        username: username
      }

 
      socket.connect();

      socket.on('connect', () => {
        console.log('Connected to the server');
      });
    
    
      const id = data.data.user_uuid;
      setGlobalUserId(id);

      setTimeout(() => {
        Alert.alert('Success', 'Account created successfully',
        [{ text: 'Continue', onPress: () => router.push({ pathname: '../(tabs)/profile', params: { id } }) }]);
      }, 100);
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to create account',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
      setUsername('');
      setEmail('');
      setDateOfBirth('');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress = { 
        () => {
          setShowPicker(false);
          Keyboard.dismiss();
        }
      }>
      <ThemedView
        style={styles.container}
        lightColor="#F6F0ED"
        darkColor="#161622">
        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Username
        </ThemedText>

        <TextInput
          style={[styles.input, focusedBox === 'username' && styles.inputFocused]}
          placeholder="Enter a cool username..."
          placeholderTextColor="#7b7b8b"
          value={username}
          onChangeText={setUsername}
          onFocus = {() => setFocusedBox('username')}
          onBlur={() => setFocusedBox(null)}
        />

        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Email
        </ThemedText>

        <TextInput
          style={[styles.input, focusedBox === 'email' && styles.inputFocused]}
          placeholder="Enter your email..."
          placeholderTextColor="#7b7b8b"
          value={email}
          onChangeText={setEmail}
          onFocus = {() => setFocusedBox('email')}
          onBlur={() => setFocusedBox(null)}
        />

        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Date Of Birth
        </ThemedText>

        {showPicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={date}
            onChange={onChange}
          />
        )}

        <Pressable onPress = {toggleDatePicker}>
            <TextInput
              style={[styles.input, focusedBox === 'date_of_birth' && styles.inputFocused]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#7b7b8b"
              value={date_of_birth}
              onChangeText={setDateOfBirth}
              editable={false}
              onFocus = {() => setFocusedBox(date_of_birth)}
              onBlur={() => setFocusedBox(null)}
            />
        </Pressable>

        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Password
        </ThemedText>

        <TextInput
          style={[styles.input, focusedBox === 'password' && styles.inputFocused]}
          placeholder="Enter a strong password..."
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
            style={styles.text}
            lightColor = "#2A2B2E"
            darkColor = "#F6F0ED"
            type="default">
            {isLoading ? "Creating..." : "Create your account!"}
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