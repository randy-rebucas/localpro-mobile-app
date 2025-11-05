import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SupplyItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  price: string;
  onPress: () => void;
}

const SupplyItem: React.FC<SupplyItemProps> = ({ title, icon, description, price, onPress }) => (
  <TouchableOpacity style={styles.supplyItem} onPress={onPress}>
    <View style={styles.supplyIcon}>
      <Ionicons name={icon} size={24} color="#92400e" />
    </View>
    <View style={styles.supplyContent}>
      <Text style={styles.supplyTitle}>{title}</Text>
      <Text style={styles.supplyDescription}>{description}</Text>
      <Text style={styles.supplyPrice}>{price}</Text>
    </View>
    <TouchableOpacity style={styles.addButton}>
      <Ionicons name="add" size={20} color="white" />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function SuppliesScreen() {
  const supplies = [
    {
      title: 'Cleaning Kit Pro',
      icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
      description: 'Complete cleaning supplies kit',
      price: '$29.99',
    },
    {
      title: 'Tool Set Basic',
      icon: 'hammer' as keyof typeof Ionicons.glyphMap,
      description: 'Essential tools for home repairs',
      price: '$89.99',
    },
    {
      title: 'Monthly Subscription',
      icon: 'refresh' as keyof typeof Ionicons.glyphMap,
      description: 'Regular supply deliveries',
      price: '$19.99/mo',
    },
    {
      title: 'Safety Equipment',
      icon: 'shield' as keyof typeof Ionicons.glyphMap,
      description: 'Protective gear and safety items',
      price: '$45.99',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Supplies & Materials</Text>
          <Text style={styles.subtitle}>Quality supplies for all your needs</Text>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryButtons}>
            <TouchableOpacity style={[styles.categoryButton, styles.categoryButtonActive]}>
              <Text style={[styles.categoryButtonText, styles.categoryButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Cleaning</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Tools</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Kits</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.suppliesContainer}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          {supplies.map((supply, index) => (
            <SupplyItem
              key={index}
              title={supply.title}
              icon={supply.icon}
              description={supply.description}
              price={supply.price}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.subscriptionContainer}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.subscriptionTitle}>Subscription Kits</Text>
            </View>
            <Text style={styles.subscriptionDescription}>
              Get regular deliveries of essential supplies with our subscription service
            </Text>
            <TouchableOpacity style={styles.subscriptionButton}>
              <Text style={styles.subscriptionButtonText}>Learn More</Text>
            </TouchableOpacity>
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
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#92400e',
    borderColor: '#92400e',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  suppliesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  supplyItem: {
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
  supplyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supplyContent: {
    flex: 1,
  },
  supplyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  supplyDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  supplyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#92400e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  subscriptionButton: {
    backgroundColor: '#92400e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  subscriptionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
