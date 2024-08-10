
import { View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Redirect, router, useLocalSearchParams} from 'expo-router'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useUser } from '@/components/UserContext';
import IPaddress from '@/IPaddress'

const CommentEditing = () => {
  const items = useLocalSearchParams()
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [body, setBody] = useState(items.commentBody);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');

  async function getSinglePost() {
    setIsLoading(true)
    try {
        const results = await fetch(`http://${IPaddress}:3000/api/v1/singlePost/${items.postUuid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },  
        })
        const data = await results.json();

        if (!results.ok) {
            throw new Error(data.message);
        } 

        setPostTitle(data.data.post_title)
        setPostBody(data.data.post_body)

    } catch (error) {
        console.error('Unable to get posts', error);
        Alert.alert('Error', 'Failed to get posts. Please try again later.');
  
    } finally {
        setIsLoading(false)
    }
}

    useEffect(() => {
    getSinglePost();
    }, [userId.user_uuid]);


  async function editComment() {
    if(!body.trim()) {
      return Alert.alert('Please fill in all the fields.')
    }

    const trimmedBody = body.trim(); // Ignores any trailing whitespace and newlines from body text

    setIsLoading(true)
    try {
      //replace with your machine IP address
      const results = await fetch(`http://${IPaddress}:3000/api/v1/updateComment/${items.postUuid}/${items.commentUuid}/${userId.user_uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: trimmedBody,
        }),
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      Alert.alert('Success', 'Comment updated successfully!',
        [{ text: 'Continue', onPress: () => router.push({
            pathname: '/comments',
            params: {
                postTitle: postTitle,
                postBody: postBody,
                postUuid: items.postUuid
            }})
        }]);
        setBody('');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to update post.',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
        setBody(items.commentBody);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <SafeAreaView className = 'bg-primary h-full'>
      <ScrollView className = "px-4 my-6">
        <Text className = "text-white font-bold ml-5" style={{ fontSize: 20 }}>
            Edit your comment
          </Text>

          <FormField 
          title = "Comment Body"
          value = {body}
          placeholder = "Comment something..."
          formWidth="100%"
          maxformWidth="400"
          height={500}
          handleChangeText= {setBody}
          otherStyles = "mt-7"
          otherTextStyles="font-bold"
          boxStyles= "px-4 bg-black-100 rounded-2xl pt-3 pb-3 focus:border-red items-start flex-row"
          alignVertical="top"
          multiline={true}
          />

          <TouchableOpacity
          style={styles.button}
          onPress={isLoading ? undefined: editComment}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size = "small" color = "#d8a838" />
          ) : (
            <ThemedText
            style={styles.buttonText}
            lightColor = "#2A2B2E"
            darkColor = "#F6F0ED"
            type="default">
            {isLoading ? "Editing..." : "Edit your comment!"}
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CommentEditing

const styles = StyleSheet.create({
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    alignItems: "center",
  },

  button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 16, 
    backgroundColor: 'transparent',
    borderColor: '#d8a838',
    borderWidth: 3,
    width: 325,
    marginTop: 20,
    alignItems: "center",
  }
});