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

interface CourseItemProps {
  title: string;
  instructor: string;
  duration: string;
  level: string;
  onPress: () => void;
}

const CourseItem: React.FC<CourseItemProps> = ({ title, instructor, duration, level, onPress }) => (
  <TouchableOpacity style={styles.courseItem} onPress={onPress}>
    <View style={styles.courseHeader}>
      <View style={styles.courseIcon}>
        <Ionicons name="play-circle" size={24} color="#22c55e" />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{title}</Text>
        <Text style={styles.courseInstructor}>by {instructor}</Text>
      </View>
    </View>
    <View style={styles.courseMeta}>
      <View style={styles.metaItem}>
        <Ionicons name="time" size={16} color="#6b7280" />
        <Text style={styles.metaText}>{duration}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="trending-up" size={16} color="#6b7280" />
        <Text style={styles.metaText}>{level}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function AcademyScreen() {
  const courses = [
    {
      title: 'Professional Cleaning Certification',
      instructor: 'TES Academy',
      duration: '4 weeks',
      level: 'Beginner',
    },
    {
      title: 'Advanced Plumbing Techniques',
      instructor: 'TES Academy',
      duration: '6 weeks',
      level: 'Advanced',
    },
    {
      title: 'Electrical Safety & Installation',
      instructor: 'TES Academy',
      duration: '8 weeks',
      level: 'Intermediate',
    },
    {
      title: 'Business Management for Service Providers',
      instructor: 'TES Academy',
      duration: '3 weeks',
      level: 'All Levels',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Academy</Text>
          <Text style={styles.subtitle}>Partner with TES for professional training</Text>
        </View>

        <View style={styles.partnershipContainer}>
          <View style={styles.partnershipCard}>
            <View style={styles.partnershipHeader}>
              <Ionicons name="school" size={32} color="#22c55e" />
              <Text style={styles.partnershipTitle}>TES Partnership</Text>
            </View>
            <Text style={styles.partnershipDescription}>
              We've partnered with TES (Technical Education Services) to provide 
              comprehensive training and certification programs for service providers.
            </Text>
            <View style={styles.partnershipStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Certified Providers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15+</Text>
                <Text style={styles.statLabel}>Courses Available</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.coursesContainer}>
          <Text style={styles.sectionTitle}>Available Courses</Text>
          {courses.map((course, index) => (
            <CourseItem
              key={index}
              title={course.title}
              instructor={course.instructor}
              duration={course.duration}
              level={course.level}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.certificationContainer}>
          <View style={styles.certificationCard}>
            <View style={styles.certificationHeader}>
              <Ionicons name="ribbon" size={24} color="#f59e0b" />
              <Text style={styles.certificationTitle}>Get Certified</Text>
            </View>
            <Text style={styles.certificationDescription}>
              Complete courses and earn industry-recognized certifications to 
              boost your credibility and attract more clients.
            </Text>
            <TouchableOpacity style={styles.certificationButton}>
              <Text style={styles.certificationButtonText}>View Certifications</Text>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  partnershipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  partnershipStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  coursesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  courseItem: {
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
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#6b7280',
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  certificationContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  certificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  certificationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  certificationButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  certificationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
