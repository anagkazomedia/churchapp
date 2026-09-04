import React, { useContext, useState } from 'react';
import { 
  StyleSheet, View, ScrollView, Pressable, 
  Dimensions, Alert, Text, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Calendar from 'expo-calendar';

import ThemedView from '../components/ThemedView'; 
import ThemedText from '../components/ThemedText';
import CachedImage from '../components/CachedImage';
import { ThemeContext } from '../components/ThemedContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768 || Platform.OS === 'web';

export default function EventDetailsPage() {
  const { isDark } = useContext(ThemeContext);
  const { id, title, date, location, description, image } = useLocalSearchParams();
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);

  const gradientColor = isDark ? '#000000' : '#FFFFFF';
  const borderTopColor = isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 0, 0, 0.08)';

  const descriptionText = description || 'No event description provided.';
  const isLongDescription = descriptionText.length > 180;

  const handleSetReminder = async () => {
    // Smart TV & Web fallback since native device calendars aren't directly available
    if (IS_LARGE_SCREEN || Platform.OS === 'web') {
      Alert.alert('Reminder Info', `Event: ${title || 'Event'}\nDate: ${date || 'TBD'}\nLocation: ${location || 'TBD'}`);
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow calendar access to set reminders.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: title,
        location: location,
        notes: descriptionText,
        startDate: new Date(), 
        endDate: new Date(new Date().getTime() + 60 * 60 * 1000), 
      });

      Alert.alert('Reminder Set!', 'Event has been added to your calendar.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not set reminder.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Floating Header Actions (Back & Remind Me) */}
      <View style={styles.headerBar}>
        <Pressable 
          style={({ focused }) => [
            styles.backButton,
            focused && styles.focusedButton
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <View style={styles.iconCircle}>
            <Icon name="arrow-back" size={24} color="gold" />
          </View>
          {IS_LARGE_SCREEN && <Text style={styles.backButtonText}>Back</Text>}
        </Pressable>

        {/* Remind Me Button for Mobile View Top Bar */}
        {!IS_LARGE_SCREEN && (
          <Pressable 
            style={({ focused }) => [
              styles.reminderButton,
              focused && styles.focusedReminderButton
            ]} 
            onPress={handleSetReminder}
          >
            <Icon name="notifications-outline" size={18} color="black" />
            <Text style={styles.reminderButtonText}>Remind Me</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={IS_LARGE_SCREEN ? styles.tvLayoutContainer : styles.mobileLayoutContainer}>
          
          {/* Banner / Poster Section */}
          <View style={IS_LARGE_SCREEN ? styles.tvImageWrapper : styles.fadedImageContainer}>
            <CachedImage 
              uri={image} 
              style={styles.image} 
              type="event" 
            />

            {/* Fading overlays for mobile poster presentation */}
            {!IS_LARGE_SCREEN && (
              <>
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.65)', 'transparent']}
                  locations={[0, 1]}
                  style={styles.topGradientOverlay}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={['transparent', gradientColor]}
                  locations={[0.4, 1]}
                  style={styles.gradientOverlay}
                  pointerEvents="none"
                />
              </>
            )}
          </View>

          {/* Text & Meta Details Section */}
          <View style={[
            styles.textContainer, 
            { borderTopColor }, 
            IS_LARGE_SCREEN && styles.tvTextContainer
          ]}>
            <ThemedText style={IS_LARGE_SCREEN ? styles.tvTitle : styles.title}>
              🔥 {title || 'Untitled Event'}
            </ThemedText>
            
            <View style={styles.row}>
              <Icon name="calendar" size={18} color="gold" />
              <ThemedText style={styles.metaText}>{date || 'Date TBD'}</ThemedText>
            </View>
            
            <View style={styles.row}>
              <Icon name="pin" size={18} color="gold" />
              <ThemedText style={styles.metaText}>{location || 'Location TBD'}</ThemedText>
            </View>

            <View style={styles.divider} />

            <ThemedText style={styles.label}>Description</ThemedText>
            
            {/* Dynamic Truncated Description */}
            <ThemedText 
              style={styles.description}
              numberOfLines={isExpanded ? undefined : 4}
            >
              {descriptionText}
            </ThemedText>

            {/* Toggle Description for TV/Mobile */}
            {isLongDescription && (
              <Pressable 
                style={({ focused }) => [
                  styles.toggleDescriptionButton,
                  focused && styles.focusedInlineButton
                ]}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                <ThemedText style={styles.toggleDescriptionText}>
                  {isExpanded ? 'Show less' : 'View full description'}
                </ThemedText>
                <Icon 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="gold" 
                />
              </Pressable>
            )}

            {/* Remind Me Action Button for TV Widescreen */}
            {IS_LARGE_SCREEN && (
              <Pressable 
                style={({ focused }) => [
                  styles.tvReminderButton,
                  focused && styles.focusedReminderButton
                ]} 
                onPress={handleSetReminder}
              >
                <Icon name="notifications-outline" size={20} color="black" />
                <Text style={styles.tvReminderButtonText}>SET REMINDER</Text>
              </Pressable>
            )}

          </View>

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 25,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: { 
    paddingTop: Platform.OS === 'ios' ? 95 : 75,
    paddingBottom: 40 
  },
  
  // Dynamic Layout Structure
  mobileLayoutContainer: {
    flexDirection: 'column',
  },
  tvLayoutContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    gap: 32,
  },

  // Image Styles
  fadedImageContainer: { 
    width: SCREEN_WIDTH, 
    height: 340, 
    marginBottom: 16, 
    position: 'relative',
    overflow: 'hidden' 
  },
  tvImageWrapper: {
    width: 420,
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  topGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    zIndex: 5,
  },
  gradientOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 140,
    zIndex: 5,
  },

  // Focusable Back & Remind Buttons
  backButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focusedButton: {
    borderColor: 'gold',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    transform: [{ scale: 1.05 }],
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  reminderButton: { 
    backgroundColor: 'gold', 
    flexDirection: 'row', 
    paddingHorizontal: 14, 
    paddingVertical: 9, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  reminderButtonText: { color: 'black', fontWeight: '800', marginLeft: 6, fontSize: 13 },
  focusedReminderButton: {
    backgroundColor: '#FFE55C',
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },

  // TV-Specific Action Button
  tvReminderButton: {
    flexDirection: 'row',
    backgroundColor: 'gold',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    alignSelf: 'flex-start',
  },
  tvReminderButtonText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  // Details Container
  textContainer: { 
    paddingHorizontal: 16, 
    borderTopWidth: 1, 
    paddingTop: 16 
  },
  tvTextContainer: {
    flex: 1,
    borderTopWidth: 0,
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 12 },
  tvTitle: { fontSize: 34, fontWeight: '900', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { color: 'gold', fontSize: 15, marginLeft: 8, fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },
  label: { fontSize: 13, fontWeight: '800', opacity: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  description: { fontSize: 16, lineHeight: 24, opacity: 0.9 },

  toggleDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  toggleDescriptionText: {
    color: 'gold',
    fontSize: 13,
    fontWeight: '700',
  },
  focusedInlineButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
  },
});