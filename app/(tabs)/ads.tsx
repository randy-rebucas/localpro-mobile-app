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

interface AdItemProps {
  title: string;
  category: string;
  description: string;
  price: string;
  onPress: () => void;
}

const AdItem: React.FC<AdItemProps> = ({ title, category, description, price, onPress }) => (
  <TouchableOpacity style={styles.adItem} onPress={onPress}>
    <View style={styles.adHeader}>
      <View style={styles.adCategory}>
        <Text style={styles.adCategoryText}>{category}</Text>
      </View>
      <View style={styles.adPrice}>
        <Text style={styles.adPriceText}>{price}</Text>
      </View>
    </View>
    <Text style={styles.adTitle}>{title}</Text>
    <Text style={styles.adDescription}>{description}</Text>
    <View style={styles.adActions}>
      <TouchableOpacity style={styles.adButton}>
        <Text style={styles.adButtonText}>View Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.adButtonSecondary}>
        <Text style={styles.adButtonTextSecondary}>Contact</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function AdsScreen() {
  const ads = [
    {
      title: 'Hardware Store - Downtown',
      category: 'Hardware Store',
      description: 'Complete hardware store with tools, materials, and supplies',
      price: '$2,500/mo',
    },
    {
      title: 'Training School - Westside',
      category: 'Training School',
      description: 'Professional training facility for service providers',
      price: '$1,800/mo',
    },
    {
      title: 'Supplier Network - Regional',
      category: 'Supplier',
      description: 'Regional supplier network for cleaning and maintenance',
      price: '$3,200/mo',
    },
    {
      title: 'Tool Rental Shop',
      category: 'Hardware Store',
      description: 'Specialized tool rental and sales business',
      price: '$2,100/mo',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Advertising</Text>
          <Text style={styles.subtitle}>Promote your business to service providers</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15,000+</Text>
            <Text style={styles.statLabel}>Active Providers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Advertisers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Satisfaction Rate</Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Ad Categories</Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="storefront" size={32} color="#22c55e" />
              <Text style={styles.categoryTitle}>Hardware Stores</Text>
              <Text style={styles.categoryDescription}>Reach tool and supply buyers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="school" size={32} color="#22c55e" />
              <Text style={styles.categoryTitle}>Training Schools</Text>
              <Text style={styles.categoryDescription}>Connect with learners</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="business" size={32} color="#22c55e" />
              <Text style={styles.categoryTitle}>Suppliers</Text>
              <Text style={styles.categoryDescription}>B2B supply chain</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="megaphone" size={32} color="#22c55e" />
              <Text style={styles.categoryTitle}>General Ads</Text>
              <Text style={styles.categoryDescription}>Broad reach campaigns</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.adsContainer}>
          <Text style={styles.sectionTitle}>Featured Advertisements</Text>
          {ads.map((ad, index) => (
            <AdItem
              key={index}
              title={ad.title}
              category={ad.category}
              description={ad.description}
              price={ad.price}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.createAdContainer}>
          <View style={styles.createAdCard}>
            <View style={styles.createAdHeader}>
              <Ionicons name="add-circle" size={32} color="#22c55e" />
              <Text style={styles.createAdTitle}>Create Your Ad</Text>
            </View>
            <Text style={styles.createAdDescription}>
              Reach thousands of service providers and grow your business with targeted advertising
            </Text>
            <TouchableOpacity style={styles.createAdButton}>
              <Text style={styles.createAdButtonText}>Start Advertising</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
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
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  adsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  adItem: {
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
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adCategory: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adCategoryText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  adPrice: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adPriceText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  adActions: {
    flexDirection: 'row',
    gap: 12,
  },
  adButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  adButtonSecondary: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  adButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  adButtonTextSecondary: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  createAdContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  createAdCard: {
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
  createAdHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  createAdTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  createAdDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createAdButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createAdButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
