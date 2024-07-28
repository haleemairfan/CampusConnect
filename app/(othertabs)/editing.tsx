import { View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Redirect, router, useLocalSearchParams} from 'expo-router'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useUser } from '@/components/UserContext';

const editing = () => {
  const items = useLocalSearchParams()
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(items.postTitle);
  const [body, setBody] = useState(items.postBody);
  const [tags, setTags] = useState(items.postTags);

  async function editPost() {
    if(!title || !body.trim() || !tags.trim()) {
      return Alert.alert('Please fill in all the fields.')
    }

    const trimmedBody = body.trim(); // Ignores any trailing whitespace and newlines from body text
    const trimmedTags = tags.trim();

    setIsLoading(true)
    try {
      //replace with your machine IP address
      const results = await fetch(`http://192.168.1.98:3000/api/v1/updatePost/${items.postUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          body: trimmedBody,
          tags: trimmedTags,
        }),
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      Alert.alert('Success', 'Post updated successfully!',
        [{ text: 'Continue', onPress: () => router.push('/home')}]);
        setTitle('');
        setBody('');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to update post.',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
        setTitle(items.postTitle);
        setBody(items.postBody);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <SafeAreaView className = 'bg-primary h-full'>
      <ScrollView className = "px-4 my-6">
        <Text className = "text-white font-bold ml-5" style={{ fontSize: 20 }}>
            Edit your post
          </Text>
          <FormField 
          title = "Post Title"
          value = {title}
          placeholder = "Begin with a banger title..."
          formWidth="100%"
          maxformWidth="400"
          handleChangeText={setTitle}
          otherStyles = "mt-7"
          otherTextStyles="font-bold"
          boxStyles= "w-full px-4 bg-black-100 rounded-2xl focus:border-red items-center flex-row"
          />

          <FormField 
          title = "Body Text"
          value = {body}
          placeholder = "Now give it some flavour text..."
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

          <View className={`space-y-2 mt-7`}>
            <Text className={`text-base text-gray-100 font-bold`}>Add Tags (min 1, max 5)</Text>

            <View 
                className={`w-full px-4 bg-black-100 rounded-2xl focus:border-red items-center flex-row flex-row`} 
                style={{ 
                    width: '100%',
                    maxWidth: 400,
                    height: 50, 
                }}
            >
                <TextInput
                    className="flex-1 text-white text-base"
                    style={{ 
                        textAlignVertical: 'center', 
                    }}
                    value={tags}
                    placeholder="Use commas to split between tags..."
                    placeholderTextColor="#7b7b8b"
                    onChangeText={setTags}
                    multiline = {true}
                />
              </View>
          </View>

          <TouchableOpacity
          style={styles.button}
          onPress={isLoading ? undefined: editPost}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size = "small" color = "#d8a838" />
          ) : (
            <ThemedText
            style={styles.buttonText}
            lightColor = "#2A2B2E"
            darkColor = "#F6F0ED"
            type="default">
            {isLoading ? "Publishing..." : "Edit your post!"}
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default editing

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