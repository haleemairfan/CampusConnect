
import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, buttonWidth, buttonColor, maxButtonWidth, disabled}) => {
  return (
    <TouchableOpacity 
    onPress={handlePress}
    activeOpacity={0.7}
    className={`rounded-xl h-12 justify-center items-center} ${containerStyles} ${isLoading ? 'opacity-50': ''}`}
    style={{ 
      backgroundColor: buttonColor,
      width: buttonWidth,
      maxWidth: maxButtonWidth,
    }}
    disabled={disabled}
    >
    
    <Text className={textStyles}>
        {title}
    </Text>
    </TouchableOpacity>
  )
}

export default CustomButton