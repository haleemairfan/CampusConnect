import React, { useState } from 'react';
import { TouchableOpacity, Image, Modal, View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { icons } from '../constants'; 
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import { useUser } from '@/components/UserContext';

const CommentDropdownMenu = ({ commentUserId, currentUserId, postUuid, commentUuid, commentBody }) => {
  const [showDropdown, setShowDropdown] = useState(false); 
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Function to handle pressing the main button
  const handlePress = () => {
    setShowDropdown(!showDropdown); 
  };

  // Function to handle editing a post
  const handleEditComment = () => {
    router.push({ pathname: '/commentediting', params: {commentBody, postUuid, commentUuid} });

    setShowDropdown(false); // Close dropdown after action
  };

  // Async Function to Delete a Comment
  async function deleteComment(commentUuid) {
    try {
        const results = await fetch(`http://192.168.1.98:3000/api/v1/deleteComment/${commentUuid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await results.json();

        if (!results.ok) {
            throw new Error(data.message || 'Failed to delete comment');
        } 
    } catch (error) {
        console.error('Failed to delete comment', error);
        Alert.alert('Error', 'Failed to delete comment. Please try again later.');
    }
}

  // Function to handle deleting a post
  const handleDeleteComment = async () => {
    Alert.alert(
        'Warning!',
        'This comment will be deleted permenantly. Are you sure you want to delete it?',
        [
            {
                text: `No, don't delete it`,
                onPress: () => {
                    setShowDropdown(false);
                },
                style: 'cancel',
            },
            {
                text: `Yes, I'm sure`,
                onPress: async () => {
                    await deleteComment(commentUuid);
                setShowDropdown(false);
                },
            },
        ],
        { cancelable: false }
    );
  };

  async function blockComment({currentUserId, postUuid, commentUuid}) {
    try {
      const results = await fetch(`http://192.168.1.98:3000/api/v1/blockComment/${currentUserId}/${postUuid}/${commentUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      Alert.alert('Success', 'Comment blocked',);
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to block comment.',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
      }
    };

  // Function to handle blocking a post
  const handleBlockComment = async () => {
    Alert.alert(
        'Block Comment',
        'Are you sure you want to block this comment?',
        [
            {
                text: `No, don't block it`,
                onPress: () => {
                    setShowDropdown(false);
                },
                style: 'cancel',
            },
            {
                text: `Yes, I'm sure`,
                onPress: async () => {
                    await blockComment({currentUserId, postUuid, commentUuid});
                    setShowDropdown(false);
                },
            },
        ],
        { cancelable: false }
    );
  };

  async function blockUser({currentUserId, commentUserId}) {
    try {
      const results = await fetch(`http://192.168.1.98:3000/api/v1/blockUser/${currentUserId}/${commentUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }

      Alert.alert('Success', 'User blocked',);
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to block user.',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
      }
    };

  // Function to handle blocking a user
  const handleBlockUser = async () => {
    Alert.alert(
        'Block User',
        'Are you sure you want to block this user?',
        [
            {
                text: `No, don't block them`,
                onPress: () => {
                    setShowDropdown(false);
                },
                style: 'cancel',
            },
            {
                text: `Yes, I'm sure`,
                onPress: async () => {
                    await blockUser({currentUserId, commentUserId});
                    setShowDropdown(false);
                },
            },
        ],
        { cancelable: false }
    );
  };

  const dropdownOptions = commentUserId === currentUserId
    ? [
        { label: 'Edit Comment', onPress: handleEditComment },
        { label: 'Delete Comment', onPress: handleDeleteComment },
      ]
    : [
        { label: 'Block Comment', onPress: handleBlockComment },
        { label: 'Block User', onPress: handleBlockUser },
      ];

  return (
    <>
      <TouchableOpacity 
        onPress={handlePress}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setButtonPosition({ x, y, width, height });
        }}
      >
        <Image
          source={icons.modify_post_icon} // Replace with your icon source
          style={{ width: 20, height: 20, marginBottom: 5 }} // Adjust dimensions as needed
          resizeMode="contain"
        />
      </TouchableOpacity>

      {showDropdown && (
        <Modal
          animationType="none"
          transparent={true}
          visible={showDropdown}
          onRequestClose={() => {
            setShowDropdown(false); // Close modal if backdrop is pressed
          }}
        >
          <TouchableOpacity style={styles.overlay} onPress={() => setShowDropdown(false)}>
            <ThemedView style={[styles.dropdown, { top: buttonPosition.y + buttonPosition.height + 150, left: buttonPosition.x - 100 }]}>
              <FlatList
                data={dropdownOptions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => {
                      item.onPress(); // Execute the onPress function of the selected option
                    }}
                  >
                    <ThemedText style={{ fontSize: 15, paddingVertical: 10 }}>{item.label}</ThemedText>
                  </TouchableOpacity>
                )}
              />
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    borderColor: '#7b7b8b',
    borderWidth: 2,
  },
});

export default CommentDropdownMenu;
