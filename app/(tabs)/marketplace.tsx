import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  onPress: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ title, icon, description, onPress }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
    <View style={styles.serviceIcon}>
      <Ionicons name={icon} size={24} color="#22c55e" />
    </View>
    <View style={styles.serviceContent}>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
  </TouchableOpacity>
);

export default function MarketplaceScreen() {
  const services = [
    {
      title: 'Cleaning Services',
      icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
      description: 'Professional cleaning for homes and offices',
    },
    {
      title: 'Plumbing',
      icon: 'water' as keyof typeof Ionicons.glyphMap,
      description: 'Repairs, installations, and maintenance',
    },
    {
      title: 'Electrical',
      icon: 'flash' as keyof typeof Ionicons.glyphMap,
      description: 'Electrical repairs and installations',
    },
    {
      title: 'Moving Services',
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      description: 'Local and long-distance moving',
    },
    {
      title: 'Demand Services',
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      description: 'On-demand service requests',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Find and book services near you</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <Text style={styles.searchPlaceholder}>Search services...</Text>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services.map((service, index) => (
            <ServiceItem
              key={index}
              title={service.title}
              icon={service.icon}
              description={service.description}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,200+</Text>
            <Text style={styles.statLabel}>Active Providers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5,000+</Text>
            <Text style={styles.statLabel}>Completed Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
