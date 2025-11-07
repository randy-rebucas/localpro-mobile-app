import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useProviderMode } from '../../contexts/ProviderModeContext';

function HeaderButtons() {
  const { token } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          buildApiUrl(API_CONFIG.ENDPOINTS.COMMUNICATION.UNREAD_COUNT),
          {
            method: 'GET',
            headers: getApiHeaders(token),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUnreadNotifications(data.data.unreadNotifications || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <View style={styles.headerButtons}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.push('/(stack)/notifications' as any)}
      >
        <Ionicons name="notifications-outline" size={24} color="white" />
        {unreadNotifications > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const { isProviderMode } = useProviderMode();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabBarStyle = {
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#374151' : '#e5e7eb',
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  };

  const headerStyle = {
    backgroundColor: '#22c55e',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle,
        headerStyle,
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <HeaderButtons />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isProviderMode ? 'Job Requests' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isProviderMode ? 'briefcase' : 'home'} size={size} color={color} />
          ),
          headerTitleAlign: 'left',
          headerTitle: () => (
            <Text style={styles.headerTitle}>
              {isProviderMode ? 'Job Requests' : `Welcome, ${user?.firstName || 'User'}`}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: isProviderMode ? 'My Clients' : 'My Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isProviderMode ? 'people' : 'calendar'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 16,
  },
  headerButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
