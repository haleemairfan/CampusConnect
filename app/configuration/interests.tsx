import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const interests = [
  'Traveling', 'Reading', 'Music', 'Sports', 'Cooking', 
  'Fitness', 'Movies', 'Photography', 'Dancing', 'Writing', 
  'Gaming', 'Art', 'Tech', 'Fashion', 'Nature', 
  'Animals', 'Volunteering', 'Blogging', 'Meditation', 'Crafts'
];

export default function SelectInterests() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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
      // Handle continue action
      console.log('Selected Interests:', selectedInterests);
    }
  };

  const renderInterest = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.bubble, selectedInterests.includes(item) ? styles.selectedBubble : null]}
      onPress={() => toggleInterest(item)}
    >
      <ThemedText style={styles.bubbleText} lightColor="#2A2B2E" darkColor="#F6F0ED">
        {item}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#2A2B2E">
      <View style={styles.contentContainer}>
        <ThemedText style={styles.welcomeText} lightColor="#2A2B2E" darkColor="#F6F0ED">
          Select up to 5 interests
        </ThemedText>
        <FlatList
          data={interests}
          renderItem={renderInterest}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.interestsContainer}
        />
        {selectedInterests.length > 0 && (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <ThemedText style={styles.continueButtonText} lightColor="#F6F0ED" darkColor="#2A2B2E">
              Continue
            </ThemedText>
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
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedBubble: {
    backgroundColor: '#007BFF',
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
