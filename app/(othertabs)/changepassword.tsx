import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, Pressable, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/components/UserContext';


export default function changePassword() {
  const { userId } = useUser();
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const [focusedBox, setFocusedBox] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function updatePassword() {
    setIsLoading(true);
    try {
      //replace with your machine IP address
      const results = await fetch(`http://192.168.1.98:3000/api/v1/updatePassword/${userId.user_uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        }),
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      Alert.alert('Success', 'Password updated successfully!',
        [{ text: 'Continue', onPress: () => router.push({
            pathname: '/settings',
            })
        }]);
        setOldPassword('');
        setNewPassword('');
    } catch (error) {
      Alert.alert('Error', 'Incorrect password entered.')
      } finally {
        setIsLoading(false);
      }
    };

  return (
      <ThemedView
        style={styles.container}
        lightColor="#F6F0ED"
        darkColor="#161622">
        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Old Password
        </ThemedText>

        <TextInput
          style={[styles.input, focusedBox === 'oldpassword' && styles.inputFocused]}
          placeholder="Enter your old password..."
          placeholderTextColor="#7b7b8b"
          value={oldPassword}
          secureTextEntry
          onChangeText={setOldPassword}
          onFocus = {() => setFocusedBox('oldpassword')}
          onBlur={() => setFocusedBox(null)}
        />

        <ThemedText
          style={styles.text}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          New Password
        </ThemedText>

        <TextInput
          style={[styles.input, focusedBox === 'newpassword' && styles.inputFocused]}
          placeholder="Enter a new strong password..."
          placeholderTextColor="#7b7b8b"
          value={newPassword}
          secureTextEntry
          onChangeText={setNewPassword}
          onFocus = {() => setFocusedBox('newpassword')}
          onBlur={() => setFocusedBox(null)}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={isLoading ? undefined: updatePassword}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size = "small" color = "#d8a838" />
          ) : (
            <ThemedText
            style={styles.text}
            lightColor = "#2A2B2E"
            darkColor = "#F6F0ED"
            type="default">
            {isLoading ? "Updating..." : "Update your password!"}
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