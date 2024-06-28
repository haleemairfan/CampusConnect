

import { View, Text, Image, StyleSheet} from 'react-native'
import React from 'react'

import { icons } from '../constants';

const EmptyStateMessages = ({ title }) => {
  return (
    <View className = 'justify-center items-center px-16'>
        <Text>
        {`\n`} {`\n`} {`\n`} {`\n`} {`\n`}
        </Text>
        <Image source={icons.messages_empty_icon} className="w-[100px] h-[100px] mt-20" resizeMode='contain'/>
        <Text className = 'text-gray-100 font-bold mt-5' style={{ fontSize: 20 }}>
            {title}
        </Text>
    </View>
  )
}

export default EmptyStateMessages