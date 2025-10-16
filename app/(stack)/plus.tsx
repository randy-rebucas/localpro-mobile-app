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

interface PlanItemProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  onPress: () => void;
}

const PlanItem: React.FC<PlanItemProps> = ({ title, price, period, features, isPopular, onPress }) => (
  <TouchableOpacity style={[styles.planItem, isPopular && styles.planItemPopular]} onPress={onPress}>
    {isPopular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularText}>Most Popular</Text>
      </View>
    )}
    <Text style={styles.planTitle}>{title}</Text>
    <View style={styles.planPriceContainer}>
      <Text style={styles.planPrice}>{price}</Text>
      <Text style={styles.planPeriod}>/{period}</Text>
    </View>
    <View style={styles.planFeatures}>
      {features.map((feature, index) => (
        <View key={index} style={styles.planFeature}>
          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          <Text style={styles.planFeatureText}>{feature}</Text>
        </View>
      ))}
    </View>
    <TouchableOpacity style={[styles.planButton, isPopular && styles.planButtonPopular]}>
      <Text style={[styles.planButtonText, isPopular && styles.planButtonTextPopular]}>
        Choose Plan
      </Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function PlusScreen() {
  const plans = [
    {
      title: 'Provider Basic',
      price: '$19',
      period: 'month',
      features: [
        'Up to 10 job postings',
        'Basic analytics',
        'Standard support',
        'Profile optimization',
      ],
    },
    {
      title: 'Provider Pro',
      price: '$49',
      period: 'month',
      features: [
        'Unlimited job postings',
        'Advanced analytics',
        'Priority support',
        'Featured listings',
        'Client messaging',
      ],
      isPopular: true,
    },
    {
      title: 'Client Premium',
      price: '$29',
      period: 'month',
      features: [
        'Priority booking',
        'Verified providers only',
        '24/7 support',
        'Insurance coverage',
        'Quality guarantee',
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="star" size={32} color="#f59e0b" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.title}>LocalPro Plus</Text>
              <Text style={styles.subtitle}>Premium subscriptions for providers and clients</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroContainer}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Unlock Premium Features</Text>
            <Text style={styles.heroDescription}>
              Get access to advanced tools, priority support, and exclusive features 
              designed to grow your business and improve your experience.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>10,000+</Text>
                <Text style={styles.heroStatLabel}>Premium Users</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>50%</Text>
                <Text style={styles.heroStatLabel}>More Bookings</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>4.9★</Text>
                <Text style={styles.heroStatLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          {plans.map((plan, index) => (
            <PlanItem
              key={index}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              isPopular={plan.isPopular}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Premium Benefits</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <Ionicons name="trending-up" size={24} color="#22c55e" />
              <Text style={styles.benefitTitle}>Increased Visibility</Text>
              <Text style={styles.benefitDescription}>Get featured in search results</Text>
            </View>
            <View style={styles.benefitCard}>
              <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
              <Text style={styles.benefitTitle}>Verified Status</Text>
              <Text style={styles.benefitDescription}>Build trust with verified badges</Text>
            </View>
            <View style={styles.benefitCard}>
              <Ionicons name="analytics" size={24} color="#22c55e" />
              <Text style={styles.benefitTitle}>Advanced Analytics</Text>
              <Text style={styles.benefitDescription}>Track performance and growth</Text>
            </View>
            <View style={styles.benefitCard}>
              <Ionicons name="headset" size={24} color="#22c55e" />
              <Text style={styles.benefitTitle}>Priority Support</Text>
              <Text style={styles.benefitDescription}>Get help when you need it</Text>
            </View>
          </View>
        </View>

        <View style={styles.testimonialContainer}>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "LocalPro Plus helped me grow my business by 200% in just 6 months. 
              The premium features are game-changers!"
            </Text>
            <View style={styles.testimonialAuthor}>
              <Text style={styles.testimonialName}>Sarah Johnson</Text>
              <Text style={styles.testimonialRole}>Cleaning Service Provider</Text>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoTextContainer: {
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
  heroContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  planItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  planItemPopular: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  planButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  planButtonPopular: {
    backgroundColor: '#f59e0b',
  },
  planButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  planButtonTextPopular: {
    color: 'white',
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  testimonialContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  testimonialCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  testimonialText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    alignItems: 'center',
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: 14,
    color: '#6b7280',
  },
});
