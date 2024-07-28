import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useUser } from '@/components/UserContext';

const interests = [
  'Traveling', 'Reading', 'Music', 'Sports', 'Cooking', 
  'Fitness', 'Movies', 'Photography', 'Dancing', 'Writing', 
  'Gaming', 'Art', 'Tech', 'Fashion', 'Nature', 
  'Animals', 'Volunteering', 'Blogging', 'Meditation', 'Crafts'
];

export default function SelectInterests() {
  const { userId } = useUser();
  const id = userId.user_uuid;
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 5 interests.');
    }
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      Alert.alert('No Interests Selected', 'Please select at least one interest.');
    } else {
      insertInterests();
    }
  };

  const renderInterest = ({ item }: { item: string }) => (
    <ThemedView
      style={[styles.bubble, selectedInterests.includes(item) ? styles.selectedBubble : null]}
      lightColor="#fff" darkColor="#333"
    >
      <TouchableOpacity onPress={() => toggleInterest(item)}>
        <ThemedText style={styles.bubbleText} lightColor="#2A2B2E" darkColor="#F6F0ED">
          {item}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  async function insertInterests() {
    setIsLoading(true);
    try {
      const results = await fetch("http://172.31.17.153:3000/api/v1/insertInterests", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          selectedInterests,
        }),
      });

      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }
      router.push({ pathname: '../(tabs)/profile' });
    } catch (error) {
      console.error('Invalid interests selected.', error);
      Alert.alert('Error', 'Invalid interests selected.', [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#161622">
      <View style={styles.contentContainer}>
        <ThemedText style={styles.welcomeText} lightColor="#2A2B2E" darkColor="#F6F0ED">
          Let's spice it up a little! {'\n'} {'\n'}
          Select up to 5 interests!
        </ThemedText>
        <FlatList
          data={interests}
          renderItem={renderInterest}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.interestsContainer}
        />
        {selectedInterests.length > 0 && (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#F6F0ED" />
            ) : (
              <ThemedText style={styles.continueButtonText} lightColor="#F6F0ED" darkColor="#2A2B2E">
                Continue
              </ThemedText>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  interestsContainer: {
    alignItems: 'center',
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    borderRadius: 20,
    alignItems: 'center',
    borderColor: '#d8a838',
    borderWidth: 1
  },
  selectedBubble: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
    borderWidth: 1
  },
  bubbleText: {
    fontSize: 14,
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
