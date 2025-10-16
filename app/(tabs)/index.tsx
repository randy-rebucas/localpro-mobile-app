import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface ServiceBlockProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const ServiceBlock: React.FC<ServiceBlockProps> = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.serviceBlock} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color="white" />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.serviceSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const services = [
    {
      title: 'Marketplace',
      subtitle: 'Buy & sell locally',
      icon: 'storefront' as keyof typeof Ionicons.glyphMap,
      color: '#3b82f6',
      route: 'marketplace',
    },
    {
      title: 'Supplies',
      subtitle: 'Equipment & tools',
      icon: 'cube' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      route: 'supplies',
    },
    {
      title: 'Academy',
      subtitle: 'Learn & grow',
      icon: 'school' as keyof typeof Ionicons.glyphMap,
      color: '#10b981',
      route: 'academy',
    },
    {
      title: 'Finance',
      subtitle: 'Manage money',
      icon: 'card' as keyof typeof Ionicons.glyphMap,
      color: '#8b5cf6',
      route: 'finance',
    },
    {
      title: 'Rentals',
      subtitle: 'Rent equipment',
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      color: '#ef4444',
      route: 'rentals',
    },
    {
      title: 'Ads',
      subtitle: 'Promote business',
      icon: 'megaphone' as keyof typeof Ionicons.glyphMap,
      color: '#06b6d4',
      route: 'ads',
    },
    {
      title: 'FacilityCare',
      subtitle: 'Property services',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      color: '#84cc16',
      route: 'facility-care',
    },
    {
      title: 'LocalPro Plus',
      subtitle: 'Premium features',
      icon: 'star' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      route: 'plus',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.appName}>LocalPro</Text>
              <Text style={styles.subtitle}>Super App</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.firstName || 'User'}!
          </Text>
          <Text style={styles.subtitleText}>
            Access all your services from one central hub
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesContainer}>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceBlock
                key={index}
                title={service.title}
                subtitle={service.subtitle}
                icon={service.icon}
                color={service.color}
                onPress={() => router.push(`/(stack)/${service.route}` as any)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutButton: {
    padding: 8,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceBlock: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    height: 160,
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
