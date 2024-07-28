import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Modal from 'react-native-modal';
import socket from '../(chat)/chatClient';
import { useUser } from '@/components/UserContext';

import ImageButton from '../../components/ImageButton';
import EmptyStateMessages from '@/components/EmptyStateMessages';
import SearchInput from '@/components/SearchInput';
import { icons } from '../../constants';

type Conversation = {
  id: string;
  sender: string;
  recipient: string;
};

const Messages = () => {
  const { userId } = useUser();
  const [isModalVisible, setModalVisible] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    setSender(userId.username);
  }, [userId]);

  useEffect(() => {
    async function fetchAllConversations() {
      if (!sender) return;

      try {
        const response = await fetch('http://172.31.17.153:3000/api/v1/fetchAllConversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sender }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setConversations(data.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        Alert.alert('Error', 'Failed to load conversations');
      }
    }

    fetchAllConversations();
  }, [sender]);

  const handleCreateNewChat = () => {
    setModalVisible(true);
  };

  const validateUsername = async () => {
    try {
      const response = await fetch('http://192.168.50.176:3000/api/v1/validateUsername', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient }),
      });

      const data = await response.json();

      if (data.data.isValid) {
        setIsValidUsername(true);
      } else {
        setIsValidUsername(false);
        Alert.alert('Error', 'Invalid username. Please try again.');
      }
    } catch (error) {
      console.error('Username validation error:', error);
      Alert.alert('Error', 'Failed to validate username. Please try again.');
    }
  };

  const createChat = async () => {
    try {
      const response = await fetch('http://192.168.50.176:3000/api/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender, recipient }),
      });

      const data = await response.json();

      Alert.alert('Chat Created', `Chat with ${recipient} has been created.`);
      setModalVisible(false);
      setRecipient('');
      setIsValidUsername(false);
    } catch (error) {
      console.error('Chat creation error:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    }
  };

  useEffect(() => {
    socket.on('newConversation', (conversation) => {
      setConversations((prevConversations) => [...prevConversations, conversation]);
    });

    return () => {
      socket.off('newConversation');
    };
  }, []);

  const renderConversationItem = ({ item }) => {
    const conversationTitle = item.recipient === sender ? item.sender : item.recipient;
    return (
      <TouchableOpacity onPress={() => router.push({ pathname: './chat', params: { sender, recipient: conversationTitle, id: item.id } })}>
        <View className="p-4 border border-secondary bg-primary rounded-lg m-2 shadow-md">
          <Text className="text-lg font-bold text-white">{conversationTitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="my-6 px-4 space-y-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <ImageButton
              imageSource={icons.back_icon}
              handlePress={() => router.push('/home')}
              imageContainerStyles="w-[40px] h-[25px]"
            />
            <Text className="text-white font-bold ml-5" style={{ fontSize: 20 }}>
              Messages
            </Text>
          </View>
          <TouchableOpacity onPress={handleCreateNewChat}>
            <Text className="text-white" style={{ fontSize: 30 }}>+</Text>
          </TouchableOpacity>
        </View>
        <SearchInput placeholder="Search" />
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <EmptyStateMessages title="No messages" />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View className="bg-white p-6 rounded-md">
          <Text className="text-xl font-bold mb-4">Create New Chat</Text>
          <TextInput
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            placeholder="Enter username"
            placeholderTextColor="#7b7b8b"
            value={recipient}
            onChangeText={setRecipient}
            onBlur={validateUsername}
          />
          {isValidUsername && (
            <TouchableOpacity className="bg-secondary px-4 py-2 rounded-md" onPress={createChat}>
              <Text className="text-white text-lg font-bold">Create Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Messages;
