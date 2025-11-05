import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ServiceItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  price: string;
  onPress: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ title, icon, description, price, onPress }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
    <View style={styles.serviceIcon}>
      <Ionicons name={icon} size={24} color="#22c55e" />
    </View>
    <View style={styles.serviceContent}>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDescription}>{description}</Text>
      <Text style={styles.servicePrice}>{price}</Text>
    </View>
    <TouchableOpacity style={styles.bookButton}>
      <Text style={styles.bookButtonText}>Book</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function FacilityCareScreen() {
  const services = [
    {
      title: 'Janitorial Contracts',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      description: 'Regular cleaning and maintenance for offices and facilities',
      price: 'From $500/mo',
    },
    {
      title: 'Landscaping Maintenance',
      icon: 'leaf' as keyof typeof Ionicons.glyphMap,
      description: 'Professional landscaping and garden maintenance',
      price: 'From $300/mo',
    },
    {
      title: 'Pest Control Subscriptions',
      icon: 'bug' as keyof typeof Ionicons.glyphMap,
      description: 'Regular pest control and prevention services',
      price: 'From $150/mo',
    },
    {
      title: 'Facility Management',
      icon: 'settings' as keyof typeof Ionicons.glyphMap,
      description: 'Complete facility management and maintenance',
      price: 'From $1,000/mo',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>FacilityCare</Text>
          <Text style={styles.subtitle}>Professional facility maintenance services</Text>
        </View>

        <View style={styles.heroContainer}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="business" size={32} color="#22c55e" />
            </View>
            <Text style={styles.heroTitle}>Complete Facility Solutions</Text>
            <Text style={styles.heroDescription}>
              From janitorial services to landscaping and pest control, 
              we provide comprehensive facility care for your business.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>200+</Text>
                <Text style={styles.heroStatLabel}>Facilities</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>24/7</Text>
                <Text style={styles.heroStatLabel}>Support</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>99%</Text>
                <Text style={styles.heroStatLabel}>Satisfaction</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {services.map((service, index) => (
            <ServiceItem
              key={index}
              title={service.title}
              icon={service.icon}
              description={service.description}
              price={service.price}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.subscriptionContainer}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Ionicons name="refresh" size={24} color="#22c55e" />
              <Text style={styles.subscriptionTitle}>Subscription Plans</Text>
            </View>
            <Text style={styles.subscriptionDescription}>
              Choose from our flexible subscription plans designed to meet your facility's needs
            </Text>
            <View style={styles.subscriptionPlans}>
              <View style={styles.planItem}>
                <Text style={styles.planName}>Basic</Text>
                <Text style={styles.planPrice}>$500/mo</Text>
                <Text style={styles.planFeatures}>• Weekly cleaning</Text>
                <Text style={styles.planFeatures}>• Basic maintenance</Text>
              </View>
              <View style={styles.planItem}>
                <Text style={styles.planName}>Professional</Text>
                <Text style={styles.planPrice}>$1,200/mo</Text>
                <Text style={styles.planFeatures}>• Daily cleaning</Text>
                <Text style={styles.planFeatures}>• Landscaping</Text>
                <Text style={styles.planFeatures}>• Pest control</Text>
              </View>
              <View style={styles.planItem}>
                <Text style={styles.planName}>Enterprise</Text>
                <Text style={styles.planPrice}>$2,500/mo</Text>
                <Text style={styles.planFeatures}>• 24/7 support</Text>
                <Text style={styles.planFeatures}>• Full management</Text>
                <Text style={styles.planFeatures}>• Custom solutions</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contactContainer}>
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Ionicons name="call" size={24} color="#22c55e" />
              <Text style={styles.contactTitle}>Get a Quote</Text>
            </View>
            <Text style={styles.contactDescription}>
              Contact us for a personalized quote for your facility's needs
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Request Quote</Text>
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
  heroContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
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
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  bookButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  subscriptionPlans: {
    gap: 12,
  },
  planItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  planFeatures: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
