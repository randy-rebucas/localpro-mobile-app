import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface FinanceItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  amount?: string;
  onPress: () => void;
}

const FinanceItem: React.FC<FinanceItemProps> = ({ title, icon, description, amount, onPress }) => (
  <TouchableOpacity style={styles.financeItem} onPress={onPress}>
    <View style={styles.financeIcon}>
      <Ionicons name={icon} size={24} color="#22c55e" />
    </View>
    <View style={styles.financeContent}>
      <Text style={styles.financeTitle}>{title}</Text>
      <Text style={styles.financeDescription}>{description}</Text>
      {amount && <Text style={styles.financeAmount}>{amount}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
  </TouchableOpacity>
);

export default function FinanceScreen() {
  const financeServices = [
    {
      title: 'Salary Advance',
      icon: 'cash' as keyof typeof Ionicons.glyphMap,
      description: 'Get advance on your earnings',
      amount: 'Up to $2,000',
    },
    {
      title: 'Micro-loans',
      icon: 'card' as keyof typeof Ionicons.glyphMap,
      description: 'Quick loans for business needs',
      amount: 'Up to $5,000',
    },
    {
      title: 'Fintech Partnership',
      icon: 'business' as keyof typeof Ionicons.glyphMap,
      description: 'Partner with leading fintech companies',
    },
    {
      title: 'Payment Processing',
      icon: 'card-outline' as keyof typeof Ionicons.glyphMap,
      description: 'Secure payment solutions',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Finance</Text>
          <Text style={styles.subtitle}>Financial services for your business</Text>
        </View>

        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>$1,250.00</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.balanceButton}>
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.balanceButtonText}>Add Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.balanceButton, styles.balanceButtonSecondary]}>
                <Ionicons name="arrow-up" size={16} color="#22c55e" />
                <Text style={[styles.balanceButtonText, styles.balanceButtonTextSecondary]}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Financial Services</Text>
          {financeServices.map((service, index) => (
            <FinanceItem
              key={index}
              title={service.title}
              icon={service.icon}
              description={service.description}
              amount={service.amount}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.partnershipContainer}>
          <View style={styles.partnershipCard}>
            <View style={styles.partnershipHeader}>
              <Ionicons name="business" size={24} color="#22c55e" />
              <Text style={styles.partnershipTitle}>Fintech Partnership</Text>
            </View>
            <Text style={styles.partnershipDescription}>
              We've partnered with leading fintech companies to provide you with 
              the best financial services and competitive rates.
            </Text>
            <View style={styles.partnershipFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.featureText}>Low interest rates</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.featureText}>Quick approval</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.featureText}>Flexible repayment</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.transactionContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionList}>
            <View style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons name="arrow-down" size={16} color="#22c55e" />
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionTitle}>Payment Received</Text>
                <Text style={styles.transactionDate}>Today, 2:30 PM</Text>
              </View>
              <Text style={styles.transactionAmount}>+$150.00</Text>
            </View>
            <View style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons name="arrow-up" size={16} color="#ef4444" />
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionTitle}>Withdrawal</Text>
                <Text style={styles.transactionDate}>Yesterday, 4:15 PM</Text>
              </View>
              <Text style={[styles.transactionAmount, styles.transactionAmountNegative]}>-$75.00</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
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
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  balanceButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  balanceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceButtonTextSecondary: {
    color: '#22c55e',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  financeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  financeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  financeContent: {
    flex: 1,
  },
  financeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  financeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  financeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  partnershipContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  partnershipCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  partnershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnershipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  partnershipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  partnershipFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  transactionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  transactionList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  transactionAmountNegative: {
    color: '#ef4444',
  },
});
