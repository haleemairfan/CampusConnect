import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import io from 'socket.io-client';
import { icons } from '../../constants';
import ImageButton from '../../components/ImageButton';
import { useAppContext } from '../context';
import SearchInput from '../../components/SearchInput';

const socket = io('http://172.31.17.153:3000');

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const { getGlobalUserId } = useAppContext();
  const userId = getGlobalUserId();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Listen for new conversation events
    socket.on('newConversation', (newConversation) => {
      // Check if the current user is a participant
      if (newConversation.participants.includes(userId)) {
        setConversations((prevConversations) => {
          const isDuplicate = prevConversations.some(conv => conv.id === newConversation.id);
          if (!isDuplicate) {
            return [...prevConversations, newConversation];
          }
          return prevConversations;
        });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('newConversation');
    };
  }, []);

  const fetchConversations = () => {
    fetch(`http://172.31.17.153:3000/api/v1/conversations?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Assuming you're using a token
      },
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then(data => setConversations(data.data))
    .catch(error => {
      console.error('Error fetching conversations:', error.message);
      Alert.alert('Error', error.message);
    });
  };

  const handleCreateConversation = () => {
    fetch('http://172.31.17.153:3000/api/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, username }), // Use username to create conversation
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
      }
      return response.json();
    })
    .then(data => {
      setConversations(prevConversations => {
        const isDuplicate = prevConversations.some(conv => conv.id === data.data.id);
        if (!isDuplicate) {
          return [...prevConversations, data.data];
        }
        return prevConversations;
      });
      setModalVisible(false);
      setUsername('');
    })
    .catch(error => {
      console.error('Error creating conversation:', error.message);
      Alert.alert('Error', error.message);
    });
  };

  const handleConversationPress = (conversationId) => {
    router.push(`/chat/${conversationId}`);
  };

  const getRecipientUsername = (participants) => {
    // Assuming the participants array includes the current user and the recipient
    return participants.find(participant => participant !== userId);
  };

  return (
    <SafeAreaView className='bg-primary h-full'>
      <View className='my-6 px-4 space-y-6'>
        <View className='flex-row items-center justify-between mb-6'>
          <ImageButton
            imageSource={icons.back_icon}
            handlePress={() => router.push('/home')}
            imageContainerStyles='w-[40px] h-[25px]'
          />
          <Text className='text-white font-bold' style={{ fontSize: 20 }}>
            Conversations
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ color: 'white', fontSize: 20 }}>+</Text>
          </TouchableOpacity>
        </View>
        <SearchInput placeholder='Search' />
      </View>
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleConversationPress(item.id)}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: 'grey' }}>
              <Text style={{ color: 'white' }}>{getRecipientUsername(item.participants)}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Start New Conversation</Text>
            <TextInput
              placeholder='Enter username'
              value={username}
              onChangeText={setUsername}
              style={{ borderBottomWidth: 1, marginBottom: 20 }}
            />
            <Button title='Create' onPress={handleCreateConversation} />
            <Button title='Cancel' onPress={() => setModalVisible(false)} color='red' />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Conversations;
