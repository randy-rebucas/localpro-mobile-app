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

export default function PrivacySecuritySettings() {
  const router = useRouter();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    twoFactorAuth: false,
    biometricAuth: true,
    sessionTimeout: 30,
    dataSharing: false,
  });

  const toggleSetting = (key: keyof typeof privacySettings) => {
    if (typeof privacySettings[key] === 'boolean') {
      setPrivacySettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleTwoFactorAuth = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'This will enable two-factor authentication for your account. You will need to verify your identity with a second method when signing in.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: () => toggleSetting('twoFactorAuth') },
      ]
    );
  };

  const handleDataSharing = () => {
    Alert.alert(
      'Data Sharing',
      'Allow LocalPro to use your data to improve services and provide personalized experiences. This includes analytics and service recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Allow', onPress: () => toggleSetting('dataSharing') },
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
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Privacy & Security</Text>
              <Text style={styles.subtitle}>Control your privacy and security settings</Text>
            </View>
          </View>
        </View>

        {/* Profile Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="eye-outline" size={24} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Profile Visibility</Text>
                <Text style={styles.settingDescription}>Who can see your profile</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Public</Text>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="mail-outline" size={24} color="#10b981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Show Email</Text>
                <Text style={styles.settingDescription}>Display email on your profile</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.showEmail}
              onValueChange={() => toggleSetting('showEmail')}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={privacySettings.showEmail ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="call-outline" size={24} color="#f59e0b" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Show Phone</Text>
                <Text style={styles.settingDescription}>Display phone on your profile</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.showPhone}
              onValueChange={() => toggleSetting('showPhone')}
              trackColor={{ false: '#e5e7eb', true: '#f59e0b' }}
              thumbColor={privacySettings.showPhone ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="location-outline" size={24} color="#ef4444" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Show Location</Text>
                <Text style={styles.settingDescription}>Display location on your profile</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.showLocation}
              onValueChange={() => toggleSetting('showLocation')}
              trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
              thumbColor={privacySettings.showLocation ? '#fff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleTwoFactorAuth}>
            <View style={styles.settingContent}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>Add an extra layer of security</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.twoFactorAuth}
              onValueChange={handleTwoFactorAuth}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={privacySettings.twoFactorAuth ? '#fff' : '#f4f4f4'}
            />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="finger-print-outline" size={24} color="#8b5cf6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Biometric Authentication</Text>
                <Text style={styles.settingDescription}>Use fingerprint or face ID</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.biometricAuth}
              onValueChange={() => toggleSetting('biometricAuth')}
              trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
              thumbColor={privacySettings.biometricAuth ? '#fff' : '#f4f4f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Session Timeout</Text>
                <Text style={styles.settingDescription}>Auto-logout after inactivity</Text>
              </View>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>30 minutes</Text>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleDataSharing}>
            <View style={styles.settingContent}>
              <Ionicons name="analytics-outline" size={24} color="#06b6d4" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Data Sharing</Text>
                <Text style={styles.settingDescription}>Allow data usage for improvements</Text>
              </View>
            </View>
            <Switch
              value={privacySettings.dataSharing}
              onValueChange={handleDataSharing}
              trackColor={{ false: '#e5e7eb', true: '#06b6d4' }}
              thumbColor={privacySettings.dataSharing ? '#fff' : '#f4f4f4'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="download-outline" size={24} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Download My Data</Text>
                <Text style={styles.settingDescription}>Export all your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Delete Account</Text>
                <Text style={styles.settingDescription}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
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
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 4,
  },
});
