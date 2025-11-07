import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  serviceArea?: string[];
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
    min: number;
    max: number;
  };
  teamSize?: number;
  equipmentProvided?: boolean;
  materialsIncluded?: boolean;
  warranty?: {
    hasWarranty: boolean;
    duration?: number;
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
    count: number;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions: string;
  selectedPackage?: string;
  selectedAddOns: string[];
  quantity?: number;
  area?: number; // for per_sqft pricing
}

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { serviceId, serviceData, action } = useLocalSearchParams<{
    serviceId: string;
    serviceData?: string;
    action?: string;
  }>();
  const { token } = useAuth();

  const [service, setService] = useState<MarketplaceService | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    selectedDate: '',
    selectedTime: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialInstructions: '',
    selectedAddOns: [],
  });

  // Parse service data if passed as route param
  useEffect(() => {
    if (serviceData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(serviceData));
        setService(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing service data:', error);
        // TODO: Fetch service by ID from API
        setLoading(false);
      }
    } else if (serviceId) {
      // TODO: Fetch service by ID from API
      setLoading(false);
    }
  }, [serviceId, serviceData]);

  // Open booking modal if action is 'book'
  useEffect(() => {
    if (action === 'book' && service && !loading) {
      setShowBookingModal(true);
    }
  }, [action, service, loading]);

  useEffect(() => {
    if (service) {
      navigation.setOptions({
        title: service.title,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        ),
      });
    }
  }, [service, navigation, router]);

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const calculateTotalPrice = () => {
    if (!service) return 0;
    
    let total = service.pricing.basePrice;
    const currency = service.pricing.currency || 'USD';

    // Add package price if selected
    if (bookingForm.selectedPackage && service.servicePackages) {
      const selectedPkg = service.servicePackages.find(
        pkg => pkg.name === bookingForm.selectedPackage
      );
      if (selectedPkg) {
        total = selectedPkg.price;
      }
    }

    // Add add-ons
    if (bookingForm.selectedAddOns.length > 0 && service.addOns) {
      service.addOns.forEach(addOn => {
        if (bookingForm.selectedAddOns.includes(addOn.name)) {
          total += addOn.price;
        }
      });
    }

    // Calculate based on pricing type
    if (service.pricing.type === 'per_sqft' && bookingForm.area) {
      total = service.pricing.basePrice * bookingForm.area;
    } else if (service.pricing.type === 'per_item' && bookingForm.quantity) {
      total = service.pricing.basePrice * bookingForm.quantity;
    }

    // Add emergency surcharge
    if (service.emergencyService?.available && service.emergencyService.surcharge) {
      total += service.emergencyService.surcharge;
    }

    return { total, currency };
  };

  const handleBookService = async () => {
    if (!service) return;

    // Validate form
    if (!bookingForm.selectedDate || !bookingForm.selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    if (!bookingForm.address || !bookingForm.city || !bookingForm.state || !bookingForm.zipCode) {
      Alert.alert('Error', 'Please provide complete address information');
      return;
    }

    setBookingLoading(true);
    try {
      // TODO: Implement booking API call
      const bookingData = {
        serviceId: service.id || service._id,
        date: bookingForm.selectedDate,
        time: bookingForm.selectedTime,
        address: {
          street: bookingForm.address,
          city: bookingForm.city,
          state: bookingForm.state,
          zipCode: bookingForm.zipCode,
        },
        specialInstructions: bookingForm.specialInstructions,
        package: bookingForm.selectedPackage,
        addOns: bookingForm.selectedAddOns,
        totalPrice: calculateTotalPrice().total,
      };

      console.log('Booking data:', bookingData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Booking Request Sent',
        'Your booking request has been sent to the service provider. You will receive a confirmation shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
          <Text style={styles.errorText}>Service not found</Text>
          <TouchableOpacity
            style={styles.backButtonError}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { total, currency } = calculateTotalPrice();
  const pricingTypeLabels: Record<string, string> = {
    hourly: '/hr',
    fixed: 'fixed',
    per_sqft: '/sq ft',
    per_item: '/item',
  };
  const pricingLabel = pricingTypeLabels[service.pricing.type] || '';

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        {service.images && service.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: service.images[selectedImageIndex].url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {service.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {service.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      selectedImageIndex === index && styles.indicatorActive,
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Service Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.title}</Text>
            {service.emergencyService?.available && (
              <View style={styles.emergencyBadge}>
                <Ionicons name="flash" size={14} color="#ef4444" />
                <Text style={styles.emergencyBadgeText}>Emergency</Text>
              </View>
            )}
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(service.pricing.basePrice, service.pricing.currency)}
              {pricingLabel && ` ${pricingLabel}`}
            </Text>
            {service.rating && service.rating.count > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>
                  {service.rating.average.toFixed(1)} ({service.rating.count})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Service Info Cards */}
        <View style={styles.infoCards}>
          {service.serviceType && (
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color="#22c55e" />
              <Text style={styles.infoCardText}>
                {service.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          )}
          {service.estimatedDuration && (
            <View style={styles.infoCard}>
              <Ionicons name="hourglass-outline" size={20} color="#22c55e" />
              <Text style={styles.infoCardText}>
                {service.estimatedDuration.min}-{service.estimatedDuration.max} hours
              </Text>
            </View>
          )}
          {service.teamSize && service.teamSize > 1 && (
            <View style={styles.infoCard}>
              <Ionicons name="people-outline" size={20} color="#22c55e" />
              <Text style={styles.infoCardText}>{service.teamSize} people</Text>
            </View>
          )}
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {service.equipmentProvided && (
            <View style={styles.badge}>
              <Ionicons name="construct-outline" size={14} color="#22c55e" />
              <Text style={styles.badgeText}>Equipment Provided</Text>
            </View>
          )}
          {service.materialsIncluded && (
            <View style={styles.badge}>
              <Ionicons name="cube-outline" size={14} color="#22c55e" />
              <Text style={styles.badgeText}>Materials Included</Text>
            </View>
          )}
          {service.warranty?.hasWarranty && (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#22c55e" />
              <Text style={styles.badgeText}>
                {service.warranty.duration ? `${service.warranty.duration} day warranty` : 'Warranty'}
              </Text>
            </View>
          )}
          {service.insurance?.covered && (
            <View style={styles.badge}>
              <Ionicons name="shield-outline" size={14} color="#22c55e" />
              <Text style={styles.badgeText}>Insured</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            {service.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Requirements */}
        {service.requirements && service.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {service.requirements.map((requirement, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
                <Text style={styles.featureText}>{requirement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Service Packages */}
        {service.servicePackages && service.servicePackages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Packages</Text>
            {service.servicePackages.map((pkg, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.packageCard,
                  bookingForm.selectedPackage === pkg.name && styles.packageCardSelected,
                ]}
                onPress={() => {
                  setBookingForm(prev => ({
                    ...prev,
                    selectedPackage: prev.selectedPackage === pkg.name ? undefined : pkg.name,
                  }));
                }}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>
                    {formatPrice(pkg.price, service.pricing.currency)}
                  </Text>
                </View>
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                {pkg.features && pkg.features.length > 0 && (
                  <View style={styles.packageFeatures}>
                    {pkg.features.map((feature, idx) => (
                      <Text key={idx} style={styles.packageFeature}>
                        • {feature}
                      </Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add-ons */}
        {service.addOns && service.addOns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add-ons</Text>
            {service.addOns.map((addOn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.addOnCard,
                  bookingForm.selectedAddOns.includes(addOn.name) && styles.addOnCardSelected,
                ]}
                onPress={() => {
                  setBookingForm(prev => ({
                    ...prev,
                    selectedAddOns: prev.selectedAddOns.includes(addOn.name)
                      ? prev.selectedAddOns.filter(name => name !== addOn.name)
                      : [...prev.selectedAddOns, addOn.name],
                  }));
                }}
              >
                <View style={styles.addOnContent}>
                  <View>
                    <Text style={styles.addOnName}>{addOn.name}</Text>
                    <Text style={styles.addOnDescription}>{addOn.description}</Text>
                  </View>
                  <View style={styles.addOnRight}>
                    <Text style={styles.addOnPrice}>
                      +{formatPrice(addOn.price, service.pricing.currency)}
                    </Text>
                    {bookingForm.selectedAddOns.includes(addOn.name) && (
                      <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Provider Info */}
        {service.provider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            <View style={styles.providerCard}>
              {service.provider.avatar?.thumbnail ? (
                <Image
                  source={{ uri: service.provider.avatar.thumbnail }}
                  style={styles.providerAvatar}
                />
              ) : (
                <View style={styles.providerAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#6b7280" />
                </View>
              )}
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>
                  {service.provider.firstName} {service.provider.lastName}
                </Text>
                <Text style={styles.providerLabel}>Service Provider</Text>
              </View>
            </View>
          </View>
        )}

        {/* Service Area */}
        {service.serviceArea && service.serviceArea.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Area</Text>
            <View style={styles.serviceAreaContainer}>
              {service.serviceArea.map((area, index) => (
                <View key={index} style={styles.serviceAreaTag}>
                  <Ionicons name="location" size={14} color="#22c55e" />
                  <Text style={styles.serviceAreaText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bookButtonContainer}>
        <View style={styles.priceSummary}>
          <Text style={styles.priceSummaryLabel}>Total:</Text>
          <Text style={styles.priceSummaryAmount}>
            {formatPrice(total, currency)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setShowBookingModal(true)}
        >
          <Text style={styles.bookButtonText}>Book Service</Text>
          <Ionicons name="calendar" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Service</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Date & Time */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Date & Time *</Text>
                <View style={styles.dateTimeRow}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="Select Date (YYYY-MM-DD)"
                    value={bookingForm.selectedDate}
                    onChangeText={(text) => setBookingForm(prev => ({ ...prev, selectedDate: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                  <TextInput
                    style={styles.timeInput}
                    placeholder="Time (HH:MM)"
                    value={bookingForm.selectedTime}
                    onChangeText={(text) => setBookingForm(prev => ({ ...prev, selectedTime: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Address */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Street Address"
                  value={bookingForm.address}
                  onChangeText={(text) => setBookingForm(prev => ({ ...prev, address: text }))}
                  placeholderTextColor="#9ca3af"
                />
                <View style={styles.addressRow}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="City"
                    value={bookingForm.city}
                    onChangeText={(text) => setBookingForm(prev => ({ ...prev, city: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="State"
                    value={bookingForm.state}
                    onChangeText={(text) => setBookingForm(prev => ({ ...prev, state: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="ZIP Code"
                  value={bookingForm.zipCode}
                  onChangeText={(text) => setBookingForm(prev => ({ ...prev, zipCode: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Quantity/Area for specific pricing types */}
              {service.pricing.type === 'per_sqft' && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Area (sq ft) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter area in square feet"
                    value={bookingForm.area?.toString() || ''}
                    onChangeText={(text) => setBookingForm(prev => ({ ...prev, area: parseFloat(text) || undefined }))}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}

              {service.pricing.type === 'per_item' && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    value={bookingForm.quantity?.toString() || ''}
                    onChangeText={(text) => setBookingForm(prev => ({ ...prev, quantity: parseInt(text) || undefined }))}
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}

              {/* Special Instructions */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Special Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any special requests or instructions..."
                  value={bookingForm.specialInstructions}
                  onChangeText={(text) => setBookingForm(prev => ({ ...prev, specialInstructions: text }))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Total Price */}
              <View style={styles.totalPriceContainer}>
                <Text style={styles.totalPriceLabel}>Total Price:</Text>
                <Text style={styles.totalPriceAmount}>
                  {formatPrice(total, currency)}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, bookingLoading && styles.submitButtonDisabled]}
                onPress={handleBookService}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Confirm Booking</Text>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonError: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: 'white',
    width: 24,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  emergencyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    lineHeight: 20,
  },
  packageCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  packageCardSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  packageDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  packageFeatures: {
    marginTop: 8,
  },
  packageFeature: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  addOnCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  addOnCardSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  addOnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addOnName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  addOnDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  addOnRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addOnPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  providerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  providerLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  serviceAreaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceAreaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  serviceAreaText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceSummary: {
    flex: 1,
  },
  priceSummaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceSummaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  bookButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    maxHeight: 500,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalPriceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

