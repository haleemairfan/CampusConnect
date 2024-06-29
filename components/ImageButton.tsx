

import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { icons } from '../constants'

const ImageButton = ({ imageSource, handlePress, isLoading, imageContainerStyles }) => {
  return (
    <TouchableOpacity 
    onPress={handlePress}
    activeOpacity={0.7}
    disabled={isLoading}
    >
        <Image source={imageSource} className={`${imageContainerStyles}`} resizeMode='contain'/>
    </TouchableOpacity>
  )
}

export default ImageButton