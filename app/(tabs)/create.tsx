
import { View, Text, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Redirect, router } from 'expo-router'

const create = () => {
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',  
  });

  const submit = () => {
    if(!form.title || !form.body) {
      return Alert.alert('Please fill in all the fields.')
    }

    setUploading(true)

    try {
      //call to supabase to add post

      Alert.alert('Success', 'Post uploaded successfully!')
      router.push('/home')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setForm({
        title: '',
        body: '',  
      })

      setUploading(false);
    }
  }

  return (
    <SafeAreaView className = 'bg-primary h-full'>
      <ScrollView className = "px-4 my-6">
        <Text className = "text-white font-bold ml-5" style={{ fontSize: 20 }}>
            Create a post
          </Text>
          <FormField 
          title = "Post Title"
          value = {form.title}
          placeholder = "Begin with a banger title..."
          formWidth="100%"
          maxformWidth="400"
          handleChangeText={(e) => setForm({ ...form, 
            title: e
          })}
          otherStyles = "mt-7"
          otherTextStyles="font-bold"
          boxStyles= "w-full px-4 bg-black-100 rounded-2xl focus:border-red items-center flex-row"
          />

          <FormField 
          title = "Body Text"
          value = {form.body}
          placeholder = "Now give it some flavour text..."
          formWidth="100%"
          maxformWidth="400"
          height={500}
          handleChangeText={(e) => setForm({ ...form, 
            body: e
          })}
          otherStyles = "mt-7"
          otherTextStyles="font-bold"
          boxStyles= "px-4 bg-black-100 rounded-2xl pt-3 pb-3 focus:border-red items-start flex-row"
          alignVertical="top"
          multiline={true}
          />

          <CustomButton 
            title="Publish your post!"
            handlePress={submit}
            containerStyles="w-full justify-center mt-5 mb-3"
            textStyles="text-lg text-center font-bold"
            buttonColor = "#d8a838"
            buttonWidth = "100%"
            maxButtonWidth = "400" 
            isLoading={uploading}
          />
      </ScrollView>
    </SafeAreaView>
  )
}

export default create