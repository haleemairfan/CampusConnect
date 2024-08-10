import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Redirect, router } from 'expo-router'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { icons } from '../../constants'
import CustomButton from '@/components/CustomButton';

const settings = () => {
  return (
    <ThemedView
      style={styles.container}
      lightColor="#F6F0ED"
      darkColor="#161622">
      <View className="my-6 px-4 space-y-6">
        <ThemedText
          style={styles.welcomeBanner}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          Settings
        </ThemedText>
      </View>

      <ThemedView
      style={styles.buttonsContainer}
      lightColor="#F6F0ED"
      darkColor="#161622">
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/changeaccountdetails')}>
          <ThemedText
            style={styles.buttonText}
            lightColor='#2A2B2E'
            darkColor='#F6F0ED'
            type='default'>
            Change Account Details
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/updateuniversity')}>
          <ThemedText
            style={styles.buttonText}
            lightColor='#2A2B2E'
            darkColor='#F6F0ED'
            type='default'>
            Change Configuration and Interests
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/changepassword')}>
          <ThemedText
            style={styles.buttonText}
            lightColor='#2A2B2E'
            darkColor='#F6F0ED'
            type='default'>
            Change Password
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/blockedaccounts')}>
          <ThemedText
            style={styles.buttonText}
            lightColor='#2A2B2E'
            darkColor='#F6F0ED'
            type='default'>
            Blocked Accounts
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/deleteaccount')}>
          <ThemedText
            style={styles.buttonText}
            lightColor='#2A2B2E'
            darkColor='#F6F0ED'
            type='default'>
            Delete Account
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

export default settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
  },

  welcomeBanner: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  buttonsContainer: {
    flex: 1,
    alignItems: 'center', 
  },

  button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderColor: '#d8a838',
    borderWidth: 3,
    width: '90%', 
    marginTop: 20,
    alignItems: 'center', 
  },

  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
})