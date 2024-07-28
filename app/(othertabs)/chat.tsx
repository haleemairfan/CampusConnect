import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { icons } from '../../constants';
import ImageButton from '../../components/ImageButton';
import socket from '../chatClient';

type Message = {
  messageID: string;
  id: string;
  sender: string;
  message: string;
};

const ChatScreen = () => {
  const { sender, recipient, id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const router = useRouter();

  useEffect(() => {
    socket.emit('join', { id });

    socket.on('newMessage', (data) => {
      if (data.id === id) {
        setMessages((prevMessages) => [...prevMessages, data.data]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [id]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch('http://192.168.50.176:3000/api/v1/getMessages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setMessages(data.data);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        Alert.alert('Error', 'Failed to load messages');
      }
    }

    fetchMessages();
  }, [id]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const response = await fetch('http://192.168.50.176:3000/api/v1/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, sender, message: newMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      socket.emit('sendMessage', { messageID: data.data.messageID, id: data.data.id, sender: data.data.sender, message: data.data.message });
      setNewMessage('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderMessageItem = ({ item }) => (
    <View className={`p-2 my-1 ${item.sender === sender ? 'bg-secondary self-end' : 'bg-primary self-start'} rounded-lg max-w-[75%]`}>
      <Text className="text-white">{item.message}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-row items-center justify-between p-4 bg-primary border-b border-gray-300">
          <ImageButton
            imageSource={icons.back_icon}
            handlePress={() => router.back()}
            imageContainerStyles="w-[20px] h-[20px]"
          />
          <View className="bg-secondary rounded-full px-4 py-2">
            <Text className="text-white font-bold text-lg">{recipient}</Text>
          </View>
          <View style={{ width: 40, height: 20 }} />
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.messageID}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 80 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View className="w-full p-4 bg-primary border-t border-gray-300">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-secondary text-white rounded-lg px-4 py-2"
              placeholder="Type a message..."
              placeholderTextColor="#7b7b8b"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity onPress={sendMessage} className="ml-2 bg-secondary px-4 py-2 rounded-lg">
              <Text className="text-white font-bold">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
