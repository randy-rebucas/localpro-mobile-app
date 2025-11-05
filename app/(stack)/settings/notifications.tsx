import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsSettings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    bookingUpdates: true,
    paymentReminders: true,
    marketing: false,
    security: true,
    weeklyDigest: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>Manage your notification preferences</Text>
            </View>
          </View>
        </View>

        {/* Push Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="phone-portrait-outline" size={24} color="#3b82f6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications on your device</Text>
              </View>
            </View>
            <Switch
              value={notifications.push}
              onValueChange={() => toggleNotification('push')}
              trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
              thumbColor={notifications.push ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="mail-outline" size={24} color="#10b981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications via email</Text>
              </View>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={() => toggleNotification('email')}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={notifications.email ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="chatbubble-outline" size={24} color="#f59e0b" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications via SMS</Text>
              </View>
            </View>
            <Switch
              value={notifications.sms}
              onValueChange={() => toggleNotification('sms')}
              trackColor={{ false: '#e5e7eb', true: '#f59e0b' }}
              thumbColor={notifications.sms ? '#fff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Booking Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Updates</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Booking Updates</Text>
                <Text style={styles.settingDescription}>Get notified about booking changes</Text>
              </View>
            </View>
            <Switch
              value={notifications.bookingUpdates}
              onValueChange={() => toggleNotification('bookingUpdates')}
              trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
              thumbColor={notifications.bookingUpdates ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="card-outline" size={24} color="#ef4444" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Payment Reminders</Text>
                <Text style={styles.settingDescription}>Get reminded about payments</Text>
              </View>
            </View>
            <Switch
              value={notifications.paymentReminders}
              onValueChange={() => toggleNotification('paymentReminders')}
              trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
              thumbColor={notifications.paymentReminders ? '#fff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Other Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="megaphone-outline" size={24} color="#06b6d4" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Marketing</Text>
                <Text style={styles.settingDescription}>Receive promotional offers</Text>
              </View>
            </View>
            <Switch
              value={notifications.marketing}
              onValueChange={() => toggleNotification('marketing')}
              trackColor={{ false: '#e5e7eb', true: '#06b6d4' }}
              thumbColor={notifications.marketing ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="shield-outline" size={24} color="#10b981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Security Alerts</Text>
                <Text style={styles.settingDescription}>Get notified about security events</Text>
              </View>
            </View>
            <Switch
              value={notifications.security}
              onValueChange={() => toggleNotification('security')}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={notifications.security ? '#fff' : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="newspaper-outline" size={24} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Weekly Digest</Text>
                <Text style={styles.settingDescription}>Receive weekly activity summary</Text>
              </View>
            </View>
            <Switch
              value={notifications.weeklyDigest}
              onValueChange={() => toggleNotification('weeklyDigest')}
              trackColor={{ false: '#e5e7eb', true: '#6b7280' }}
              thumbColor={notifications.weeklyDigest ? '#fff' : '#f4f4f4'}
            />
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
});
