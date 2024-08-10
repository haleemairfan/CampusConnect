
import { View, Text, Image } from 'react-native'
import React from 'react'

import { icons } from '../constants';

const EmptyStateHome = ({ title, subtitle }) => {
  return (
    <View className = 'justify-center items-center px-4'>
        <Image source={icons.home_empty_icon} className="w-[200px] h-[200px] mb-3" resizeMode='contain'/>
        <Text className = 'text-gray-100' style={{ fontSize: 17 }}>
            {title}
        </Text>
        <Text className = 'text-center text-white mt-2' style={{ fontSize: 20 }}>
            {subtitle}
        </Text>
    </View>
  )
}

export default EmptyStateHome