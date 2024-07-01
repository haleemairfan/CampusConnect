
import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';


const majors = [
  'Architecture',
  'Accountancy',
  'Anthropology',
  'Biomedical Engineering',
  'Business Administration',
  'Business Analytics',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Communications and New Media',
  'Computer Engineering',
  'Computer Science',
  'Dentistry',
  'Data Science and Analytics',
  'Data Science and Economics',
  'Economics',
  'Electrical Engineering',
  'Environmental Engineering',
  'Environmental Studies',
  'Food Science and Technology',
  'Geography',
  'Industrial Design',
  'Industrial Systems Engineering and Management',
  'Information Security',
  'Information Systems',
  'Law',
  'Life Sciences',
  'Materials Science and Engineering',
  'Mathematics',
  'Mechanical Engineering',
  'Medicine',
  'Music',
  'Nursing',
  'Pharmacy',
  'Physics',
  'Political Science',
  'Psychology',
  'Philosophy, Politics, and Economics',
  'Quantitative Finance',
  'Real Estate',
  'Social Work',
  'Sociology',
  'Statistics',
  'Theatre Studies',
];


export default function SelectMajor() {
  const { id } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [filteredMajors, setFilteredMajors] = useState(majors);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = majors.filter((major) =>
      major.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMajors(filtered);
    setDropdownVisible(true);
  };

  const handleSelectMajor = (major: string) => {
    setSelectedMajor(major);
    setQuery(major);
    setFilteredMajors([]);
    setDropdownVisible(false);
  };

  const handleDismissKeyboard = () => {
    setDropdownVisible(false);
    Keyboard.dismiss();
  };

  async function insertMajor() {
    try {
      const results = await fetch("http://172.31.17.153:3000/api/v1/insertMajor", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          selectedMajor
        }),
      });
      
      const data = await results.json();

      if (!results.ok) {
        throw new Error(data.message);
      }
      router.push({ pathname: './yearofstudy', params: { id } })
    } catch (error) {
      console.error('Invalid major selected:', error);
      Alert.alert('Error', 'Invalid Major Selected',
        [{ text: 'Please try again', onPress: () => console.log('Alert closed') }]);

    }



    }
  
  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#2A2B2E">
        <ThemedText style={styles.welcomeText} lightColor="#2A2B2E" darkColor="#F6F0ED">
          Welcome username, what's your major?
        </ThemedText>
        <ThemedText style={styles.label} lightColor="#2A2B2E" darkColor="#F6F0ED">
          Select Your Major:
        </ThemedText>
        <ThemedView style={styles.inputContainer} lightColor="#fff" darkColor="#333">
          <TextInput
            style={styles.input}
            placeholder="Enter your major"
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setDropdownVisible(true)}
          />
        </ThemedView>
        {dropdownVisible && filteredMajors.length > 0 && (
          <ThemedView style={styles.dropdown} lightColor="#fff" darkColor="#333">
            <FlatList
              data={filteredMajors}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectMajor(item)}>
                  <ThemedText style={styles.dropdownItem} lightColor="#2A2B2E" darkColor="#F6F0ED">
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        )}
        {selectedMajor ? (
          <ThemedView style={styles.selectedContainer} lightColor="#F6F0ED" darkColor="#2A2B2E">
            <ThemedText style={styles.selectedLabel} lightColor="#2A2B2E" darkColor="#F6F0ED">
              Selected Major:
            </ThemedText>
            <ThemedText style={styles.selectedMajor} lightColor="#2A2B2E" darkColor="#F6F0ED">
              {selectedMajor}
            </ThemedText>
          </ThemedView>
        ) : null}
        {selectedMajor ? (
          <TouchableOpacity style={styles.continueButton} onPress={insertMajor}>
            <ThemedText style={styles.continueButtonText} lightColor="#F6F0ED" darkColor="#2A2B2E">
              Continue
            </ThemedText>
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
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
  },
  dropdown: {
    maxHeight: 150,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: 16,
  },
  selectedMajor: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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