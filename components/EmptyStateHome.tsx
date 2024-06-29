
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

        <Text className=" text-white text-center text-center mt-3 ml-20 font-bold" style={{ fontSize: 19 }}>
            {'\n'} {'\n'} {'\n'} {'\n'}
            Create {''}
            <Text style={{ color: '#d8a838' }}>
            your first post
            </Text> {'\n'}
            here!
        </Text>

        <Image source={icons.down_arrow} className="w-[50px] h-[30px] mt-3 ml-20" resizeMode='contain'/>
    </View>
  )
}

export default EmptyStateHome