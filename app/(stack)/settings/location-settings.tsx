import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationSettings() {
  const router = useRouter();
  const [locationSettings, setLocationSettings] = useState({
    locationEnabled: true,
    preciseLocation: true,
    backgroundLocation: false,
    locationSharing: true,
    nearbyServices: true,
    locationHistory: false,
  });

  const toggleSetting = (key: keyof typeof locationSettings) => {
    setLocationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLocationPermission = () => {
    Alert.alert(
      'Location Permission',
      'LocalPro needs location access to show you nearby services and providers. You can change this in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => console.log('Open device settings') },
      ]
    );
  };

  const handleLocationHistory = () => {
    Alert.alert(
      'Location History',
      'Location history helps us provide better recommendations and improve our services. This data is stored securely and can be deleted at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: () => toggleSetting('locationHistory') },
      ]
    );
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => router.back()}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Location Settings</Text>
              <Text style={styles.subtitle}>Configure location permissions and preferences</Text>
            </View>
          </View>
        </View>

        {/* Location Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Access</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="location-outline" size={24} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Services</Text>
                <Text style={styles.settingDescription}>Enable location access for the app</Text>
              </View>
            </View>
            <Switch
              value={locationSettings.locationEnabled}
              onValueChange={() => toggleSetting('locationEnabled')}
              trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
              thumbColor={locationSettings.locationEnabled ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="locate-outline" size={24} color="#10b981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Precise Location</Text>
                <Text style={styles.settingDescription}>Use precise location for better accuracy</Text>
              </View>
            </View>
            <Switch
              value={locationSettings.preciseLocation}
              onValueChange={() => toggleSetting('preciseLocation')}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={locationSettings.preciseLocation ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Background Location</Text>
                <Text style={styles.settingDescription}>Allow location access when app is closed</Text>
              </View>
            </View>
            <Switch
              value={locationSettings.backgroundLocation}
              onValueChange={() => toggleSetting('backgroundLocation')}
              trackColor={{ false: '#e5e7eb', true: '#f59e0b' }}
              thumbColor={locationSettings.backgroundLocation ? '#fff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Location Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Sharing</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="people-outline" size={24} color="#8b5cf6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Share Location</Text>
                <Text style={styles.settingDescription}>Share your location with service providers</Text>
              </View>
            </View>
            <Switch
              value={locationSettings.locationSharing}
              onValueChange={() => toggleSetting('locationSharing')}
              trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
              thumbColor={locationSettings.locationSharing ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="business-outline" size={24} color="#06b6d4" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Nearby Services</Text>
                <Text style={styles.settingDescription}>Show services near your location</Text>
              </View>
            </View>
            <Switch
              value={locationSettings.nearbyServices}
              onValueChange={() => toggleSetting('nearbyServices')}
              trackColor={{ false: '#e5e7eb', true: '#06b6d4' }}
              thumbColor={locationSettings.nearbyServices ? '#fff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Privacy & History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & History</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleLocationHistory}>
            <View style={styles.settingContent}>
              <Ionicons name="time-outline" size={24} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location History</Text>
                <Text style={styles.settingDescription}>Save location history for better recommendations</Text>
              </View>
            </View>
            <Switch
              value={locationSettings.locationHistory}
              onValueChange={handleLocationHistory}
              trackColor={{ false: '#e5e7eb', true: '#6b7280' }}
              thumbColor={locationSettings.locationHistory ? '#fff' : '#f4f4f4'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Clear Location History</Text>
                <Text style={styles.settingDescription}>Delete all saved location data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleLocationPermission}>
            <View style={styles.settingContent}>
              <Ionicons name="settings-outline" size={24} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Device Settings</Text>
                <Text style={styles.settingDescription}>Manage location permissions in device settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Current Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          
          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={24} color="#3b82f6" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Last Known Location</Text>
              <Text style={styles.locationAddress}>123 Main Street, City, State</Text>
              <Text style={styles.locationTime}>Updated 2 minutes ago</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 2,
  },
  locationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  refreshButton: {
    padding: 8,
  },
});
