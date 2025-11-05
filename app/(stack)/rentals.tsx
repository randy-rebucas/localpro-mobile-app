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

interface RentalItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  price: string;
  availability: string;
  onPress: () => void;
}

const RentalItem: React.FC<RentalItemProps> = ({ title, icon, description, price, availability, onPress }) => (
  <TouchableOpacity style={styles.rentalItem} onPress={onPress}>
    <View style={styles.rentalIcon}>
      <Ionicons name={icon} size={24} color="#22c55e" />
    </View>
    <View style={styles.rentalContent}>
      <Text style={styles.rentalTitle}>{title}</Text>
      <Text style={styles.rentalDescription}>{description}</Text>
      <View style={styles.rentalMeta}>
        <Text style={styles.rentalPrice}>{price}</Text>
        <Text style={styles.rentalAvailability}>{availability}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.rentButton}>
      <Text style={styles.rentButtonText}>Rent</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function RentalsScreen() {
  const rentals = [
    {
      title: 'Power Drill Set',
      icon: 'hammer' as keyof typeof Ionicons.glyphMap,
      description: 'Professional power drill with multiple bits',
      price: '$15/day',
      availability: 'Available',
    },
    {
      title: 'Pickup Truck',
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      description: 'Ford F-150 for moving and transport',
      price: '$75/day',
      availability: 'Available',
    },
    {
      title: 'Ladder Set',
      icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
      description: 'Extension ladder up to 20 feet',
      price: '$25/day',
      availability: 'Available',
    },
    {
      title: 'Pressure Washer',
      icon: 'water' as keyof typeof Ionicons.glyphMap,
      description: 'High-pressure cleaning equipment',
      price: '$40/day',
      availability: 'Rented',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Rentals</Text>
          <Text style={styles.subtitle}>Tools and vehicles for your projects</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <Text style={styles.searchPlaceholder}>Search rentals...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color="#22c55e" />
          </TouchableOpacity>
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
              <Text style={styles.categoryButtonText}>Tools</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Vehicles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Equipment</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rentalsContainer}>
          <Text style={styles.sectionTitle}>Available Rentals</Text>
          {rentals.map((rental, index) => (
            <RentalItem
              key={index}
              title={rental.title}
              icon={rental.icon}
              description={rental.description}
              price={rental.price}
              availability={rental.availability}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#22c55e" />
              <Text style={styles.infoTitle}>Rental Information</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.infoText}>Insurance included</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.infoText}>Free delivery within 10 miles</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.infoText}>24/7 customer support</Text>
              </View>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  rentalsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  rentalItem: {
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
  rentalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rentalContent: {
    flex: 1,
  },
  rentalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  rentalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  rentalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  rentalAvailability: {
    fontSize: 12,
    color: '#6b7280',
  },
  rentButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
});
