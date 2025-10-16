import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

interface Booking {
  id: string;
  serviceName: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  provider: {
    name: string;
    rating: number;
    avatar?: string;
  };
  location: string;
  price: number;
  notes?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  services: string[];
}

export default function BookingScreen() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Mock booking data
  const bookings: Booking[] = [
    {
      id: '1',
      serviceName: 'Plumbing Repair',
      serviceType: 'Emergency',
      date: '2024-01-20',
      time: '10:00 AM',
      duration: 120,
      status: 'upcoming',
      provider: {
        name: 'John Smith',
        rating: 4.8,
        avatar: undefined
      },
      location: '123 Main St, City',
      price: 150.00,
      notes: 'Kitchen sink is leaking'
    },
    {
      id: '2',
      serviceName: 'Electrical Installation',
      serviceType: 'Installation',
      date: '2024-01-18',
      time: '2:00 PM',
      duration: 180,
      status: 'completed',
      provider: {
        name: 'Mike Johnson',
        rating: 4.9,
        avatar: undefined
      },
      location: '456 Oak Ave, City',
      price: 300.00
    },
    {
      id: '3',
      serviceName: 'HVAC Maintenance',
      serviceType: 'Maintenance',
      date: '2024-01-15',
      time: '9:00 AM',
      duration: 90,
      status: 'completed',
      provider: {
        name: 'Sarah Wilson',
        rating: 4.7,
        avatar: undefined
      },
      location: '789 Pine St, City',
      price: 120.00
    }
  ];

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

  const handleCreateBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    // In a real app, this would call the booking API
    Alert.alert('Success', 'Booking created successfully!');
    setShowNewBooking(false);
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
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
          onPress: () => {
            // In a real app, this would call the cancel API
            Alert.alert('Success', 'Booking cancelled successfully');
          }
        }
      ]
    );
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
              onPress={() => Alert.alert('Reschedule', 'Reschedule functionality coming soon')}
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

  if (isLoading) {
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
});
