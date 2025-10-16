import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { API_CONFIG, ApiUtils, buildApiUrl, getApiHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface Booking {
  id: string;
  serviceName: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress' | 'pending' | 'confirmed';
  provider: {
    id: string;
    name: string;
    rating: number;
    avatar?: string;
  };
  location: string;
  price: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  serviceId?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  services: string[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  provider: {
    id: string;
    name: string;
    rating: number;
    avatar?: string;
  };
  location: string;
  images?: string[];
  isAvailable: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BookingScreen() {
  const { user, token, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  
  // API data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const fetchBookings = async (page: number = 1, limit: number = 20) => {
    try {
      const url = ApiUtils.buildUrlWithParams(
        buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.GET_ALL),
        ApiUtils.paginationParams(page, limit)
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(token || undefined),
      });
      
      const data: ApiResponse<{ bookings: Booking[]; pagination: any }> = await response.json();
      
      if (data.success && data.data) {
        if (page === 1) {
          setBookings(data.data.bookings || []);
        } else {
          setBookings(prev => [...prev, ...(data.data?.bookings || [])]);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.SERVICES.ALL),
        {
          method: 'GET',
          headers: getApiHeaders(token || undefined),
        }
      );
      
      const data: ApiResponse<{ services: Service[] }> = await response.json();
      
      if (data.success && data.data) {
        setServices(data.data.services || []);
      } else {
        throw new Error(data.error || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    }
  };

  const loadBookingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchBookings(),
        fetchServices(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookingData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (token) {
      loadBookingData();
    }
  }, [token]);

  const serviceCategories: ServiceCategory[] = [
    {
      id: '1',
      name: 'Plumbing',
      icon: 'water',
      color: '#3b82f6',
      services: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater']
    },
    {
      id: '2',
      name: 'Electrical',
      icon: 'flash',
      color: '#f59e0b',
      services: ['Wiring', 'Outlet Installation', 'Circuit Breaker', 'Light Fixtures']
    },
    {
      id: '3',
      name: 'HVAC',
      icon: 'thermometer',
      color: '#10b981',
      services: ['AC Repair', 'Heating', 'Duct Cleaning', 'Thermostat']
    },
    {
      id: '4',
      name: 'Handyman',
      icon: 'construct',
      color: '#8b5cf6',
      services: ['General Repair', 'Assembly', 'Painting', 'Carpentry']
    }
  ];

  const upcomingBookings = bookings.filter(booking => booking.status === 'upcoming');
  const pastBookings = bookings.filter(booking => booking.status === 'completed' || booking.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'in-progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return 'time-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'in-progress': return 'play-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.CREATE),
        {
          method: 'POST',
          headers: getApiHeaders(token || undefined),
          body: JSON.stringify({
            serviceName: selectedService,
            date: selectedDate,
            time: selectedTime,
            notes: notes,
            status: 'pending',
          }),
        }
      );
      
      const data: ApiResponse<Booking> = await response.json();
      
      if (data.success && data.data) {
        Alert.alert('Success', 'Booking created successfully!');
        setShowNewBooking(false);
        setSelectedService('');
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
        // Refresh bookings data
        await loadBookingData();
      } else {
        throw new Error(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await fetch(
                buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.UPDATE_STATUS(bookingId)),
                {
                  method: 'PUT',
                  headers: getApiHeaders(token || undefined),
                  body: JSON.stringify({
                    status: 'cancelled',
                  }),
                }
              );
              
              const data: ApiResponse<Booking> = await response.json();
              
              if (data.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                // Refresh bookings data
                await loadBookingData();
              } else {
                throw new Error(data.error || 'Failed to cancel booking');
              }
            } catch (err) {
              console.error('Error cancelling booking:', err);
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel booking');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRescheduleBooking = async (bookingId: string, newDate: string, newTime: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.UPDATE_STATUS(bookingId)),
        {
          method: 'PUT',
          headers: getApiHeaders(token || undefined),
          body: JSON.stringify({
            date: newDate,
            time: newTime,
            status: 'pending',
          }),
        }
      );
      
      const data: ApiResponse<Booking> = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Booking rescheduled successfully');
        // Refresh bookings data
        await loadBookingData();
      } else {
        throw new Error(data.error || 'Failed to reschedule booking');
      }
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reschedule booking');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('-', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.date} at {item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.duration} minutes</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.provider.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        {item.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        {item.status === 'upcoming' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                // For now, show a simple alert. In a real app, you'd show a date/time picker
                Alert.prompt(
                  'Reschedule Booking',
                  'Enter new date (YYYY-MM-DD):',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'OK', 
                      onPress: (newDate: string | undefined) => {
                        if (newDate) {
                          Alert.prompt(
                            'Reschedule Booking',
                            'Enter new time (HH:MM AM/PM):',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'OK', 
                                onPress: (newTime: string | undefined) => {
                                  if (newTime) {
                                    handleRescheduleBooking(item.id, newDate, newTime);
                                  }
                                }
                              }
                            ]
                          );
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderServiceCategory = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity 
      style={styles.serviceCategory}
      onPress={() => {
        setSelectedService(item.name);
        setShowNewBooking(true);
      }}
    >
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.serviceCategoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (isLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bookings</Text>
          <TouchableOpacity 
            style={styles.newBookingButton}
            onPress={() => setShowNewBooking(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.newBookingButtonText}>New Booking</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadBookingData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book a Service</Text>
          <FlatList
            data={serviceCategories}
            renderItem={renderServiceCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceCategoriesList}
          />
        </View>

        {/* Booking Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming ({upcomingBookings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Past ({pastBookings.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bookings List */}
        <View style={styles.bookingsContainer}>
          {activeTab === 'upcoming' ? (
            upcomingBookings.length > 0 ? (
              <FlatList
                data={upcomingBookings}
                renderItem={renderBookingCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No Upcoming Bookings</Text>
                <Text style={styles.emptyStateText}>Book a service to get started</Text>
              </View>
            )
          ) : (
            pastBookings.length > 0 ? (
              <FlatList
                data={pastBookings}
                renderItem={renderBookingCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No Past Bookings</Text>
                <Text style={styles.emptyStateText}>Your completed bookings will appear here</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* New Booking Modal */}
      <Modal
        visible={showNewBooking}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewBooking(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book a Service</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Type</Text>
              <TextInput
                style={styles.input}
                value={selectedService}
                onChangeText={setSelectedService}
                placeholder="Select service type"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={selectedTime}
                onChangeText={setSelectedTime}
                placeholder="HH:MM AM/PM"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requirements or notes"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setShowNewBooking(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateBooking}>
                <Text style={styles.modalConfirmText}>Book Service</Text>
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  newBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBookingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  serviceCategoriesList: {
    paddingRight: 20,
  },
  serviceCategory: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 80,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceCategoryName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  bookingsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  cancelButton: {
    backgroundColor: '#fecaca',
  },
  cancelButtonText: {
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 8,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc2626',
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
