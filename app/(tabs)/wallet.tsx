import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

export default function WalletScreen() {
  const { user, isLoading } = useAuth();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showRequestMoney, setShowRequestMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');

  // Mock wallet data - in a real app, this would come from API
  const walletBalance = 1250.75;
  const monthlyEarnings = 3200.50;
  const monthlySpending = 1950.25;

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'credit',
      amount: 500.00,
      description: 'Service Payment - Plumbing Repair',
      date: '2024-01-15',
      status: 'completed',
      category: 'service'
    },
    {
      id: '2',
      type: 'debit',
      amount: 75.50,
      description: 'Supplies Purchase',
      date: '2024-01-14',
      status: 'completed',
      category: 'supplies'
    },
    {
      id: '3',
      type: 'credit',
      amount: 300.00,
      description: 'Service Payment - Electrical Work',
      date: '2024-01-13',
      status: 'completed',
      category: 'service'
    },
    {
      id: '4',
      type: 'debit',
      amount: 25.00,
      description: 'App Subscription',
      date: '2024-01-12',
      status: 'completed',
      category: 'subscription'
    },
    {
      id: '5',
      type: 'credit',
      amount: 150.00,
      description: 'Service Payment - HVAC Maintenance',
      date: '2024-01-11',
      status: 'pending',
      category: 'service'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Visa **** 4242',
      lastFour: '4242',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      name: 'Chase Bank **** 1234',
      lastFour: '1234',
      isDefault: false
    }
  ];

  const handleAddMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    // In a real app, this would call the payment API
    Alert.alert('Success', `Added $${amount} to your wallet`);
    setShowAddMoney(false);
    setAmount('');
  };

  const handleSendMoney = () => {
    if (!amount || !recipient || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid amount and recipient');
      return;
    }
    // In a real app, this would call the transfer API
    Alert.alert('Success', `Sent $${amount} to ${recipient}`);
    setShowSendMoney(false);
    setAmount('');
    setRecipient('');
    setNote('');
  };

  const handleRequestMoney = () => {
    if (!amount || !recipient || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid amount and recipient');
      return;
    }
    // In a real app, this would call the request API
    Alert.alert('Success', `Money request sent to ${recipient}`);
    setShowRequestMoney(false);
    setAmount('');
    setRecipient('');
    setNote('');
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.balanceAmount}>${walletBalance.toFixed(2)}</Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={[styles.statValue, { color: '#10b981' }]}>
                +${monthlyEarnings.toFixed(2)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                -${monthlySpending.toFixed(2)}
              </Text>
            </View>
          </View>
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

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.map((transaction) => (
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
          ))}
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
});
