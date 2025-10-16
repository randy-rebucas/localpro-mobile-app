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

interface Appointment {
  id: string;
  title: string;
  type: 'service' | 'meeting' | 'maintenance' | 'inspection';
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'confirmed';
  client: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
  location: string;
  notes?: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
  serviceId?: string;
  providerId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
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

export default function ScheduleScreen() {
  const { user, token, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    type: 'service' as const,
    time: '',
    duration: 60,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    location: '',
    notes: ''
  });
  
  // API data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const fetchAppointments = async (page: number = 1, limit: number = 50) => {
    try {
      const url = ApiUtils.buildUrlWithParams(
        buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.GET_ALL),
        {
          ...ApiUtils.paginationParams(page, limit),
          // Add date filter for schedule view
          date: selectedDate.toISOString().split('T')[0],
        }
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(token || undefined),
      });
      
      const data: ApiResponse<{ bookings: Appointment[]; pagination: any }> = await response.json();
      
      if (data.success && data.data) {
        if (page === 1) {
          setAppointments(data.data.bookings || []);
        } else {
          setAppointments(prev => [...prev, ...(data.data?.bookings || [])]);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    }
  };

  const loadScheduleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchAppointments();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduleData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (token) {
      loadScheduleData();
    }
  }, [token, selectedDate]);

  // Generate time slots for the day
  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const appointmentsForDate = appointments.filter(apt => apt.date === date);
    
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointment = appointmentsForDate.find(apt => apt.time === time);
        
        slots.push({
          time,
          available: !appointment,
          appointment
        });
      }
    }
    
    return slots;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return 'construct';
      case 'meeting': return 'people';
      case 'maintenance': return 'settings';
      case 'inspection': return 'search';
      default: return 'calendar';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleCreateAppointment = async () => {
    if (!appointmentForm.title || !appointmentForm.time || !appointmentForm.clientName) {
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
            title: appointmentForm.title,
            type: appointmentForm.type,
            date: selectedDate.toISOString().split('T')[0],
            time: appointmentForm.time,
            duration: appointmentForm.duration,
            clientName: appointmentForm.clientName,
            clientPhone: appointmentForm.clientPhone,
            clientEmail: appointmentForm.clientEmail,
            location: appointmentForm.location,
            notes: appointmentForm.notes,
            status: 'scheduled',
          }),
        }
      );
      
      const data: ApiResponse<Appointment> = await response.json();
      
      if (data.success && data.data) {
        Alert.alert('Success', 'Appointment created successfully!');
        setShowNewAppointment(false);
        setAppointmentForm({
          title: '',
          type: 'service',
          time: '',
          duration: 60,
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          location: '',
          notes: ''
        });
        // Refresh schedule data
        await loadScheduleData();
      } else {
        throw new Error(data.error || 'Failed to create appointment');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.MARKETPLACE.BOOKINGS.UPDATE_STATUS(appointmentId)),
        {
          method: 'PUT',
          headers: getApiHeaders(token || undefined),
          body: JSON.stringify({
            status: status,
          }),
        }
      );
      
      const data: ApiResponse<Appointment> = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `Appointment ${status} successfully`);
        // Refresh schedule data
        await loadScheduleData();
      } else {
        throw new Error(data.error || `Failed to ${status} appointment`);
      }
    } catch (err) {
      console.error(`Error updating appointment status:`, err);
      Alert.alert('Error', err instanceof Error ? err.message : `Failed to ${status} appointment`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => handleUpdateAppointmentStatus(appointmentId, 'cancelled')
        }
      ]
    );
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => handleUpdateAppointmentStatus(appointmentId, 'completed')
        }
      ]
    );
  };


  const renderAppointmentCard = ({ item }: { item: Appointment }) => (
    <TouchableOpacity 
      style={styles.appointmentCard}
      onPress={() => handleAppointmentPress(item)}
    >
      <View style={[styles.appointmentIndicator, { backgroundColor: item.color }]} />
      <View style={styles.appointmentContent}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('-', ' ')}
            </Text>
          </View>
        </View>
        
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{formatTime(item.time)} ({item.duration} min)</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.client.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => (
    <TouchableOpacity 
      style={[
        styles.timeSlot,
        !item.available && styles.timeSlotBooked
      ]}
      onPress={() => {
        if (item.available) {
          setAppointmentForm({ ...appointmentForm, time: item.time });
          setShowNewAppointment(true);
        }
      }}
      disabled={!item.available}
    >
      <Text style={[
        styles.timeSlotText,
        !item.available && styles.timeSlotTextBooked
      ]}>
        {formatTime(item.time)}
      </Text>
      {item.appointment && (
        <View style={styles.appointmentPreview}>
          <Text style={styles.appointmentPreviewText} numberOfLines={1}>
            {item.appointment.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate.toISOString().split('T')[0]);
  const timeSlots = generateTimeSlots(selectedDate.toISOString().split('T')[0]);

  if (isLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
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
          <Text style={styles.headerTitle}>Schedule</Text>
          <TouchableOpacity 
            style={styles.newAppointmentButton}
            onPress={() => setShowNewAppointment(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.newAppointmentButtonText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadScheduleData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View Mode Selector */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'day' && styles.activeViewMode]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.viewModeText, viewMode === 'day' && styles.activeViewModeText]}>
              Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.viewModeText, viewMode === 'month' && styles.activeViewModeText]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Display */}
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateNavButton}>
            <Ionicons name="chevron-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate.toISOString().split('T')[0])}</Text>
          <TouchableOpacity style={styles.dateNavButton}>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Appointments ({todayAppointments.length})</Text>
          {todayAppointments.length > 0 ? (
            <FlatList
              data={todayAppointments}
              renderItem={renderAppointmentCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No appointments scheduled for today</Text>
            </View>
          )}
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <FlatList
            data={timeSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item) => item.time}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.timeSlotsContainer}
          />
        </View>
      </ScrollView>

      {/* New Appointment Modal */}
      <Modal
        visible={showNewAppointment}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewAppointment(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={appointmentForm.title}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, title: text })}
                placeholder="Appointment title"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeSelector}>
                {['service', 'meeting', 'maintenance', 'inspection'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      appointmentForm.type === type && styles.activeTypeOption
                    ]}
                    onPress={() => setAppointmentForm({ ...appointmentForm, type: type as any })}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      appointmentForm.type === type && styles.activeTypeOptionText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time *</Text>
              <TextInput
                style={styles.input}
                value={appointmentForm.time}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, time: text })}
                placeholder="HH:MM"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={appointmentForm.duration.toString()}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, duration: parseInt(text) || 60 })}
                placeholder="60"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Name *</Text>
              <TextInput
                style={styles.input}
                value={appointmentForm.clientName}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, clientName: text })}
                placeholder="Client name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Phone</Text>
              <TextInput
                style={styles.input}
                value={appointmentForm.clientPhone}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, clientPhone: text })}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={appointmentForm.location}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, location: text })}
                placeholder="Appointment location"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={appointmentForm.notes}
                onChangeText={(text) => setAppointmentForm({ ...appointmentForm, notes: text })}
                placeholder="Additional notes"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setShowNewAppointment(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateAppointment}>
                <Text style={styles.modalConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        visible={showAppointmentDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAppointmentDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAppointment && (
              <>
                <Text style={styles.modalTitle}>Appointment Details</Text>
                
                <View style={styles.appointmentDetailCard}>
                  <View style={styles.appointmentDetailHeader}>
                    <View style={[styles.appointmentDetailIndicator, { backgroundColor: selectedAppointment.color }]} />
                    <Text style={styles.appointmentDetailTitle}>{selectedAppointment.title}</Text>
                  </View>
                  
                  <View style={styles.appointmentDetailInfo}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={20} color="#6b7280" />
                      <Text style={styles.detailText}>{formatTime(selectedAppointment.time)} ({selectedAppointment.duration} min)</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={20} color="#6b7280" />
                      <Text style={styles.detailText}>{selectedAppointment.client.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="call-outline" size={20} color="#6b7280" />
                      <Text style={styles.detailText}>{selectedAppointment.client.phone}</Text>
                    </View>
                    {selectedAppointment.client.email && (
                      <View style={styles.detailRow}>
                        <Ionicons name="mail-outline" size={20} color="#6b7280" />
                        <Text style={styles.detailText}>{selectedAppointment.client.email}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={20} color="#6b7280" />
                      <Text style={styles.detailText}>{selectedAppointment.location}</Text>
                    </View>
                    {selectedAppointment.notes && (
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                        <Text style={styles.detailText}>{selectedAppointment.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalCancel} 
                    onPress={() => setShowAppointmentDetails(false)}
                  >
                    <Text style={styles.modalCancelText}>Close</Text>
                  </TouchableOpacity>
                  {selectedAppointment.status === 'scheduled' && (
                    <TouchableOpacity 
                      style={[styles.modalConfirm, styles.cancelButton]}
                      onPress={() => handleCancelAppointment(selectedAppointment.id)}
                    >
                      <Text style={styles.modalConfirmText}>Cancel Appointment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
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
  newAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newAppointmentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewModeContainer: {
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
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: '#3b82f6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeViewModeText: {
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateNavButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  appointmentIndicator: {
    width: 4,
  },
  appointmentContent: {
    flex: 1,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  timeSlotsContainer: {
    gap: 8,
  },
  timeSlot: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
  },
  timeSlotBooked: {
    backgroundColor: '#fecaca',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  timeSlotTextBooked: {
    color: '#ef4444',
  },
  appointmentPreview: {
    marginTop: 4,
  },
  appointmentPreviewText: {
    fontSize: 12,
    color: '#ef4444',
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
    maxHeight: '90%',
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activeTypeOption: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTypeOptionText: {
    color: '#fff',
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
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  appointmentDetailCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  appointmentDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentDetailIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  appointmentDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  appointmentDetailInfo: {
    gap: 12,
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
