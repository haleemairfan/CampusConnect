import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@/components/UserContext';
import { Redirect, router } from 'expo-router';
import IPaddress from '@/IPaddress';


import EmptyStateHome from '@/components/EmptyStateHome';

const BlockedAccounts = () => {
  const { userId } = useUser();
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false); // Separate state for unblocking

  async function getBlockedAccounts() {
    setIsLoading(true);
    try {
      const results = await fetch(`http://${IPaddress}:3000/api/v1/getBlockedAccounts/${userId.user_uuid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      setBlockedAccounts(data);
    } catch (error) {
      console.error('Unable to get blocked accounts', error);
      Alert.alert('Error', 'Failed to get blocked accounts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getBlockedAccounts();
  }, [userId.user_uuid]);

  async function removeBlockedAccount(blockedUserId) {
    setIsUnblocking(true);
    try {
      const results = await fetch(`http://192.168.1.98:3000/api/v1/removeBlockedAccount/${blockedUserId}/${userId.user_uuid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message || 'Failed to unblock account');
      }

      Alert.alert('Success', 'Account unblocked successfully.',
        [{ text: 'Continue', onPress: () => router.push('/settings')}]);
    } catch (error) {
      console.error('Failed to unblock account', error);
      Alert.alert('Error', 'Failed to unblock account. Please try again later.');
    } finally {
      setIsUnblocking(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await getBlockedAccounts();
    setRefreshing(false);
  };

  const renderBlockedAccount = ({ item }) => {
    const blockedUserId = item.blocked_user_id;

    return (
      <View style={styles.blockedAccountContainer}>
        <ThemedText style={styles.blockedAccountText} lightColor="#2A2B2E" darkColor="#F6F0ED">
          {item.username}
        </ThemedText>

        <TouchableOpacity
          style={styles.button}
          onPress={() => removeBlockedAccount(blockedUserId)}
          disabled={isUnblocking}>
          {isUnblocking ? (
            <ActivityIndicator size="small" color="#d8a838" />
          ) : (
            <ThemedText style={styles.buttonText} lightColor="#2A2B2E" darkColor="#F6F0ED" type="default">
              Unblock
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#161622">
      <ThemedText style={styles.headerText} lightColor="#2A2B2E" darkColor="#F6F0ED"> Blocked Accounts </ThemedText>
      <FlatList
        data={blockedAccounts}
        keyExtractor={(item) => item.blocked_user_id}
        renderItem={renderBlockedAccount}
        ListEmptyComponent={() => (
          <EmptyStateHome title="Nothing to see..." subtitle="No blocked accounts" />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </ThemedView>
  );
};

export default BlockedAccounts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 25,
    paddingLeft: 15,
    paddingBottom: 20,
  },
  blockedAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  blockedAccountText: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FF7C80',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderColor: '#d8a838',
    borderWidth: 3,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
