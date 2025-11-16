import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
import { apiService, TokenExpiredError } from '../../../services/api';

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
  paymentMethod?: 'paypal' | 'paymaya';
}

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { serviceId, serviceData, action } = useLocalSearchParams<{
    serviceId: string;
    serviceData?: string;
    action?: string;
  }>();
  const { token, handleTokenExpiration } = useAuth();

  const [service, setService] = useState<MarketplaceService | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
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

  // Helper function to generate default time slots (9 AM - 5 PM, 30-minute intervals)
  const generateDefaultTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    // Add 5:00 PM
    slots.push('17:00');
    return slots;
  };

  // Helper function to generate slots from schedule (30-minute intervals)
  const generateSlotsFromSchedule = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      slots.push(
        `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      );
      
      // Increment by 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
      
      // Stop if we've passed the end time
      if (currentHour > endHour || (currentHour === endHour && currentMin > endMin)) {
        break;
      }
    }
    
    return slots;
  };

  // Fetch available time slots when date is selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!service || !bookingForm.selectedDate || !token) {
        setAvailableTimeSlots([]);
        // Clear selected time if date changes
        if (bookingForm.selectedTime) {
          setBookingForm(prev => ({ ...prev, selectedTime: '' }));
        }
        return;
      }

      setLoadingTimeSlots(true);
      try {
        const response = await apiService.getAvailableTimeSlots(
          service.id || service._id || '',
          bookingForm.selectedDate,
          token
        );

        if (response.success && response.data?.availableSlots && response.data.availableSlots.length > 0) {
          // Use API-provided slots
          setAvailableTimeSlots(response.data.availableSlots);
        } else {
          // Fallback: if API doesn't return slots, use service availability schedule
          if (service.availability?.schedule && service.availability.schedule.length > 0) {
            const selectedDate = new Date(bookingForm.selectedDate);
            const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const daySchedule = service.availability.schedule.find(
              s => s.day.toLowerCase() === dayName && s.isAvailable
            );
            
            if (daySchedule && daySchedule.startTime && daySchedule.endTime) {
              // Generate slots based on provider's schedule (30-minute intervals)
              const slots = generateSlotsFromSchedule(daySchedule.startTime, daySchedule.endTime);
              if (slots.length > 0) {
                setAvailableTimeSlots(slots);
              } else {
                // If schedule generation fails, use defaults
                setAvailableTimeSlots(generateDefaultTimeSlots());
              }
            } else {
              // No schedule for this day, use default slots
              setAvailableTimeSlots(generateDefaultTimeSlots());
            }
          } else {
            // No schedule configured, use default slots (9 AM - 5 PM with 30-minute intervals)
            setAvailableTimeSlots(generateDefaultTimeSlots());
          }
        }
      } catch (error) {
        console.error('Error fetching available time slots:', error);
        // Handle token expiration
        if (error instanceof TokenExpiredError) {
          await handleTokenExpiration();
          return;
        }
        // Fallback to default slots on error (9 AM - 5 PM with 30-minute intervals)
        setAvailableTimeSlots(generateDefaultTimeSlots());
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [bookingForm.selectedDate, service, token]);

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
    if (!service) return { total: 0, currency: 'USD' };
    
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

  // Validate booking before proceeding
  const validateBooking = async (): Promise<boolean> => {
    if (!service || !token) return false;

    setValidating(true);
    setValidationErrors([]);
    const errors: string[] = [];

    try {
      // Validate service availability
      const availabilityResponse = await apiService.checkServiceAvailability(
        service.id || service._id || '',
        bookingForm.selectedDate,
        bookingForm.selectedTime,
        token
      );

      if (!availabilityResponse.success || !availabilityResponse.data?.available) {
        errors.push('Service is not available at the selected date and time');
      }

      // Validate service area coverage
      const areaResponse = await apiService.validateServiceArea(
        service.id || service._id || '',
        {
          street: bookingForm.address,
          city: bookingForm.city,
          state: bookingForm.state,
          zipCode: bookingForm.zipCode,
        },
        token
      );

      if (!areaResponse.success || !areaResponse.data?.isCovered) {
        errors.push('Service is not available in your selected location');
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Validation error:', error);
      // Handle token expiration
      if (error instanceof TokenExpiredError) {
        await handleTokenExpiration();
        errors.push('Your session has expired. Please sign in again.');
      } else {
        errors.push('Failed to validate booking. Please try again.');
      }
      setValidationErrors(errors);
      return false;
    } finally {
      setValidating(false);
    }
  };

  // Show booking summary
  const handleShowSummary = async () => {
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

    // Validate pricing-specific fields
    if (service.pricing.type === 'per_sqft' && !bookingForm.area) {
      Alert.alert('Error', 'Please enter the area in square feet');
      return;
    }

    if (service.pricing.type === 'per_item' && !bookingForm.quantity) {
      Alert.alert('Error', 'Please enter the quantity');
      return;
    }

    // Validate booking
    const isValid = await validateBooking();
    if (!isValid) {
      Alert.alert(
        'Validation Error',
        validationErrors.join('\n') || 'Please check your booking details'
      );
      return;
    }

    // Show summary
    setShowBookingModal(false);
    setShowBookingSummary(true);
  };

  // Process booking and payment
  const handleBookService = async () => {
    if (!service || !token) {
      Alert.alert('Error', 'Please log in to book a service');
      return;
    }

    if (!bookingForm.paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setBookingLoading(true);
    try {
      const { total, currency } = calculateTotalPrice();
      
      // Create booking
      const bookingData = {
        serviceId: service.id || service._id || '',
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
        quantity: bookingForm.quantity,
        area: bookingForm.area,
        totalPrice: total,
        paymentMethod: bookingForm.paymentMethod,
      };

      const bookingResponse = await apiService.createBooking(token, bookingData);

      if (!bookingResponse.success || !bookingResponse.data) {
        throw new Error(bookingResponse.error || 'Failed to create booking');
      }

      const bookingId = bookingResponse.data.booking?._id || bookingResponse.data._id || bookingResponse.data.id;
      setCreatedBookingId(bookingId);

      // Process payment based on method
      if (bookingForm.paymentMethod === 'paypal') {
        // For PayPal, the backend should return a payment link or order ID
        // This would typically open a web view or redirect to PayPal
        const paypalOrderId = bookingResponse.data.paypalOrderId;
        if (paypalOrderId) {
          const approveResponse = await apiService.approvePayPalPayment(token, bookingId, paypalOrderId);
          if (!approveResponse.success) {
            throw new Error(approveResponse.error || 'Payment approval failed');
          }
        }
      } else if (bookingForm.paymentMethod === 'paymaya') {
        // For PayMaya, create checkout
        const checkoutResponse = await apiService.createPayMayaCheckout(token, bookingId, total, currency);
        if (!checkoutResponse.success) {
          throw new Error(checkoutResponse.error || 'Payment checkout failed');
        }
        // PayMaya would typically return a checkout URL to open in web view
      }

      // Show confirmation
      setShowBookingSummary(false);
      setShowBookingConfirmation(true);
    } catch (error) {
      console.error('Booking error:', error);
      // Handle token expiration
      if (error instanceof TokenExpiredError) {
        await handleTokenExpiration();
        return;
      }
      Alert.alert(
        'Booking Failed',
        error instanceof Error ? error.message : 'Failed to complete booking. Please try again.'
      );
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
                
                {/* 5 Days Display in Carousel */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateCarouselContent}
                  style={styles.dateCarouselContainer}
                  snapToInterval={110}
                  snapToAlignment="start"
                  decelerationRate="fast"
                >
                  {(() => {
                    const days: React.ReactElement[] = [];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    for (let i = 0; i < 5; i++) {
                      const date = new Date(today);
                      date.setDate(today.getDate() + i);
                      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                      const isSelected = bookingForm.selectedDate === dateStr;
                      const isToday = i === 0;
                      const isPast = i === 0 ? false : date < today;

                      days.push(
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.dateBlockCard,
                            isSelected && styles.dateBlockCardSelected,
                            isToday && !isSelected && styles.dateBlockCardToday,
                            isPast && styles.dateBlockCardPast,
                          ]}
                          onPress={() => {
                            if (!isPast) {
                              setBookingForm(prev => ({ ...prev, selectedDate: dateStr }));
                            }
                          }}
                          disabled={isPast}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dateBlockCardDayName,
                              isSelected && styles.dateBlockCardTextSelected,
                              isPast && styles.dateBlockCardTextPast,
                            ]}
                          >
                            {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </Text>
                          <Text
                            style={[
                              styles.dateBlockCardDayNumber,
                              isSelected && styles.dateBlockCardTextSelected,
                              isPast && styles.dateBlockCardTextPast,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                          <Text
                            style={[
                              styles.dateBlockCardMonth,
                              isSelected && styles.dateBlockCardTextSelected,
                              isPast && styles.dateBlockCardTextPast,
                            ]}
                          >
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </Text>
                        </TouchableOpacity>
                      );
                    }

                    return days;
                  })()}
                </ScrollView>

                {/* Time Label */}
                <Text style={styles.timeLabel}>Select Time</Text>

                {/* Time Slots Display - Wrapping */}
                <View style={styles.timeSlotsContainer}>
                  {loadingTimeSlots ? (
                    <View style={styles.timeSlotsLoading}>
                      <ActivityIndicator size="small" color="#22c55e" />
                      <Text style={styles.timeSlotsLoadingText}>Loading available times...</Text>
                    </View>
                  ) : availableTimeSlots.length === 0 && bookingForm.selectedDate ? (
                    <View style={styles.timeSlotsEmpty}>
                      <Ionicons name="time-outline" size={24} color="#9ca3af" />
                      <Text style={styles.timeSlotsEmptyText}>
                        No available time slots for this date
                      </Text>
                    </View>
                  ) : !bookingForm.selectedDate ? (
                    <View style={styles.timeSlotsEmpty}>
                      <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
                      <Text style={styles.timeSlotsEmptyText}>
                        Please select a date first
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.timeSlotsWrapper}>
                      {availableTimeSlots.map((timeStr) => {
                        const isSelected = bookingForm.selectedTime === timeStr;
                        return (
                          <TouchableOpacity
                            key={timeStr}
                            style={[
                              styles.timeSlotBadge,
                              isSelected && styles.timeSlotBadgeSelected,
                            ]}
                            onPress={() => {
                              setBookingForm(prev => ({ ...prev, selectedTime: timeStr }));
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.timeSlotBadgeText,
                                isSelected && styles.timeSlotBadgeTextSelected,
                              ]}
                            >
                              {(() => {
                                const [hour, minute] = timeStr.split(':');
                                const h = parseInt(hour);
                                const m = parseInt(minute);
                                const period = h >= 12 ? 'PM' : 'AM';
                                const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                                return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
                              })()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
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

              {/* Payment Method */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Payment Method *</Text>
                <View style={styles.paymentMethodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      bookingForm.paymentMethod === 'paypal' && styles.paymentMethodOptionSelected,
                    ]}
                    onPress={() => setBookingForm(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                  >
                    <Ionicons 
                      name={bookingForm.paymentMethod === 'paypal' ? 'radio-button-on' : 'radio-button-off'} 
                      size={24} 
                      color={bookingForm.paymentMethod === 'paypal' ? '#22c55e' : '#9ca3af'} 
                    />
                    <Text style={styles.paymentMethodText}>PayPal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      bookingForm.paymentMethod === 'paymaya' && styles.paymentMethodOptionSelected,
                    ]}
                    onPress={() => setBookingForm(prev => ({ ...prev, paymentMethod: 'paymaya' }))}
                  >
                    <Ionicons 
                      name={bookingForm.paymentMethod === 'paymaya' ? 'radio-button-on' : 'radio-button-off'} 
                      size={24} 
                      color={bookingForm.paymentMethod === 'paymaya' ? '#22c55e' : '#9ca3af'} 
                    />
                    <Text style={styles.paymentMethodText}>PayMaya</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total Price */}
              <View style={styles.totalPriceContainer}>
                <Text style={styles.totalPriceLabel}>Total Price:</Text>
                <Text style={styles.totalPriceAmount}>
                  {formatPrice(total, currency)}
                </Text>
              </View>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <View style={styles.validationErrorContainer}>
                  {validationErrors.map((error, index) => (
                    <Text key={index} style={styles.validationErrorText}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowBookingModal(false);
                  setValidationErrors([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (bookingLoading || validating) && styles.submitButtonDisabled]}
                onPress={handleShowSummary}
                disabled={bookingLoading || validating}
              >
                {validating ? (
                  <>
                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Validating...</Text>
                  </>
                ) : bookingLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Review Booking</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Summary Modal */}
      <Modal
        visible={showBookingSummary}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingSummary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Booking</Text>
              <TouchableOpacity onPress={() => setShowBookingSummary(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Service Info */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Service</Text>
                <Text style={styles.summaryText}>{service?.title}</Text>
                {service?.provider && (
                  <Text style={styles.summarySubtext}>
                    Provider: {service.provider.firstName} {service.provider.lastName}
                  </Text>
                )}
              </View>

              {/* Date & Time */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Date & Time</Text>
                <Text style={styles.summaryText}>
                  {(() => {
                    try {
                      const date = new Date(bookingForm.selectedDate);
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        });
                      }
                    } catch {}
                    return bookingForm.selectedDate;
                  })()}
                </Text>
                <Text style={styles.summarySubtext}>
                  {bookingForm.selectedTime
                    ? (() => {
                        try {
                          const [hour, minute] = bookingForm.selectedTime.split(':');
                          const h = parseInt(hour);
                          const m = parseInt(minute);
                          const period = h >= 12 ? 'PM' : 'AM';
                          const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                          return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
                        } catch {
                          return bookingForm.selectedTime;
                        }
                      })()
                    : 'Not selected'}
                </Text>
              </View>

              {/* Address */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Service Address</Text>
                <Text style={styles.summaryText}>{bookingForm.address}</Text>
                <Text style={styles.summarySubtext}>
                  {bookingForm.city}, {bookingForm.state} {bookingForm.zipCode}
                </Text>
              </View>

              {/* Package & Add-ons */}
              {bookingForm.selectedPackage && (
                <View style={styles.summarySection}>
                  <Text style={styles.summarySectionTitle}>Package</Text>
                  <Text style={styles.summaryText}>{bookingForm.selectedPackage}</Text>
                </View>
              )}

              {bookingForm.selectedAddOns.length > 0 && (
                <View style={styles.summarySection}>
                  <Text style={styles.summarySectionTitle}>Add-ons</Text>
                  {bookingForm.selectedAddOns.map((addOn, index) => (
                    <Text key={index} style={styles.summaryText}>• {addOn}</Text>
                  ))}
                </View>
              )}

              {/* Special Instructions */}
              {bookingForm.specialInstructions && (
                <View style={styles.summarySection}>
                  <Text style={styles.summarySectionTitle}>Special Instructions</Text>
                  <Text style={styles.summaryText}>{bookingForm.specialInstructions}</Text>
                </View>
              )}

              {/* Payment Method */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Payment Method</Text>
                <Text style={styles.summaryText}>
                  {bookingForm.paymentMethod === 'paypal' ? 'PayPal' : 'PayMaya'}
                </Text>
              </View>

              {/* Total Price */}
              <View style={styles.summaryTotalContainer}>
                <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
                <Text style={styles.summaryTotalAmount}>
                  {formatPrice(total, currency)}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowBookingSummary(false);
                  setShowBookingModal(true);
                }}
              >
                <Text style={styles.cancelButtonText}>Back</Text>
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
                    <Text style={styles.submitButtonText}>Confirm & Pay</Text>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showBookingConfirmation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowBookingConfirmation(false);
          router.back();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.confirmationContainer}>
              <View style={styles.confirmationIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
              </View>
              <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
              <Text style={styles.confirmationMessage}>
                Your booking has been successfully created and payment has been processed.
                You will receive a confirmation email shortly.
              </Text>
              {createdBookingId && (
                <Text style={styles.confirmationBookingId}>
                  Booking ID: {createdBookingId}
                </Text>
              )}
              <TouchableOpacity
                style={styles.confirmationButton}
                onPress={() => {
                  setShowBookingConfirmation(false);
                  router.back();
                }}
              >
                <Text style={styles.confirmationButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal - Carousel Grid */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateCarouselContainer}
                snapToInterval={100}
                decelerationRate="fast"
                snapToAlignment="start"
                pagingEnabled={false}
                bounces={true}
              >
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dates: Date[] = [];
                  
                  // Generate dates starting from today, showing at least 7 days
                  // But we'll show more days in the carousel for better UX
                  for (let i = 0; i < 30; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() + i);
                    dates.push(date);
                  }

                  return dates.map((date, index) => {
                    date.setHours(0, 0, 0, 0);
                    const isToday = index === 0;
                    const isPast = index > 0 ? false : date.getTime() < today.getTime();

                    let isSelected = false;
                    if (bookingForm.selectedDate) {
                      try {
                        const selectedDate = new Date(bookingForm.selectedDate);
                        selectedDate.setHours(0, 0, 0, 0);
                        isSelected = date.getTime() === selectedDate.getTime();
                      } catch {
                        isSelected = false;
                      }
                    }

                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                    return (
                      <TouchableOpacity
                        key={`date-${index}-${date.getTime()}`}
                        style={[
                          styles.dateBlock,
                          isSelected && styles.dateBlockSelected,
                          isToday && !isSelected && styles.dateBlockToday,
                          isPast && styles.dateBlockPast,
                        ]}
                        onPress={() => {
                          if (!isPast) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const selectedDateStr = `${year}-${month}-${day}`;
                            setBookingForm(prev => ({ ...prev, selectedDate: selectedDateStr }));
                            setShowDatePicker(false);
                          }
                        }}
                        disabled={isPast}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dateBlockDayName,
                            isSelected && styles.dateBlockTextSelected,
                            isPast && styles.dateBlockTextPast,
                            isToday && !isSelected && styles.dateBlockTextToday,
                          ]}
                        >
                          {isToday ? 'Today' : dayName}
                        </Text>
                        <Text
                          style={[
                            styles.dateBlockDayNumber,
                            isSelected && styles.dateBlockTextSelected,
                            isPast && styles.dateBlockTextPast,
                            isToday && !isSelected && styles.dateBlockTextToday,
                          ]}
                        >
                          {dayNumber}
                        </Text>
                        <Text
                          style={[
                            styles.dateBlockMonth,
                            isSelected && styles.dateBlockTextSelected,
                            isPast && styles.dateBlockTextPast,
                            isToday && !isSelected && styles.dateBlockTextToday,
                          ]}
                        >
                          {monthName}
                        </Text>
                      </TouchableOpacity>
                    );
                  });
                })()}
              </ScrollView>
            </View>
            <View style={styles.pickerFooter}>
              <TouchableOpacity
                style={styles.pickerCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.pickerCancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal - Tag Based */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerContainer}>
              <ScrollView style={styles.timeTagsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.timeTagsContainer}>
                  {(() => {
                    const timeSlots: string[] = [];
                    // Generate time slots from 6:00 AM to 10:00 PM with 15-minute intervals
                    for (let hour = 6; hour < 22; hour++) {
                      for (let minute = 0; minute < 60; minute += 15) {
                        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        timeSlots.push(timeStr);
                      }
                    }
                    // Add 10:00 PM
                    timeSlots.push('22:00');

                    return timeSlots.map((timeStr) => {
                      const isSelected = bookingForm.selectedTime === timeStr;
                      return (
                        <TouchableOpacity
                          key={timeStr}
                          style={[styles.timeTag, isSelected && styles.timeTagSelected]}
                          onPress={() => {
                            setBookingForm(prev => ({ ...prev, selectedTime: timeStr }));
                            setShowTimePicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.timeTagText,
                              isSelected && styles.timeTagTextSelected,
                            ]}
                          >
                            {(() => {
                              const [hour, minute] = timeStr.split(':');
                              const h = parseInt(hour);
                              const m = parseInt(minute);
                              const period = h >= 12 ? 'PM' : 'AM';
                              const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                              return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
                            })()}
                          </Text>
                        </TouchableOpacity>
                      );
                    });
                  })()}
                </View>
              </ScrollView>
            </View>
            <View style={styles.pickerFooter}>
              <TouchableOpacity
                style={styles.pickerCancelButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerCancelButtonText}>Close</Text>
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
  dateBlockRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    marginTop: 4,
  },
  dateCarouselContainer: {
    marginTop: 8,
  },
  dateCarouselContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  dateBlockCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateBlockCardSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dateBlockCardToday: {
    borderColor: '#22c55e',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  dateBlockCardPast: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    opacity: 0.5,
  },
  dateBlockCardDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateBlockCardDayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  dateBlockCardMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  dateBlockCardTextSelected: {
    color: '#ffffff',
  },
  dateBlockCardTextPast: {
    color: '#d1d5db',
  },
  timeSlotsContainer: {
    marginTop: 4,
    minHeight: 60,
  },
  timeSlotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  timeSlotsLoadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeSlotsEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  timeSlotsEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  timeSlotBadge: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotBadgeSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSlotBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeSlotBadgeTextSelected: {
    color: 'white',
    fontWeight: '700',
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
  paymentMethodContainer: {
    gap: 12,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
    gap: 12,
  },
  paymentMethodOptionSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  validationErrorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  validationErrorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
  },
  summarySection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summarySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryTotalContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryTotalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
  },
  confirmationContainer: {
    alignItems: 'center',
    padding: 32,
  },
  confirmationIconContainer: {
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmationBookingId: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 32,
    fontFamily: 'monospace',
  },
  confirmationButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  pickerButtonTextPlaceholder: {
    color: '#9ca3af',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  pickerFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pickerCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  pickerCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  pickerConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  pickerConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  datePickerContainer: {
    paddingVertical: 16,
    minHeight: 140,
    maxHeight: 160,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#22c55e',
  },
  calendarDayToday: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  calendarDayTextPast: {
    color: '#d1d5db',
  },
  calendarDayTextToday: {
    color: '#22c55e',
    fontWeight: '700',
  },
  dateBlock: {
    width: 85,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginRight: 10,
    minHeight: 115,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateBlockSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
    borderWidth: 2,
    shadowColor: '#22c55e',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  dateBlockToday: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  dateBlockPast: {
    opacity: 0.4,
    backgroundColor: '#f9fafb',
  },
  dateBlockDayName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dateBlockDayNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 36,
  },
  dateBlockMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateBlockTextSelected: {
    color: 'white',
  },
  dateBlockTextPast: {
    color: '#d1d5db',
  },
  dateBlockTextToday: {
    color: '#22c55e',
  },
  timePickerContainer: {
    padding: 20,
    maxHeight: 500,
  },
  timeTagsScroll: {
    flex: 1,
  },
  timeTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeTag: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
    alignItems: 'center',
  },
  timeTagSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  timeTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeTagTextSelected: {
    color: 'white',
  },
});

