import { View, Text, FlatList, Image, RefreshControl, Alert, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Redirect, router } from 'expo-router'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import SearchInput from '@/components/SearchInput'
import EmptyStateHome from '@/components/EmptyStateHome'
import DropDownMenu from '@/components/DropDownMenu';
import { icons } from '../../constants'
import ImageButton from '@/components/ImageButton'
import { useUser } from '@/components/UserContext';

import Recent from '../(othertabs)/homerecent'
import Recommended from '../(othertabs)/homereccomended';
import Popular from '../(othertabs)/homepopular';

const Home = () => {
    const { userId } = useUser();
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [currentView, setCurrentView] = useState('Posts');

    console.log(userId.user_uuid)

    const getButtonTextStyle = (view) => ({
        color: currentView === view ? '#FFF' : '#000',
    });

    return (
        <ThemedView
            style={styles.container}
            lightColor="#F6F0ED"
            darkColor="#161622">
            <View className="my-6 px-4 space-y-6">
                <View className="flex-row justify-between items-center mb-6">
                    <ThemedText
                        style={styles.welcomeBanner}
                        lightColor="#2A2B2E"
                        darkColor="#F6F0ED">
                        Great to have you, {''}
                        <Text style={{ color: '#d8a838' }}>
                            {userId.username}
                        </Text>
                        !
                    </ThemedText>
                    <ImageButton
                        imageSource={icons.direct_messages}
                        handlePress={() => router.push('/messages')}
                        imageContainerStyles="w-[40px] h-[25px]"
                    />
                </View>
                <SearchInput
                    placeholder="Search something..." />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, currentView === 'Recent' && styles.activeButton]}
                    onPress={() => setCurrentView('Recent')}>
                    <Text style={[styles.buttonText, getButtonTextStyle('Recent')]}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, currentView === 'Recommended' && styles.activeButton]}
                    onPress={() => setCurrentView('Recommended')}>
                    <Text style={[styles.buttonText, getButtonTextStyle('Recommended')]}>Recommended</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, currentView === 'Popular' && styles.activeButton]}
                    onPress={() => setCurrentView('Popular')}>
                    <Text style={[styles.buttonText, getButtonTextStyle('Popular')]}>Popular</Text>
                </TouchableOpacity>
            </View>
            {currentView === 'Recent' ? (
                <Recent />
            ) : currentView === 'Recommended' ? (
                <Recommended />
            ) : (
                <Popular />
            )}
        </ThemedView>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 35,
    },

    welcomeBanner: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    postContainer: {
        padding: 15,
        marginBottom: 16,
        marginLeft: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#7b7b8b',
        width: 340,
        alignItems: 'flex-start',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },

    usernameTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    commentsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    commentText: {
        fontSize: 14,
        marginTop: 11,
        marginLeft: 8,
        color: '#7b7b8b',
    },

    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 77,
    },

    icon: {
        marginRight: 9,
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        backgroundColor: '#E0E0E0',
    },
    activeButton: {
        backgroundColor: '#6200EE',
    },
    buttonText: {
        fontWeight: 'bold',
    },
})
