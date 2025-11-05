import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  subcategory?: string;
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: {
      url: string;
      thumbnail: string;
    };
  };
  images?: Array<{
    url: string;
    thumbnail: string;
  }>;
  rating?: {
    average: number;
    totalRatings: number;
  };
  location?: {
    city: string;
    state: string;
  };
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

  // Update header title with category name
  useEffect(() => {
    if (categoryName) {
      navigation.setOptions({
        title: categoryName,
      });
    }
  }, [categoryName, navigation]);

  const fetchServices = async (isRefresh = false, page = pagination.page) => {
    if (!categoryKey) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
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
        setServices(servicesData);
        
        // Update pagination from response
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || pagination.limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
          });
        }
      } else {
        setError(response.error || 'Failed to fetch services');
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching marketplace services:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices(false, 1); // Reset to page 1 when filters change
  }, [categoryKey, token, filters]);

  const onRefresh = () => {
    fetchServices(true, pagination.page);
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

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchServices(false, newPage);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const renderServiceCard = (service: MarketplaceService) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => {
        // Navigate to service detail screen when implemented
        console.log('Navigate to service:', service.id);
      }}
    >
      {service.images && service.images.length > 0 ? (
        <Image
          source={{ uri: service.images[0].url }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.serviceImagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#9ca3af" />
        </View>
      )}
      <View style={styles.serviceCardContent}>
        <Text style={styles.serviceCardTitle} numberOfLines={2}>
          {service.title}
        </Text>
        <Text style={styles.serviceCardDescription} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={styles.serviceCardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.servicePrice}>
              {formatPrice(service.price, service.currency)}
            </Text>
            {service.rating && service.rating.totalRatings > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>
                  {service.rating.average.toFixed(1)} ({service.rating.totalRatings})
                </Text>
              </View>
            )}
          </View>
          {service.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.locationText}>
                {service.location.city}, {service.location.state}
              </Text>
            </View>
          )}
        </View>
        {service.provider && (
          <View style={styles.providerContainer}>
            {service.provider.avatar?.thumbnail ? (
              <Image
                source={{ uri: service.provider.avatar.thumbnail }}
                style={styles.providerAvatar}
              />
            ) : (
              <View style={styles.providerAvatarPlaceholder}>
                <Ionicons name="person" size={16} color="#6b7280" />
              </View>
            )}
            <Text style={styles.providerName}>
              {service.provider.firstName} {service.provider.lastName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
              <View style={styles.ratingContainer}>
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

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, pagination.page === 1 && styles.paginationButtonDisabled]}
          onPress={() => changePage(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          <Ionicons name="chevron-back" size={20} color={pagination.page === 1 ? '#9ca3af' : '#1f2937'} />
          <Text style={[styles.paginationButtonText, pagination.page === 1 && styles.paginationButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Page {pagination.page} of {pagination.totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, pagination.page === pagination.totalPages && styles.paginationButtonDisabled]}
          onPress={() => changePage(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          <Text style={[styles.paginationButtonText, pagination.page === pagination.totalPages && styles.paginationButtonTextDisabled]}>
            Next
          </Text>
          <Ionicons name="chevron-forward" size={20} color={pagination.page === pagination.totalPages ? '#9ca3af' : '#1f2937'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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

        {/* Services List */}
        <View style={styles.servicesContainer}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : error && services.length === 0 ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchServices()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.servicesCount}>
                {pagination.total > 0 ? `${pagination.total} ` : ''}
                {services.length} {services.length === 1 ? 'service' : 'services'} available
              </Text>
              {services.map(renderServiceCard)}
              {renderPagination()}
            </>
          )}
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
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
  servicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  servicesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCardContent: {
    padding: 16,
  },
  serviceCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  serviceCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceCardFooter: {
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  providerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  providerName: {
    fontSize: 14,
    color: '#6b7280',
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
  ratingContainer: {
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1f2937',
  },
  paginationButtonTextDisabled: {
    color: '#9ca3af',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
