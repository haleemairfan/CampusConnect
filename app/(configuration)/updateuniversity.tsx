
import React, { useState } from 'react';
import { TextInput, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

    return (
        <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
        <ThemedView style={styles.container} lightColor="#F6F0ED" darkColor="#161622">
            <ThemedText style={styles.welcomeText} lightColor="#2A2B2E" darkColor="#F6F0ED">
            Let's update your configuration!
            </ThemedText>
            <ThemedText style={styles.label} lightColor="#2A2B2E" darkColor="#F6F0ED">
            First, what's your university?
            </ThemedText>
            <ThemedView style={styles.inputContainer} lightColor="#fff" darkColor="#333">
            <TextInput
                style={[styles.input, selectedUniversity ? styles.selectedTextColor: null]}
                placeholder="Enter your university..."
                placeholderTextColor="#7b7b8b"
                value={query}
                onChangeText={handleSearch}
                onFocus={() => setDropdownVisible(true)}
            />
            </ThemedView>
            {dropdownVisible && filteredUniversities.length > 0 && (
            <ThemedView style={styles.dropdown} lightColor="#fff" darkColor="#333">
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
            <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push({
              pathname: '/updatemajor',
              params: { selectedUniversity }
            })}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#F6F0ED" />
            ) : (
              <ThemedText style={styles.continueButtonText} lightColor="#F6F0ED" darkColor="#2A2B2E">
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
    paddingHorizontal: 16,
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 50,
    width: 325,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 5,
    color: '#7b7b8b'
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
  selectedUniversity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center'
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
    fontWeight: "bold"
  },
  selectedTextColor: {
    color: '#7b7b8b',
  },
});