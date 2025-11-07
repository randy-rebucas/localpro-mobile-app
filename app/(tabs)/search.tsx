import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SearchCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const categories: SearchCategory[] = [
  { id: '1', name: 'Plumbing', icon: 'water', color: '#3b82f6' },
  { id: '2', name: 'Electrical', icon: 'flash', color: '#f59e0b' },
  { id: '3', name: 'HVAC', icon: 'thermometer', color: '#10b981' },
  { id: '4', name: 'Handyman', icon: 'construct', color: '#8b5cf6' },
  { id: '5', name: 'Cleaning', icon: 'sparkles', color: '#06b6d4' },
  { id: '6', name: 'Landscaping', icon: 'leaf', color: '#84cc16' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = getStyles(isDark);

  const renderCategory = ({ item }: { item: SearchCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(stack)/marketplace?category=${item.id}` as any)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, providers..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {searchQuery.length === 0 ? (
          <>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.categoryRow}
              contentContainerStyle={styles.categoriesList}
            />
          </>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>Search results for "{searchQuery}"</Text>
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={isDark ? '#4b5563' : '#d1d5db'} />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try searching with different keywords
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: isDark ? '#f9fafb' : '#1f2937',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#1f2937',
    marginBottom: 16,
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#1f2937',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsText: {
    fontSize: 16,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
  },
});

