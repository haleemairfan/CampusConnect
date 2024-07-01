import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AccountCreation() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [date_of_birth, setDateOfBirth] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [password, setPassword] = useState('');


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
    try {
      //replace with your machine IP address
      const results = await fetch('http://192.168.1.98:3000/api/v1/createAccount', {
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
      const id = data.data.user_uuid;

      Alert.alert('Success', 'Account created successfully',
        [{ text: 'Continue', onPress: () => router.push({ pathname: '/university', params: { id } }) }]);
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to create account',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
      setUsername('');
      setEmail('');
      setDateOfBirth('');
      setPassword('');
    }
  }

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
        darkColor="#2A2B2E">
        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Username:
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={username}
          onChangeText={setUsername}
        />
        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
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
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Date Of Birth:
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
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={date_of_birth}
              onChangeText={setDateOfBirth}
              editable={false}
            />
        </Pressable>
        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
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
          style={styles.button}
          onPress={handleSignUp}>
          <ThemedText
            style={styles.text}
            lightColor="#2A2B2E"
            darkColor="#F6F0ED"
            type="default">
            Create an account
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