import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

// Extended user interface for profile screen
interface ExtendedUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  role: string;
  avatar?: {
    url: string;
    publicId: string;
    thumbnail: string;
  };
  bio?: string;
  createdAt?: string;
  subscription?: {
    isActive: boolean;
    type: string;
  }
}

export default function ProfileScreen() {
  const { user, updateUserProfile, uploadAvatar, refreshUserData, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: (user as ExtendedUser)?.firstName || '',
    lastName: (user as ExtendedUser)?.lastName || '',
    email: (user as ExtendedUser)?.email || '',
    bio: (user as ExtendedUser)?.bio || '',
  });
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    joinDate: (user as ExtendedUser)?.createdAt || '2024-01-01',
    totalBookings: 0,
    rating: 0,
    completedJobs: 0,
    responseTime: '2 hours',
  });
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  // Fetch additional user data from API
  const fetchUserData = async () => {
    try {
      if (!user) return;
      
      const userData = user as ExtendedUser;
      
      // Try to fetch user statistics from API
      try {
        // Note: These API calls will fail until the endpoints are implemented on the backend
        // const statsResponse = await apiService.getUserStats(userData.id);
        // const portfolioResponse = await apiService.getUserPortfolio(userData.id);
        
        // For now, use the user data we have and set defaults for missing data
        setUserStats({
          joinDate: userData.createdAt || new Date().toISOString(),
          totalBookings: 0, // Will be populated when API is implemented
          rating: 0, // Will be populated when API is implemented
          completedJobs: 0, // Will be populated when API is implemented
          responseTime: '2 hours', // Will be populated when API is implemented
        });
        
        // Set portfolio images and stats (only for providers)
        if (userData.role === 'provider') {
          setPortfolioImages([]);
        } else {
          // For non-providers, don't show stats
          setUserStats({
            joinDate: userData.createdAt || new Date().toISOString(),
            totalBookings: 0,
            rating: 0,
            completedJobs: 0,
            responseTime: 'N/A',
          });
        }
        
      } catch (apiError) {
        console.log('API endpoints not yet implemented, using default values');
        
        // Fallback to default values when API endpoints are not available
        setUserStats({
          joinDate: userData.createdAt || new Date().toISOString(),
          totalBookings: 0,
          rating: 0,
          completedJobs: 0,
          responseTime: '2 hours',
        });
        
        if (userData.role === 'provider') {
          setPortfolioImages([]);
        } else {
          // For non-providers, don't show stats
          setUserStats({
            joinDate: userData.createdAt || new Date().toISOString(),
            totalBookings: 0,
            rating: 0,
            completedJobs: 0,
            responseTime: 'N/A',
          });
        }
      }
      
      console.log('User data processed:', {
        user: userData,
        hasAvatar: !!userData.avatar?.url,
        hasBio: !!userData.bio,
        role: userData.role,
        isVerified: userData.isVerified,
        joinDate: userData.createdAt
      });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default values on error
      setUserStats({
        joinDate: new Date().toISOString(),
        totalBookings: 0,
        rating: 0,
        completedJobs: 0,
        responseTime: '2 hours',
      });
      setPortfolioImages([]);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Profile Screen - User data:', user);
      fetchUserData();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data from server
      await refreshUserData();
      // Also fetch additional user data (stats, portfolio)
      await fetchUserData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditData({
      firstName: (user as ExtendedUser)?.firstName || '',
      lastName: (user as ExtendedUser)?.lastName || '',
      email: (user as ExtendedUser)?.email || '',
      bio: (user as ExtendedUser)?.bio || '',
    });
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(editData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      firstName: (user as ExtendedUser)?.firstName || '',
      lastName: (user as ExtendedUser)?.lastName || '',
      email: (user as ExtendedUser)?.email || '',
      bio: (user as ExtendedUser)?.bio || '',
    });
  };

  const handleImagePicker = () => {
    setShowImagePicker(true);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      setUploading(true);
      let result;

      if (source === 'camera') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Photo library permission is required');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('avatar', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);

        await uploadAvatar(formData);
        Alert.alert('Success', 'Avatar updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar');
    } finally {
      setUploading(false);
      setShowImagePicker(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color="#6b7280" />
          <Text style={styles.errorTitle}>No User Data</Text>
          <Text style={styles.errorText}>Please sign in to view your profile</Text>
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardGradient} />
          
          {/* Header Actions */}
          <View style={styles.profileHeaderActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="share-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
              <View style={styles.avatar}>
                {(user as ExtendedUser).avatar?.url ? (
                  <Image 
                    source={{ uri: (user as ExtendedUser).avatar?.url }} 
                    style={styles.avatarImage}
                    onError={(error) => {
                      console.log('Avatar image failed to load:', error);
                      console.log('Avatar URL:', (user as ExtendedUser).avatar?.url);
                    }}
                    onLoad={() => {
                      console.log('Avatar image loaded successfully');
                    }}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#6b7280" />
                  </View>
                )}
                <View style={styles.avatarEditIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
                <View style={styles.avatarStatusIndicator}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: user.isVerified ? '#10b981' : '#f59e0b' }
                  ]} />
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.nameSection}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <View style={styles.verificationBadge}>
                <Ionicons 
                  name={user.isVerified ? "checkmark-circle" : "time-outline"} 
                  size={16} 
                  color={user.isVerified ? "#10b981" : "#f59e0b"} 
                />
                <Text style={[
                  styles.verificationText,
                  { color: user.isVerified ? "#10b981" : "#f59e0b" }
                ]}>
                  {user.isVerified ? "Verified" : "Pending Verification"}
                </Text>
              </View>
              {user.role && (
                <View style={[styles.roleBadge, { backgroundColor: user.role === 'provider' ? '#3b82f6' : '#10b981' }]}>
                  <Ionicons 
                    name={user.role === 'provider' ? "briefcase" : "person"} 
                    size={12} 
                    color="#fff" 
                  />
                  <Text style={styles.roleText}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* User Statistics - Only for Providers */}
          {user.role === 'provider' && (
            <View style={styles.statsSection}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Performance Overview</Text>
                <TouchableOpacity style={styles.statsViewAllButton}>
                  <Text style={styles.statsViewAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.statValue}>{userStats.totalBookings || 0}</Text>
                  <Text style={styles.statLabel}>Total Bookings</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#fffbeb' }]}>
                    <Ionicons name="star-outline" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.statValue}>{userStats.rating ? userStats.rating.toFixed(1) : '0.0'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#f0fdf4' }]}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
                  </View>
                  <Text style={styles.statValue}>{userStats.completedJobs || 0}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>
          )}

          {/* User Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="mail-outline" size={20} color="#3b82f6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editData.email}
                    onChangeText={(text) => setEditData({ ...editData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter your email"
                  />
                ) : (
                  <Text style={styles.infoValue}>{user.email || 'Not provided'}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>
                  {user.phoneNumber || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {userStats.joinDate ? new Date(userStats.joinDate).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>

            {user.role === 'provider' && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#f59e0b" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Avg. Response Time</Text>
                  <Text style={styles.infoValue}>{userStats.responseTime}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="card-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Subscription</Text>
                <View style={styles.subscriptionInfo}>
                  <View style={[
                    styles.subscriptionBadge,
                    { backgroundColor: user.subscription?.isActive ? "#dcfce7" : "#fef2f2" }
                  ]}>
                    <Text style={[
                      styles.subscriptionStatus,
                      { color: user.subscription?.isActive ? "#16a34a" : "#dc2626" }
                    ]}>
                      {user.subscription?.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                  <Text style={styles.subscriptionType}>{user.subscription?.type || "No subscription"}</Text>
                </View>
              </View>
            </View>

            {/* Bio Section */}
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                <Text style={styles.bioLabel}>About</Text>
              </View>
              {isEditing ? (
                <TextInput
                  style={styles.bioInput}
                  value={editData.bio}
                  onChangeText={(text) => setEditData({ ...editData, bio: text })}
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioText}>
                    {(user as ExtendedUser).bio || "No bio provided yet. Add a bio to tell others about yourself!"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Edit Actions */}
          <View style={styles.actionSection}>
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name="close-outline" size={20} color="#6b7280" />
                  </View>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name="checkmark-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <View style={styles.editButtonContent}>
                  <View style={styles.editButtonLeft}>
                    <View style={styles.buttonIconContainer}>
                      <Ionicons name="create-outline" size={20} color="#3b82f6" />
                    </View>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Portfolio Section */}
        {user.role === 'provider' && (
          <View style={styles.portfolioSection}>
            <View style={styles.portfolioHeader}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <TouchableOpacity style={styles.addPortfolioButton}>
                <Ionicons name="add" size={20} color="#3b82f6" />
                <Text style={styles.addPortfolioText}>Add Work</Text>
              </TouchableOpacity>
            </View>
            
            {portfolioImages.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.portfolioScroll}
              >
                {portfolioImages.map((image, index) => (
                  <TouchableOpacity key={index} style={styles.portfolioItem}>
                    <Image source={{ uri: image }} style={styles.portfolioImage} />
                    <View style={styles.portfolioOverlay}>
                      <Ionicons name="eye" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyPortfolioContainer}>
                <Ionicons name="images-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyPortfolioText}>No portfolio images yet</Text>
                <Text style={styles.emptyPortfolioSubtext}>Add your work samples to showcase your skills</Text>
              </View>
            )}
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>8</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/notifications')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications-outline" size={24} color="#3b82f6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Notifications</Text>
              <Text style={styles.settingSubtext}>Manage your notification preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/privacy-security')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="shield-outline" size={24} color="#10b981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Privacy & Security</Text>
              <Text style={styles.settingSubtext}>Control your privacy settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/payment-methods')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="card-outline" size={24} color="#f59e0b" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Payment Methods</Text>
              <Text style={styles.settingSubtext}>Manage your payment options</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/location-settings')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="location-outline" size={24} color="#ef4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Location Settings</Text>
              <Text style={styles.settingSubtext}>Configure location permissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/language-region')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="language-outline" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Language & Region</Text>
              <Text style={styles.settingSubtext}>Change language and region</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/settings/help-support')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={24} color="#06b6d4" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Help & Support</Text>
              <Text style={styles.settingSubtext}>Get help and contact support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>About</Text>
              <Text style={styles.settingSubtext}>App version and information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <View style={styles.signOutIconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={20} color="#ef4444" />
        </TouchableOpacity>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Avatar</Text>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => pickImage('camera')}
              disabled={uploading}
            >
              <Ionicons name="camera" size={24} color="#3b82f6" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => pickImage('library')}
              disabled={uploading}
            >
              <Ionicons name="image" size={24} color="#3b82f6" />
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancel} 
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  profileCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#3b82f6',
  },
  profileHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarStatusIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameSection: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statsViewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsViewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginRight: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  editInput: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionType: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  bioSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bioLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
    fontWeight: '600',
  },
  bioContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bioText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bioInput: {
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  editButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIconContainer: {
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  signOutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    flex: 1,
    marginLeft: 16,
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  modalCancel: {
    paddingVertical: 16,
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  portfolioSection: {
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
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPortfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPortfolioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 4,
  },
  portfolioScroll: {
    flexDirection: 'row',
  },
  portfolioItem: {
    marginRight: 12,
    position: 'relative',
  },
  portfolioImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  portfolioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPortfolioContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyPortfolioText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyPortfolioSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
