import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface MarketplaceService {
  _id?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  provider?: {
    _id: string;
    id?: string;
    firstName: string;
    lastName: string;
    avatar?: {
      url: string;
      thumbnail: string;
    };
  };
  pricing: {
    type: 'hourly' | 'fixed' | 'per_sqft' | 'per_item';
    basePrice: number;
    currency: string;
  };
  availability?: {
    schedule?: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
    timezone?: string;
  };
  serviceArea?: string[]; // Array of zip codes or cities
  images?: Array<{
    url: string;
    publicId?: string;
    thumbnail: string;
    alt?: string;
  }>;
  features?: string[];
  requirements?: string[];
  serviceType?: 'one_time' | 'recurring' | 'emergency' | 'maintenance' | 'installation';
  estimatedDuration?: {
    min: number; // hours
    max: number; // hours
  };
  teamSize?: number;
  equipmentProvided?: boolean;
  materialsIncluded?: boolean;
  warranty?: {
    hasWarranty: boolean;
    duration?: number; // days
    description?: string;
  };
  insurance?: {
    covered: boolean;
    coverageAmount?: number;
  };
  emergencyService?: {
    available: boolean;
    surcharge?: number;
    responseTime?: string;
  };
  servicePackages?: Array<{
    name: string;
    description: string;
    price: number;
    features: string[];
    duration: number;
  }>;
  addOns?: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
  }>;
  isActive?: boolean;
  rating?: {
    average: number;
    count: number; // Changed from totalRatings to count
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface ServiceFilters {
  subcategory?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MarketplaceCategoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { categoryKey, categoryName, categoryIcon, categoryDescription, subcategories } = useLocalSearchParams<{
    categoryKey: string;
    categoryName: string;
    categoryIcon: string;
    categoryDescription: string;
    subcategories?: string;
  }>();
  const { token } = useAuth();
  
  // State
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters state
  const [filters, setFilters] = useState<ServiceFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [tempFilters, setTempFilters] = useState<ServiceFilters>(filters);
  
  // Parse subcategories from route params
  const categorySubcategories = subcategories ? JSON.parse(decodeURIComponent(subcategories)) : [];

  // Update header title with category name and add back button
  useEffect(() => {
    navigation.setOptions({
      title: categoryName || 'Category',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
      ),
    });
  }, [categoryName, navigation, router]);

  const fetchServices = async (isRefresh = false, page = 1, append = false) => {
    if (!categoryKey) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await apiService.getMarketplaceServices(
        {
          category: categoryKey,
          subcategory: filters.subcategory,
          location: filters.location,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          rating: filters.rating,
          page,
          limit: pagination.limit,
          sortBy: filters.sortBy || 'createdAt',
          sortOrder: filters.sortOrder || 'desc',
        },
        token || undefined
      );

      if (response.success && response.data) {
        const servicesData = Array.isArray(response.data)
          ? response.data
          : response.data.services || response.data.data || [];
        
        if (append) {
          // Append new services for infinite scroll
          setServices(prev => [...prev, ...servicesData]);
        } else {
          // Replace services for refresh or filter change
          setServices(servicesData);
        }
        
        // Update pagination from response
        const paginationData = Array.isArray(response.data)
          ? undefined
          : response.data.pagination;
        if (paginationData) {
          setPagination({
            page: paginationData.page || page,
            limit: paginationData.limit || pagination.limit,
            total: paginationData.total || 0,
            totalPages: paginationData.totalPages || 0,
          });
        }
      } else {
        setError(response.error || 'Failed to fetch services');
        if (!append) {
          setServices([]);
        }
      }
    } catch (err) {
      console.error('Error fetching marketplace services:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (!append) {
        setServices([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters or category change
    setServices([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchServices(false, 1, false);
  }, [categoryKey, token, filters]);

  const onRefresh = () => {
    setServices([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchServices(true, 1, false);
  };

  const loadMore = () => {
    if (!loadingMore && !loading && pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      fetchServices(false, nextPage, true);
    }
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters: ServiceFilters = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setShowFilters(false);
  };


  const formatPrice = (service: MarketplaceService) => {
    const { pricing } = service;
    const basePrice = pricing?.basePrice || 0;
    const currency = pricing?.currency || 'USD';
    const priceFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(basePrice);

    const pricingTypeLabels: Record<string, string> = {
      hourly: '/hr',
      fixed: 'fixed',
      per_sqft: '/sq ft',
      per_item: '/item',
    };

    const typeLabel = pricingTypeLabels[pricing?.type || 'fixed'] || '';
    return `${priceFormatted}${typeLabel ? ` ${typeLabel}` : ''}`;
  };

  const renderServiceItem = ({ item: service }: { item: MarketplaceService }) => {
    const serviceId = service.id || service._id || '';
    const hasRating = service.rating && service.rating.count > 0;
    const serviceAreaText = service.serviceArea && service.serviceArea.length > 0 
      ? service.serviceArea[0] 
      : null;
    const duration = service.estimatedDuration 
      ? `${service.estimatedDuration.min}-${service.estimatedDuration.max}h`
      : null;
    const serviceTypeLabels: Record<string, string> = {
      one_time: 'One-time',
      recurring: 'Recurring',
      emergency: 'Emergency',
      maintenance: 'Maintenance',
      installation: 'Installation',
    };
    const serviceTypeLabel = service.serviceType ? serviceTypeLabels[service.serviceType] || service.serviceType : null;

    return (
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => {
          // Navigate to service detail screen when implemented
          console.log('Navigate to service:', serviceId);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.serviceItemImageContainer}>
          {service.images && service.images.length > 0 ? (
            <Image
              source={{ uri: service.images[0].thumbnail || service.images[0].url }}
              style={styles.serviceItemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.serviceItemImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
        </View>
        <View style={styles.serviceItemContent}>
          <View style={styles.serviceItemHeader}>
            <Text style={styles.serviceItemTitle} numberOfLines={2}>
              {service.title}
            </Text>
            {service.emergencyService?.available && (
              <View style={styles.emergencyBadge}>
                <Ionicons name="flash" size={10} color="#ef4444" />
                <Text style={styles.emergencyBadgeText}>Emergency</Text>
              </View>
            )}
          </View>
          <Text style={styles.serviceItemDescription} numberOfLines={2}>
            {service.description}
          </Text>
          <View style={styles.serviceItemMeta}>
            {serviceTypeLabel && (
              <View style={styles.serviceMetaItem}>
                <Ionicons name="time-outline" size={12} color="#6b7280" />
                <Text style={styles.serviceMetaText}>{serviceTypeLabel}</Text>
              </View>
            )}
            {duration && (
              <View style={styles.serviceMetaItem}>
                <Ionicons name="hourglass-outline" size={12} color="#6b7280" />
                <Text style={styles.serviceMetaText}>{duration}</Text>
              </View>
            )}
            {service.teamSize && service.teamSize > 1 && (
              <View style={styles.serviceMetaItem}>
                <Ionicons name="people-outline" size={12} color="#6b7280" />
                <Text style={styles.serviceMetaText}>{service.teamSize} people</Text>
              </View>
            )}
          </View>
          <View style={styles.serviceItemFooter}>
            <Text style={styles.serviceItemPrice}>
              {formatPrice(service)}
            </Text>
            {hasRating && (
              <View style={styles.serviceItemRating}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.serviceItemRatingText}>
                  {service.rating!.average.toFixed(1)}
                </Text>
                <Text style={styles.serviceItemRatingCount}>
                  ({service.rating!.count})
                </Text>
              </View>
            )}
          </View>
          {serviceAreaText && (
            <View style={styles.serviceItemLocation}>
              <Ionicons name="location-outline" size={12} color="#6b7280" />
              <Text style={styles.serviceItemLocationText} numberOfLines={1}>
                {serviceAreaText}
              </Text>
            </View>
          )}
          <View style={styles.serviceItemBadges}>
            {service.equipmentProvided && (
              <View style={styles.badge}>
                <Ionicons name="construct-outline" size={10} color="#22c55e" />
                <Text style={styles.badgeText}>Equipment</Text>
              </View>
            )}
            {service.materialsIncluded && (
              <View style={styles.badge}>
                <Ionicons name="cube-outline" size={10} color="#22c55e" />
                <Text style={styles.badgeText}>Materials</Text>
              </View>
            )}
            {service.warranty?.hasWarranty && (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark-outline" size={10} color="#22c55e" />
                <Text style={styles.badgeText}>Warranty</Text>
              </View>
            )}
            {service.insurance?.covered && (
              <View style={styles.badge}>
                <Ionicons name="shield-outline" size={10} color="#22c55e" />
                <Text style={styles.badgeText}>Insured</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="filter" size={20} color="#22c55e" />
        <Text style={styles.filterButtonText}>Filters</Text>
        {(filters.subcategory || filters.location || filters.minPrice || filters.maxPrice || filters.rating) && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
            setFilters({ ...filters, sortOrder: newSortOrder });
          }}
        >
          <Ionicons
            name={filters.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
            size={16}
            color="#6b7280"
          />
          <Text style={styles.sortButtonText}>
            {filters.sortBy === 'price' ? 'Price' : filters.sortBy === 'rating' ? 'Rating' : 'Newest'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Services</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Subcategory Filter */}
            {categorySubcategories.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Subcategory</Text>
                <View style={styles.chipContainer}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      !tempFilters.subcategory && styles.chipActive,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, subcategory: undefined })}
                  >
                    <Text style={[
                      styles.chipText,
                      !tempFilters.subcategory && styles.chipTextActive,
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {categorySubcategories.map((sub: string) => (
                    <TouchableOpacity
                      key={sub}
                      style={[
                        styles.chip,
                        tempFilters.subcategory === sub && styles.chipActive,
                      ]}
                      onPress={() => setTempFilters({ ...tempFilters, subcategory: sub })}
                    >
                      <Text style={[
                        styles.chipText,
                        tempFilters.subcategory === sub && styles.chipTextActive,
                      ]}>
                        {sub.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="City or State"
                value={tempFilters.location}
                onChangeText={(text) => setTempFilters({ ...tempFilters, location: text || undefined })}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Price Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  value={tempFilters.minPrice?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseFloat(text) : undefined;
                    setTempFilters({ ...tempFilters, minPrice: value });
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  value={tempFilters.maxPrice?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text ? parseFloat(text) : undefined;
                    setTempFilters({ ...tempFilters, maxPrice: value });
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingChipsContainer}>
                {[4, 3, 2, 1].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingChip,
                      tempFilters.rating === rating && styles.ratingChipActive,
                    ]}
                    onPress={() => {
                      setTempFilters({
                        ...tempFilters,
                        rating: tempFilters.rating === rating ? undefined : rating,
                      });
                    }}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={tempFilters.rating === rating ? '#fbbf24' : '#9ca3af'}
                    />
                    <Text style={[
                      styles.ratingChipText,
                      tempFilters.rating === rating && styles.ratingChipTextActive,
                    ]}>
                      {rating}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortOptionsContainer}>
                {[
                  { value: 'createdAt', label: 'Newest' },
                  { value: 'price', label: 'Price' },
                  { value: 'rating', label: 'Rating' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      tempFilters.sortBy === option.value && styles.sortOptionActive,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, sortBy: option.value })}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      tempFilters.sortBy === option.value && styles.sortOptionTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderListHeader = () => (
    <View>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIconContainer}>
          <Text style={styles.categoryIcon}>{categoryIcon || '📋'}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{categoryName || 'Category'}</Text>
          {categoryDescription && (
            <Text style={styles.categoryDescription}>{categoryDescription}</Text>
          )}
        </View>
      </View>

      {/* Filters and Sort */}
      {renderFilters()}

      {/* Services Count */}
      {services.length > 0 && (
        <View style={styles.servicesCountContainer}>
          <Text style={styles.servicesCount}>
            {pagination.total > 0 ? `${pagination.total} ` : ''}
            {services.length} {services.length === 1 ? 'service' : 'services'} available
          </Text>
        </View>
      )}
    </View>
  );

  const renderListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#22c55e" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      );
    }
    if (pagination.page >= pagination.totalPages && services.length > 0) {
      return (
        <View style={styles.endOfListContainer}>
          <Text style={styles.endOfListText}>No more services to load</Text>
        </View>
      );
    }
    return null;
  };

  const renderListEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setServices([]);
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchServices(false, 1, false);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyText}>No services found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your filters or check back later
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderListEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    paddingBottom: 24,
  },
  backButton: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
    position: 'relative',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  servicesCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  servicesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceItemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  serviceItemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  serviceItemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  serviceItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  emergencyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  serviceItemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  serviceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceMetaText: {
    fontSize: 11,
    color: '#6b7280',
  },
  serviceItemDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  serviceItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  serviceItemRatingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  serviceItemRatingCount: {
    fontSize: 11,
    color: '#9ca3af',
  },
  serviceItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceItemLocationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  serviceItemBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#22c55e',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  endOfListContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  chipActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  priceSeparator: {
    fontSize: 18,
    color: '#6b7280',
  },
  ratingChipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    gap: 4,
  },
  ratingChipActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  ratingChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingChipTextActive: {
    color: '#92400e',
    fontWeight: '600',
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  sortOptionActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
