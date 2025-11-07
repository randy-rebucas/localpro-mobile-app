import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';

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
  images?: Array<{
    url: string;
    publicId?: string;
    thumbnail: string;
    alt?: string;
  }>;
  rating?: {
    average: number;
    count: number;
  };
  [key: string]: any;
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

interface ServiceFilters {
  subcategory?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Map emoji icons to Ionicons
const emojiToIonicon = (emoji: string): keyof typeof Ionicons.glyphMap => {
  const emojiMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    '🧹': 'sparkles', // Cleaning
    '🔧': 'construct', // Handyman/Repair
    '⚡': 'flash', // Electrical
    '📦': 'cube', // Moving/Delivery
    '🌳': 'leaf', // Landscaping
    '🎨': 'brush', // Painting
    '🪵': 'build', // Carpentry
    '🏠': 'home', // Home Services
    '🏡': 'home', // Home Services
    '❄️': 'snow', // HVAC/Cooling
    '🔌': 'flash', // Electrical
    '🔐': 'lock-closed', // Security
    '🔨': 'hammer', // Construction
    '🚨': 'shield', // Security/Emergency
    '🏊': 'water', // Pool Services
    '🐛': 'bug', // Pest Control
    '🧼': 'sparkles', // Cleaning
    '🪟': 'home-outline', // Windows
    '🌧️': 'rainy', // Roofing/Waterproofing
    '💦': 'water', // Plumbing
    '📋': 'document-text', // General Services
    '🚗': 'car', // Auto Services
    '🌿': 'leaf', // Gardening
    '🔩': 'construct', // Mechanical
    '🛠️': 'construct', // Tools/Repair
    '🏗️': 'business', // Construction
    '🧱': 'cube', // Masonry
    '🪚': 'build', // Carpentry
    '🔲': 'square', // Flooring
    '💡': 'bulb', // Lighting
  };
  return emojiMap[emoji] || 'build';
};

export default function MarketplaceScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
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
    page: 1,
    limit: 10,
  });
  const [tempFilters, setTempFilters] = useState<ServiceFilters>(filters);

  // Check location permission on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
    };
    checkLocationPermission();
  }, []);

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
          
          // Auto-select first category if available
          if (categoriesData.length > 0 && !selectedCategory) {
            setSelectedCategory(categoriesData[0].key);
          }
        } else {
          setError(response.error || 'Failed to fetch categories');
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching marketplace categories:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (selectedCategory) {
      // Reset to page 1 when category changes
      setServices([]);
      setPagination(prev => ({ ...prev, page: 1 }));
      setFilters(prev => ({ ...prev, page: 1 }));
      fetchServicesForCategory(selectedCategory, false, 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, token]);

  useEffect(() => {
    if (selectedCategory) {
      // Reset to page 1 when filters change
      setServices([]);
      setPagination(prev => ({ ...prev, page: 1 }));
      const currentPage = 1;
      fetchServicesForCategory(selectedCategory, false, currentPage, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, filters.subcategory, filters.location, filters.minPrice, filters.maxPrice, filters.rating, filters.sortBy, filters.sortOrder]);

  // Sync tempFilters with filters when modal opens
  useEffect(() => {
    if (showFilters) {
      setTempFilters(filters);
    }
  }, [showFilters, filters]);


  const fetchServicesForCategory = async (
    categoryKey: string,
    isRefresh = false,
    page = 1,
    append = false
  ) => {
    try {
      if (isRefresh) {
        setLoadingServices(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoadingServices(true);
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
          limit: filters.limit || 10,
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
          setServices(prev => [...prev, ...servicesData]);
        } else {
          setServices(servicesData);
        }
        
        // Update pagination from response
        const paginationData = Array.isArray(response.data)
          ? undefined
          : response.data.pagination;
        if (paginationData) {
          setPagination({
            page: paginationData.page || page,
            limit: paginationData.limit || (filters.limit || 10),
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
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (!append) {
        setServices([]);
      }
    } finally {
      setLoadingServices(false);
      setLoadingMore(false);
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setIsGettingLocation(true);
      
      // Check if permission is granted
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Request permission
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(newStatus);
        
        if (newStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Please enable location permissions in your device settings to find nearby providers.',
            [{ text: 'OK' }]
          );
          setIsGettingLocation(false);
          return;
        }
        status = newStatus;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setCurrentLocation(coords);
      
      // Set location filter with coordinates
      const locationString = `${coords.latitude},${coords.longitude}`;
      setFilters(prev => ({ ...prev, location: locationString }));
      
      setIsGettingLocation(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.',
        [{ text: 'OK' }]
      );
      setIsGettingLocation(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && !loadingServices && selectedCategory && pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      fetchServicesForCategory(selectedCategory, false, nextPage, true);
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
      page: 1,
      limit: 10,
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setShowFilters(false);
  };

  const renderFilterModal = () => {
    const selectedCategoryData = categories.find((c) => c.key === selectedCategory);
    const categorySubcategories = selectedCategoryData?.subcategories || [];

    return (
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

  const renderCategoryItem = ({ item, index }: { item: ServiceCategory; index: number }) => {
    const emojiIcon = item.icon || '📋';
    const ioniconName = emojiToIonicon(emojiIcon);
    const isSelected = selectedCategory === item.key;

    return (
      <TouchableOpacity
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onPress={() => setSelectedCategory(item.key)}
      >
        <View style={[styles.categoryIconContainer, isSelected && styles.categoryIconContainerSelected]}>
          <Ionicons name={ioniconName} size={28} color={isSelected ? '#fff' : '#22c55e'} />
        </View>
        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]} numberOfLines={1}>
          {item.name || 'Category'}
        </Text>
        {item.statistics?.totalServices !== undefined && item.statistics.totalServices > 0 && (
          <Text style={styles.categoryCount}>{item.statistics.totalServices} services</Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleViewDetails = (item: MarketplaceService) => {
    const serviceId = item.id || item._id || '';
    const serviceData = encodeURIComponent(JSON.stringify(item));
    router.push({
      pathname: '/(stack)/marketplace/service-details',
      params: {
        serviceId: serviceId,
        serviceData: serviceData,
      },
    });
  };

  const handleBookNow = (item: MarketplaceService) => {
    const serviceId = item.id || item._id || '';
    const serviceData = encodeURIComponent(JSON.stringify(item));
    router.push({
      pathname: '/(stack)/marketplace/service-details',
      params: {
        serviceId: serviceId,
        serviceData: serviceData,
        action: 'book',
      },
    });
  };

  const renderServiceItem = ({ item }: { item: MarketplaceService }) => {
    const serviceId = item.id || item._id || '';
    const hasRating = item.rating && item.rating.count > 0;

    if (displayMode === 'list') {
      return (
        <View style={styles.serviceListItem}>
          <TouchableOpacity
            style={styles.serviceListItemTouchable}
            onPress={() => handleViewDetails(item)}
            activeOpacity={0.7}
          >
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0].thumbnail || item.images[0].url }}
                style={styles.serviceListItemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.serviceListItemImagePlaceholder}>
                <Ionicons name="image-outline" size={24} color="#9ca3af" />
              </View>
            )}
            <View style={styles.serviceListItemContent}>
              <Text style={styles.serviceListItemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.serviceListItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.serviceListItemFooter}>
                <Text style={styles.serviceListItemPrice}>{formatPrice(item)}</Text>
                {hasRating && (
                  <View style={styles.serviceCardRating}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.serviceCardRatingText}>
                      {item.rating!.average.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.serviceItemActions}>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleViewDetails(item)}
            >
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => handleBookNow(item)}
            >
              <Text style={styles.bookNowButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.serviceCard}>
        <TouchableOpacity
          style={styles.serviceCardTouchable}
          onPress={() => handleViewDetails(item)}
          activeOpacity={0.7}
        >
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0].thumbnail || item.images[0].url }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.serviceImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
          <View style={styles.serviceCardContent}>
            <Text style={styles.serviceCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.serviceCardDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.serviceCardFooter}>
              <Text style={styles.serviceCardPrice}>{formatPrice(item)}</Text>
              {hasRating && (
                <View style={styles.serviceCardRating}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.serviceCardRatingText}>
                    {item.rating!.average.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={displayMode === 'grid' ? styles.serviceItemActionsGrid : styles.serviceItemActions}>
          <TouchableOpacity
            style={displayMode === 'grid' ? styles.viewDetailsButtonGrid : styles.viewDetailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={displayMode === 'grid' ? styles.viewDetailsButtonTextGrid : styles.viewDetailsButtonText}>
              View Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={displayMode === 'grid' ? styles.bookNowButtonGrid : styles.bookNowButton}
            onPress={() => handleBookNow(item)}
          >
            <Text style={displayMode === 'grid' ? styles.bookNowButtonTextGrid : styles.bookNowButtonText}>
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Marketplace</Text>
              <Text style={styles.subtitle}>Find and book services near you</Text>
            </View>
            <TouchableOpacity
              style={[styles.useLocationButton, currentLocation && styles.useLocationButtonActive]}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#22c55e" />
              ) : (
                <Ionicons 
                  name={currentLocation ? "locate" : "locate-outline"} 
                  size={22} 
                  color={currentLocation ? "#fff" : "#22c55e"} 
                />
              )}
            </TouchableOpacity>
          </View>
          {currentLocation && (
            <View style={styles.locationStatusContainer}>
              <Text style={styles.locationStatusText}>
                Using your current location
              </Text>
              <TouchableOpacity
                style={styles.clearLocationButton}
                onPress={() => {
                  setFilters(prev => ({ ...prev, location: undefined }));
                  setCurrentLocation(null);
                }}
              >
                <Ionicons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Categories Carousel */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Categories</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#22c55e" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              scrollEnabled={true}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || 'No categories available'}</Text>
            </View>
          )}
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesHeader}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              {selectedCategory
                ? categories.find((c) => c.key === selectedCategory)?.name || 'Services'
                : 'Select a category'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity
                onPress={() => {
                  const category = categories.find((c) => c.key === selectedCategory);
                  if (category) {
                    router.push({
                      pathname: '/(stack)/marketplace/category',
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
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Filter and Sort Controls */}
          {selectedCategory && (
            <View style={styles.filterSortContainer}>
              <View style={styles.filterSortLeft}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilters(true)}
                >
                  <Ionicons name="filter" size={18} color="#22c55e" />
                  {(filters.subcategory || filters.location || filters.minPrice || filters.maxPrice || filters.rating) && (
                    <View style={styles.filterBadge} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => {
                    const newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
                    setFilters({ ...filters, sortOrder: newSortOrder });
                  }}
                >
                  <Ionicons
                    name={filters.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                    size={14}
                    color="#6b7280"
                  />
                  <Text style={styles.sortButtonText}>
                    {filters.sortBy === 'price' ? 'Price' : filters.sortBy === 'rating' ? 'Rating' : 'Newest'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.displayModeButton}
                onPress={() => setDisplayMode(displayMode === 'grid' ? 'list' : 'grid')}
              >
                <Ionicons 
                  name={displayMode === 'grid' ? 'grid' : 'list'} 
                  size={18} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          )}


          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading services...</Text>
            </View>
          ) : services.length > 0 ? (
            <>
              <View style={displayMode === 'grid' ? styles.servicesGrid : styles.servicesList}>
                {services.map((item) => (
                  <View 
                    key={item.id || item._id || Math.random().toString()} 
                    style={displayMode === 'grid' ? styles.serviceCardWrapper : styles.serviceListItemWrapper}
                  >
                    {renderServiceItem({ item })}
                  </View>
                ))}
              </View>
              {pagination.page < pagination.totalPages && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#22c55e" />
                  ) : (
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : selectedCategory ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="grid-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>
                Try selecting a different category
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="apps-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Select a category to view services</Text>
            </View>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  locationStatusText: {
    flex: 1,
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
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
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  categoryCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryNameSelected: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  servicesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSortLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayModeButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  clearLocationButton: {
    padding: 4,
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  servicesList: {
    flexDirection: 'column',
  },
  serviceCardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  serviceListItemWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  serviceCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardTouchable: {
    width: '100%',
  },
  serviceImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCardContent: {
    padding: 12,
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceCardDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  serviceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceCardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  serviceCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  serviceCardRatingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  // List View Styles
  serviceListItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceListItemTouchable: {
    flexDirection: 'row',
    width: '100%',
  },
  serviceListItemImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e5e7eb',
  },
  serviceListItemImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceListItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  serviceListItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceListItemDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceListItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceListItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  serviceItemActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  serviceItemActionsGrid: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsButtonGrid: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewDetailsButtonTextGrid: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  bookNowButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowButtonGrid: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  bookNowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bookNowButtonTextGrid: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
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
    marginHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  servicesHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22c55e',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
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
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  useLocationButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  useLocationButtonActive: {
    backgroundColor: '#22c55e',
  },
  locationHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
