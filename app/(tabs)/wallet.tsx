import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
  reference?: string;
  fee?: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  isDefault: boolean;
  expiryDate?: string;
  brand?: string;
}

interface FinanceOverview {
  balance: number;
  monthlyEarnings: number;
  monthlyExpenses: number;
  totalEarnings: number;
  totalExpenses: number;
  pendingAmount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default function WalletScreen() {
  const { user, token, isLoading } = useAuth();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showRequestMoney, setShowRequestMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  
  // API data state
  const [financeOverview, setFinanceOverview] = useState<FinanceOverview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const fetchFinanceOverview = async () => {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.OVERVIEW),
        {
          method: 'GET',
          headers: getApiHeaders(token || undefined),
        }
      );
      
      const data: ApiResponse<FinanceOverview> = await response.json();
      
      if (data.success && data.data) {
        setFinanceOverview(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch finance overview');
      }
    } catch (err) {
      console.error('Error fetching finance overview:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch finance overview');
    }
  };

  const fetchTransactions = async (page: number = 1, limit: number = 10) => {
    try {
      const url = ApiUtils.buildUrlWithParams(
        buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.TRANSACTIONS),
        ApiUtils.paginationParams(page, limit)
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(token || undefined),
      });
      
      const data: ApiResponse<{ transactions: Transaction[]; pagination: any }> = await response.json();
      
      if (data.success && data.data) {
        if (page === 1) {
          setTransactions(data.data?.transactions || []);
        } else {
          setTransactions(prev => [...prev, ...(data.data?.transactions || [])]);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.WALLET_SETTINGS),
        {
          method: 'GET',
          headers: getApiHeaders(token || undefined),
        }
      );
      
      const data: ApiResponse<{ paymentMethods: PaymentMethod[] }> = await response.json();
      
      if (data.success && data.data) {
        setPaymentMethods(data.data.paymentMethods || []);
      } else {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    }
  };

  const loadWalletData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchFinanceOverview(),
        fetchTransactions(),
        fetchPaymentMethods(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (token) {
      loadWalletData();
    }
  }, [token]);

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      // This would typically integrate with a payment gateway like PayPal or PayMaya
      // For now, we'll simulate the API call
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.OVERVIEW),
        {
          method: 'POST',
          headers: getApiHeaders(token || undefined),
          body: JSON.stringify({
            amount: parseFloat(amount),
            type: 'deposit',
            description: 'Wallet top-up',
          }),
        }
      );
      
      const data: ApiResponse<any> = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `Added $${amount} to your wallet`);
        setShowAddMoney(false);
        setAmount('');
        // Refresh wallet data
        await loadWalletData();
      } else {
        throw new Error(data.error || 'Failed to add money');
      }
    } catch (err) {
      console.error('Error adding money:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMoney = async () => {
    if (!amount || !recipient || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid amount and recipient');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.TRANSACTIONS),
        {
          method: 'POST',
          headers: getApiHeaders(token || undefined),
          body: JSON.stringify({
            amount: parseFloat(amount),
            recipient,
            note,
            type: 'transfer',
            description: `Transfer to ${recipient}`,
          }),
        }
      );
      
      const data: ApiResponse<any> = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `Sent $${amount} to ${recipient}`);
        setShowSendMoney(false);
        setAmount('');
        setRecipient('');
        setNote('');
        // Refresh wallet data
        await loadWalletData();
      } else {
        throw new Error(data.error || 'Failed to send money');
      }
    } catch (err) {
      console.error('Error sending money:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send money');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMoney = async () => {
    if (!amount || !recipient || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid amount and recipient');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.FINANCE.TRANSACTIONS),
        {
          method: 'POST',
          headers: getApiHeaders(token || undefined),
          body: JSON.stringify({
            amount: parseFloat(amount),
            recipient,
            note,
            type: 'request',
            description: `Money request from ${recipient}`,
          }),
        }
      );
      
      const data: ApiResponse<any> = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `Money request sent to ${recipient}`);
        setShowRequestMoney(false);
        setAmount('');
        setRecipient('');
        setNote('');
        // Refresh wallet data
        await loadWalletData();
      } else {
        throw new Error(data.error || 'Failed to send money request');
      }
    } catch (err) {
      console.error('Error requesting money:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send money request');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (category: string, type: 'credit' | 'debit') => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      service: type === 'credit' ? 'construct' : 'construct-outline',
      supplies: 'cube-outline',
      subscription: 'card-outline',
      transfer: 'swap-horizontal-outline',
      withdrawal: 'arrow-up-outline'
    };
    return iconMap[category] || 'card-outline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
          <Text style={styles.subtitle}>Manage your wallet and transactions</Text>
        </View>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity style={styles.eyeButton}>
              <Ionicons name="eye-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            ${financeOverview?.balance?.toFixed(2) || '0.00'}
          </Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={[styles.statValue, { color: '#10b981' }]}>
                +${financeOverview?.monthlyEarnings?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                -${financeOverview?.monthlyExpenses?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
          
          {financeOverview?.pendingAmount && financeOverview.pendingAmount > 0 && (
            <View style={styles.pendingAmount}>
              <Text style={styles.pendingLabel}>Pending</Text>
              <Text style={styles.pendingValue}>
                ${financeOverview.pendingAmount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowAddMoney(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="add" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowSendMoney(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="arrow-up" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowRequestMoney(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="arrow-down" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="card" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.actionText}>Cards</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity key={method.id} style={styles.paymentMethod}>
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodIcon}>
                  <Ionicons 
                    name={method.type === 'card' ? 'card' : 'business'} 
                    size={20} 
                    color="#6b7280" 
                  />
                </View>
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  {method.isDefault && (
                    <Text style={styles.defaultBadge}>Default</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPaymentMethod}>
            <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.addPaymentMethodText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadWalletData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transaction}>
              <View style={styles.transactionIcon}>
                <Ionicons 
                  name={getTransactionIcon(transaction.category, transaction.type)} 
                  size={20} 
                  color={transaction.type === 'credit' ? '#10b981' : '#ef4444'} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  <View style={styles.transactionStatus}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: getStatusColor(transaction.status) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(transaction.status) }
                    ]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'credit' ? '#10b981' : '#ef4444' }
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </Text>
            </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoney}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Money</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setShowAddMoney(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddMoney}>
                <Text style={styles.modalConfirmText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Money Modal */}
      <Modal
        visible={showSendMoney}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSendMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Money</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient</Text>
              <TextInput
                style={styles.input}
                value={recipient}
                onChangeText={setRecipient}
                placeholder="Phone number or email"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setShowSendMoney(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleSendMoney}>
                <Text style={styles.modalConfirmText}>Send Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Request Money Modal */}
      <Modal
        visible={showRequestMoney}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRequestMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Money</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>From</Text>
              <TextInput
                style={styles.input}
                value={recipient}
                onChangeText={setRecipient}
                placeholder="Phone number or email"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setShowRequestMoney(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleRequestMoney}>
                <Text style={styles.modalConfirmText}>Send Request</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
  settingsButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  defaultBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addPaymentMethodText: {
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '500',
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 12,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
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
  pendingAmount: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  pendingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});
