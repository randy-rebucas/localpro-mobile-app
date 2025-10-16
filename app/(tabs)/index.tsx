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

interface ServiceCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  features: string[];
  onPress: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, icon, color, features, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="white" />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <View style={styles.featuresContainer}>
      {features.map((feature, index) => (
        <Text key={index} style={styles.featureText}>• {feature}</Text>
      ))}
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const services = [
    {
      title: 'Marketplace',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      color: '#6b7280',
      features: ['Demand services', 'Cleaning', 'Plumbing', 'Electrical', 'Moving'],
      route: 'marketplace',
    },
    {
      title: 'Supplies & Materials',
      icon: 'cube' as keyof typeof Ionicons.glyphMap,
      color: '#92400e',
      features: ['Cleaning supplies', 'Tools', 'Subscription kits'],
      route: 'supplies',
    },
    {
      title: 'Academy',
      icon: 'school' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      features: ['Partner with TES', 'Run courses', 'Certification'],
      route: 'academy',
    },
    {
      title: 'Finance',
      icon: 'card' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      features: ['Salary advance', 'Micro-loans', 'Partner with fintech'],
      route: 'finance',
    },
    {
      title: 'Rentals',
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      features: ['Tool and vehicle rentals'],
      route: 'rentals',
    },
    {
      title: 'Ads',
      icon: 'megaphone' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      features: ['Hardware stores', 'Suppliers', 'Training schools'],
      route: 'ads',
    },
    {
      title: 'FacilityCare',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      features: ['Janitorial contracts', 'Landscaping', 'Pest control'],
      route: 'facility-care',
    },
    {
      title: 'LocalPro Plus',
      icon: 'star' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      features: ['Premium subscriptions', 'Providers', 'Clients'],
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
            Welcome back, {user?.name || 'User'}!
          </Text>
          <Text style={styles.subtitleText}>
            Access all your services from one central hub
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              icon={service.icon}
              color={service.color}
              features={service.features}
              onPress={() => router.push(`/(tabs)/${service.route}`)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="add-circle" size={24} color="#22c55e" />
              <Text style={styles.quickActionText}>New Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="search" size={24} color="#22c55e" />
              <Text style={styles.quickActionText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="notifications" size={24} color="#22c55e" />
              <Text style={styles.quickActionText}>Notifications</Text>
            </TouchableOpacity>
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
  servicesGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featuresContainer: {
    marginTop: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
