import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { useProviderMode } from '../../contexts/ProviderModeContext';

interface FinanceOverview {
  balance: number;
  monthlyEarnings: number;
  monthlyExpenses: number;
  totalEarnings: number;
  totalExpenses: number;
  pendingAmount: number;
}

interface ServiceBlockProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const ServiceBlock: React.FC<ServiceBlockProps> = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.serviceBlock} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color="white" />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.serviceSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

interface JobRequest {
  id: string;
  clientName: string;
  serviceName: string;
  description: string;
  location: string;
  budget: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export default function HomeScreen() {
  const { user, token } = useAuth();
  const { isProviderMode } = useProviderMode();
  const [balance, setBalance] = useState<number | null>(null);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(
          buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.OVERVIEW),
          {
            method: 'GET',
            headers: getApiHeaders(token),
          }
        );
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setBalance(data.data.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    const fetchJobRequests = async () => {
      if (!token || !isProviderMode) return;
      
      try {
        // This would be the actual API endpoint for job requests
        // For now, using mock data
        setJobRequests([
          {
            id: '1',
            clientName: 'John Doe',
            serviceName: 'Plumbing Repair',
            description: 'Need to fix a leaky faucet',
            location: '123 Main St',
            budget: 150,
            createdAt: new Date().toISOString(),
            status: 'pending',
          },
        ]);
      } catch (error) {
        console.error('Error fetching job requests:', error);
      }
    };

    fetchBalance();
    if (isProviderMode) {
      fetchJobRequests();
    }
  }, [token, isProviderMode]);

  const services = [
    {
      title: 'Marketplace',
      subtitle: 'Buy & sell locally',
      icon: 'storefront' as keyof typeof Ionicons.glyphMap,
      color: '#3b82f6',
      route: 'marketplace',
    },
    {
      title: 'Supplies',
      subtitle: 'Equipment & tools',
      icon: 'cube' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      route: 'supplies',
    },
    {
      title: 'Academy',
      subtitle: 'Learn & grow',
      icon: 'school' as keyof typeof Ionicons.glyphMap,
      color: '#10b981',
      route: 'academy',
    },
    {
      title: 'Finance',
      subtitle: 'Manage money',
      icon: 'card' as keyof typeof Ionicons.glyphMap,
      color: '#8b5cf6',
      route: 'finance',
    },
    {
      title: 'Rentals',
      subtitle: 'Rent equipment',
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      color: '#ef4444',
      route: 'rentals',
    },
    {
      title: 'Ads',
      subtitle: 'Promote business',
      icon: 'megaphone' as keyof typeof Ionicons.glyphMap,
      color: '#06b6d4',
      route: 'ads',
    },
    {
      title: 'FacilityCare',
      subtitle: 'Property services',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      color: '#84cc16',
      route: 'facility-care',
    },
    {
      title: 'LocalPro Plus',
      subtitle: 'Premium features',
      icon: 'star' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      route: 'plus',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              {user?.avatar?.url ? (
                <Image 
                  source={{ uri: user.avatar.url }} 
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#6b7280" />
                </View>
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'}
              </Text>
              <Text style={styles.userPhone}>
                {user?.phoneNumber || 'No phone number'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.walletContainer} 
            onPress={() => router.push('/(tabs)/wallet')}
          >
            <View style={styles.walletInfo}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>
                ${balance !== null ? balance.toFixed(2) : '0.00'}
              </Text>
            </View>
            <Ionicons name="wallet" size={24} color="#22c55e" />
          </TouchableOpacity>
        </View>

        {isProviderMode ? (
          <>
            {/* Job Requests View */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Job Requests</Text>
              <Text style={styles.subtitleText}>
                New service requests from clients
              </Text>
            </View>

            <View style={styles.jobRequestsContainer}>
              {jobRequests.length > 0 ? (
                jobRequests.map((request) => (
                  <TouchableOpacity key={request.id} style={styles.jobRequestCard}>
                    <View style={styles.jobRequestHeader}>
                      <View style={styles.jobRequestInfo}>
                        <Text style={styles.jobRequestClient}>{request.clientName}</Text>
                        <Text style={styles.jobRequestService}>{request.serviceName}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: request.status === 'pending' ? '#fef3c7' : '#dcfce7' }]}>
                        <Text style={[styles.statusText, { color: request.status === 'pending' ? '#f59e0b' : '#10b981' }]}>
                          {request.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.jobRequestDescription}>{request.description}</Text>
                    <View style={styles.jobRequestFooter}>
                      <View style={styles.jobRequestMeta}>
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text style={styles.jobRequestLocation}>{request.location}</Text>
                      </View>
                      <Text style={styles.jobRequestBudget}>${request.budget}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
                  <Text style={styles.emptyStateTitle}>No Job Requests</Text>
                  <Text style={styles.emptyStateText}>
                    New job requests from clients will appear here
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.firstName || 'User'}!
              </Text>
              <Text style={styles.subtitleText}>
                Access all your services from one central hub
              </Text>
            </View>

            {/* Services Grid */}
            <View style={styles.servicesContainer}>
              <View style={styles.servicesGrid}>
                {services.map((service, index) => (
                  <ServiceBlock
                    key={index}
                    title={service.title}
                    subtitle={service.subtitle}
                    icon={service.icon}
                    color={service.color}
                    onPress={() => router.push(`/(stack)/${service.route}` as any)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      {isProviderMode ? (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(stack)/marketplace?action=create' as any)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(tabs)/booking' as any)}
        >
          <Ionicons name="calendar" size={24} color="white" />
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  walletInfo: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceBlock: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    height: 160,
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  jobRequestsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  jobRequestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  jobRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobRequestInfo: {
    flex: 1,
  },
  jobRequestClient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  jobRequestService: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobRequestDescription: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 20,
  },
  jobRequestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  jobRequestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobRequestLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobRequestBudget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
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
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
