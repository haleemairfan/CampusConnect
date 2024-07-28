import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/components/UserContext';

const universities = [
  'National University of Singapore (NUS)',
  'Nanyang Technological University (NTU)',
  'Singapore Management University (SMU)',
  'Singapore University of Technology and Design (SUTD)',
  'Singapore Institute of Technology (SIT)',
  'Singapore University of Social Sciences (SUSS)',
  'Singapore Institute of Management (SIM)',
  'LASALLE College of the Arts'
];

export default function SelectUniversity() {
  const { userId } = useUser();
  const id = userId.user_uuid;
  const [query, setQuery] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState(universities);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = universities.filter((university) =>
      university.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUniversities(filtered);
    setDropdownVisible(true);
  };

  const handleSelectUniversity = (university: string) => {
    setSelectedUniversity(university);
    setQuery(university);
    setFilteredUniversities([]);
    setDropdownVisible(false);
  };

  const handleDismissKeyboard = () => {
    setDropdownVisible(false);
    Keyboard.dismiss();
  };

  async function insertUniversity() {
    setIsLoading(true);
    try {
      const results = await fetch("http://172.31.17.153:3000/api/v1/insertUniversity", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          selectedUniversity
        }),
      });

      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }
      router.push({ pathname: './major', params: { id } });
    } catch (error) {
      console.error('Invalid university selected:', error);
      Alert.alert('Error', 'Invalid University Selected', [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#161622">
        <ThemedText style={styles.text} lightColor="#2A2B2E" darkColor="#F6F0ED">
          Welcome, let's get to know you a bit more!
        </ThemedText>
        <ThemedText style={styles.text} lightColor="#2A2B2E" darkColor="#F6F0ED">
          First, what's your university?
        </ThemedText>
        <ThemedView style={styles.inputContainer} lightColor="#fff" darkColor="#333">
          <TextInput
            style={[styles.input, selectedUniversity ? styles.selectedTextColor : null]}
            placeholder="Enter your university..."
            placeholderTextColor="#7b7b8b"
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setDropdownVisible(true)}
          />
        </ThemedView>
        {dropdownVisible && filteredUniversities.length > 0 && (
          <ThemedView style={[styles.inputContainer, styles.dropdown]} lightColor="#fff" darkColor="#333">
            <FlatList
              data={filteredUniversities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectUniversity(item)}>
                  <ThemedText style={styles.dropdownItem} lightColor="#2A2B2E" darkColor="#F6F0ED">
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        )}
        {selectedUniversity ? (
          <ThemedView style={styles.selectedContainer} lightColor="#F6F0ED" darkColor="#161622">
            <ThemedText style={styles.selectedLabel} lightColor="#2A2B2E" darkColor="#F6F0ED">
              You selected:
            </ThemedText>
            <ThemedText style={styles.selectedUniversity} lightColor="#2A2B2E" darkColor="#F6F0ED">
              {selectedUniversity}
            </ThemedText>
          </ThemedView>
        ) : null}
        {selectedUniversity ? (
          <TouchableOpacity style={styles.button} onPress={insertUniversity} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#d8a838" />
            ) : (
              <ThemedText style={styles.continueButtonText} lightColor="#2A2B2E" darkColor="#F6F0ED" type="default">
                Continue
              </ThemedText>
            )}
          </TouchableOpacity>
        ) : null}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 20,
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputContainer: {
    paddingHorizontal: 16,
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 50,
    width: 250,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 5,
    color: '#7b7b8b'
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#000'
  },
  dropdown: {
    minHeight: 200, // Increased height to show more items
    width: 250,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: -10 // Slight overlap with the input box
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedContainer: {
    marginTop: 60, // Positioned lower
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: 16,
  },
  selectedUniversity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center'
  },
  button: {
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 16, 
    backgroundColor: 'transparent',
    borderColor: '#d8a838',
    borderWidth: 3,
    width: 150,
    marginTop: 40 // Positioned lower
  },
  continueButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedTextColor: {
    color: '#7b7b8b',
  },
});
