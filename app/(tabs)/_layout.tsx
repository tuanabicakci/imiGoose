import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.imiPrimary,
                tabBarInactiveTintColor: Colors.imiTextMuted,
                tabBarStyle: {
                    borderTopColor: Colors.imiBorder,
                    backgroundColor: Colors.white,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pathways"
                options={{
                    title: 'Pathways',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calculator"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="documents"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Community',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
