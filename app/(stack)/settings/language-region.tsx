import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LanguageRegionSettings() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
  ];

  const regions = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  ];

  const timezones = [
    { code: 'America/New_York', name: 'Eastern Time (ET)', offset: 'UTC-5' },
    { code: 'America/Chicago', name: 'Central Time (CT)', offset: 'UTC-6' },
    { code: 'America/Denver', name: 'Mountain Time (MT)', offset: 'UTC-7' },
    { code: 'America/Los_Angeles', name: 'Pacific Time (PT)', offset: 'UTC-8' },
    { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)', offset: 'UTC+0' },
    { code: 'Europe/Paris', name: 'Central European Time (CET)', offset: 'UTC+1' },
    { code: 'Asia/Tokyo', name: 'Japan Standard Time (JST)', offset: 'UTC+9' },
    { code: 'Asia/Shanghai', name: 'China Standard Time (CST)', offset: 'UTC+8' },
  ];

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleRegionSelect = (code: string) => {
    setSelectedRegion(code);
  };

  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
  };

  const handleTimezoneSelect = (code: string) => {
    setSelectedTimezone(code);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => router.back()}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Language & Region</Text>
              <Text style={styles.subtitle}>Customize your language and regional settings</Text>
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.optionItem,
                selectedLanguage === language.code && styles.selectedOption
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{language.name}</Text>
                <Text style={styles.optionNative}>{language.native}</Text>
              </View>
              {selectedLanguage === language.code && (
                <Ionicons name="checkmark" size={20} color="#3b82f6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Region */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Region</Text>
          
          {regions.map((region) => (
            <TouchableOpacity
              key={region.code}
              style={[
                styles.optionItem,
                selectedRegion === region.code && styles.selectedOption
              ]}
              onPress={() => handleRegionSelect(region.code)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionFlag}>{region.flag}</Text>
                <Text style={styles.optionName}>{region.name}</Text>
              </View>
              {selectedRegion === region.code && (
                <Ionicons name="checkmark" size={20} color="#3b82f6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.optionItem,
                selectedCurrency === currency.code && styles.selectedOption
              ]}
              onPress={() => handleCurrencySelect(currency.code)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionSymbol}>{currency.symbol}</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{currency.name}</Text>
                  <Text style={styles.optionCode}>{currency.code}</Text>
                </View>
              </View>
              {selectedCurrency === currency.code && (
                <Ionicons name="checkmark" size={20} color="#3b82f6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Timezone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timezone</Text>
          
          {timezones.map((timezone) => (
            <TouchableOpacity
              key={timezone.code}
              style={[
                styles.optionItem,
                selectedTimezone === timezone.code && styles.selectedOption
              ]}
              onPress={() => handleTimezoneSelect(timezone.code)}
            >
              <View style={styles.optionContent}>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{timezone.name}</Text>
                  <Text style={styles.optionCode}>{timezone.offset}</Text>
                </View>
              </View>
              {selectedTimezone === timezone.code && (
                <Ionicons name="checkmark" size={20} color="#3b82f6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Settings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Settings</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Language</Text>
              <Text style={styles.summaryValue}>
                {languages.find(l => l.code === selectedLanguage)?.name}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Region</Text>
              <Text style={styles.summaryValue}>
                {regions.find(r => r.code === selectedRegion)?.name}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Currency</Text>
              <Text style={styles.summaryValue}>
                {currencies.find(c => c.code === selectedCurrency)?.name}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Timezone</Text>
              <Text style={styles.summaryValue}>
                {timezones.find(t => t.code === selectedTimezone)?.name}
              </Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 12,
    minWidth: 30,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionNative: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});
