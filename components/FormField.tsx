// components/FormField.jsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  formWidth,
  maxformWidth,
  height,
  otherStyles,
  otherTextStyles,
  boxStyles,
  alignVertical,
  multiline
}) => {
  return (
    <View style={[styles.container, otherStyles]}>
      <Text style={[styles.title, otherTextStyles]}>{title}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#7b7b8b"
        onChangeText={handleChangeText}
        style={[
          styles.input,
          {
            width: formWidth,
            maxWidth: maxformWidth,
            height: height,
            textAlignVertical: alignVertical,
          },
          boxStyles
        ]}
        multiline={multiline}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    color: '#fff',
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    color: '#fff',
    borderWidth: 1,
    borderColor: '#7b7b8b',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#1E1E2D',
  }
});

export default FormField;
