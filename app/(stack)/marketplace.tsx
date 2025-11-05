import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface ServiceItemProps {
  title: string;
  icon?: string; // Can be emoji or Ionicons name
  iconType: 'emoji' | 'ionicon';
  description: string;
  onPress: () => void;
}

interface ServiceCategory {
  key: string;
  name: string;
  description: string;
  icon: string; // Emoji icon
  subcategories?: string[];
  statistics?: {
    totalServices?: number;
    pricing?: {
      average?: number;
      min?: number;
      max?: number;
    } | null;
    rating?: {
      average?: number;
      totalRatings?: number;
    } | null;
    popularSubcategories?: Array<{
      subcategory: string;
      count: number;
    }>;
  };
}

const ServiceItem: React.FC<ServiceItemProps> = ({ title, icon, iconType, description, onPress }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
    <View style={styles.serviceIcon}>
      {iconType === 'emoji' && icon ? (
        <Text style={styles.emojiIcon}>{icon}</Text>
      ) : (
        <Ionicons name={(icon || 'build') as keyof typeof Ionicons.glyphMap} size={24} color="#22c55e" />
      )}
    </View>
    <View style={styles.serviceContent}>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
  </TouchableOpacity>
);

// Map emoji icons to Ionicons as fallback (for future use if needed)
const emojiToIonicon = (emoji: string): keyof typeof Ionicons.glyphMap => {
  const emojiMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    '🧹': 'sparkles',
    '🔧': 'construct',
    '⚡': 'flash',
    '📦': 'car',
    '🌳': 'leaf',
    '🎨': 'brush',
    '🪵': 'build',
    '🏠': 'home',
    '🏡': 'home',
    '❄️': 'snow',
    '🔌': 'flash',
    '🔐': 'lock-closed',
    '🔨': 'hammer',
    '🚨': 'shield',
    '🏊': 'water',
    '🐛': 'bug',
    '🧼': 'sparkles',
    '🪟': 'home-outline',
    '🌧️': 'rainy',
    '💦': 'water',
    '📋': 'document',
  };
  return emojiMap[emoji] || 'build';
};

export default function MarketplaceScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default fallback services
  const defaultServices = [
    {
      title: 'Cleaning Services',
      icon: '🧹',
      iconType: 'emoji' as const,
      description: 'Professional cleaning for homes and offices',
    },
    {
      title: 'Plumbing',
      icon: '🔧',
      iconType: 'emoji' as const,
      description: 'Repairs, installations, and maintenance',
    },
    {
      title: 'Electrical',
      icon: '⚡',
      iconType: 'emoji' as const,
      description: 'Electrical repairs and installations',
    },
    {
      title: 'Moving Services',
      icon: '📦',
      iconType: 'emoji' as const,
      description: 'Local and long-distance moving',
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getMarketplaceServiceCategories(token || undefined);
        
        if (response.success && response.data) {
          // Handle both array response and object with categories array
          const categoriesData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.categories || response.data.data || []);
          setCategories(categoriesData);
        } else {
          setError(response.error || 'Failed to fetch categories');
          // Use default services on error
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching marketplace categories:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Use default services on error
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  // Use fetched categories or fallback to default
  const services = categories.length > 0
    ? categories.map((category) => ({
        title: category.name || 'Service',
        icon: category.icon || '📋',
        iconType: 'emoji' as const,
        description: category.description || 'Service category',
      }))
    : defaultServices;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : error && categories.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubtext}>Showing default services</Text>
            </View>
          ) : null}
          {services.map((service, index) => {
            const category = categories.length > 0 ? categories[index] : null;
            return (
              <ServiceItem
                key={category?.key || index}
                title={service.title}
                icon={service.icon}
                iconType={service.iconType}
                description={service.description}
                onPress={() => {
                  if (category) {
                    router.push({
                      pathname: '/(stack)/marketplace-category',
                      params: {
                        categoryKey: category.key,
                        categoryName: category.name,
                        categoryIcon: category.icon,
                        categoryDescription: category.description,
                        subcategories: category.subcategories
                          ? encodeURIComponent(JSON.stringify(category.subcategories))
                          : undefined,
                      },
                    } as any);
                  }
                }}
              />
            );
          })}
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
  emojiIcon: {
    fontSize: 24,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
});
