
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@/components/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyStateHome from '@/components/EmptyStateHome';

const Posts = ({ posts, refreshing, onRefresh }) => {

  const formatTimeDifference = (postDate, postTime) => {
    const postDateTime = new Date(`${postDate}T${postTime}Z`);

    // Calculate current date/time adjusted for local timezone offset
    // This is because new Date() returns the date in UTC time and NOT local time
    const now = new Date();
    const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localNow = new Date(now.getTime() - timezoneOffsetMs)

    const difference = localNow - postDateTime
    const secondsDifference = Math.floor(difference / 1000);

    if (secondsDifference < 60) {
        return `${secondsDifference} seconds ago`;
    } else if (secondsDifference < 3600) {
        const minutes = Math.floor(secondsDifference / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (secondsDifference < 86400) {
        const hours = Math.floor(secondsDifference / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(secondsDifference / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

  const renderPost = ({ item }) => (

    <ThemedView
    style={styles.postContainer}
    lightColor="#F6F0ED"
    darkColor="#161622">
      <ThemedText
        style={styles.postUsername}
        lightColor="#2A2B2E"
        darkColor="#F6F0ED">
        {item.users.username}{' '}
        <ThemedText
          style={styles.postTime}
          lightColor="#2A2B2E"
          darkColor="#F6F0ED">
          {formatTimeDifference(item.post_date, item.post_time)}
        </ThemedText>
      </ThemedText>

      <ThemedText
        style={styles.postTitle}
        lightColor="#2A2B2E"
        darkColor="#F6F0ED">
        {item.post_title}
      </ThemedText>

      <ThemedText
        style={styles.postBody}
        lightColor="#2A2B2E"
        darkColor="#F6F0ED">
        {item.post_body}
      </ThemedText>
    </ThemedView>
  )

  return (
    <ThemedView
    style={styles.container}
    lightColor="#F6F0ED"
    darkColor="#161622">
    <FlatList
      data={posts}
      keyExtractor={(item) => item.post_uuid}
      renderItem={renderPost}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent = {() => (
        <EmptyStateHome 
        title="Nothing to see..."
        subtitle="Create a post!"
        />
    )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  postContainer: {
      padding: 15,
      marginBottom: 16,
      marginLeft: 10,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#7b7b8b',
      width: 340,
      alignItems: 'flex-start',
  },

  postUsername: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8
  },

  postTime: {
      fontSize: 14,
      marginBottom: 8,
      color: '#7b7b8b',
  },

  postTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
  },

  postBody: {
      fontSize: 14,
  },

  container: {
    flex: 1,
    paddingTop: 20, 
  },
})
export default Posts;

