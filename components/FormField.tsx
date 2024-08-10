
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'

import { icons } from "../constants"

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, formWidth, maxformWidth, otherTextStyles, boxStyles, height = 50, alignVertical = 'center', multiline=false, ...props }) => {
    const [showPassword, setshowPassword] = useState(false)
    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className={`text-base text-gray-100 ${otherTextStyles}`}>{title}</Text>

            <View 
                className={`${boxStyles} flex-row`} 
                style={{ 
                    width: formWidth,
                    maxWidth: maxformWidth,
                    height: height, // Use the height prop here
                }}
            >
                <TextInput
                    className="flex-1 text-white text-base"
                    style={{ 
                        textAlignVertical: alignVertical, // Set textAlignVertical to 'top'
                        paddingVertical: 0, // Ensure no extra padding is added
                    }}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showPassword}
                    multiline = {multiline}
                    {...props} 
                />

                {title === 'Password' && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image 
                            source={!showPassword ? icons.eye_icon : icons.eye_hide_icon}
                            className="w-6 h-6" 
                            resizeMode='contain'/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}


export default FormField