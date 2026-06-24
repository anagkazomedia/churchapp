import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Calendar from 'expo-calendar';
import ThemedView from '../components/ThemedView'; 
import ThemedText from '../components/ThemedText';
import CachedImage from '../components/CachedImage';

const { width } = Dimensions.get('window');

export default function EventDetailsPage() {
  const { id, title, date, location, description, image } = useLocalSearchParams();
  const router = useRouter();

  const handleSetReminder = async () => {
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
        notes: description,
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
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-back" size={28} color="gold" />
      </TouchableOpacity>
      
      <View style={styles.reminderButtonContainer}>
        <TouchableOpacity style={styles.reminderButton} onPress={handleSetReminder}>
          <Icon name="notifications-outline" size={20} color="black" />
          <ThemedText style={styles.reminderButtonText}>Remind Me</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cached Image handles the offline/fallback logic */}
        <View style={styles.fadedImageContainer}>
          <CachedImage 
            uri={image} 
            style={styles.image} 
            type="event" 
          />
          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0.5, 1]}
            style={styles.gradientOverlay}
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText style={styles.title} numberOfLines={2}>🔥 {title}</ThemedText>
          
          <View style={styles.row}>
            <Icon name="calendar" size={16} color="gold" />
            <ThemedText style={styles.metaText}>{date || 'Date TBD'}</ThemedText>
          </View>
          
          <View style={styles.row}>
            <Icon name="pin" size={16} color="gold" />
            <ThemedText style={styles.metaText}>{location}</ThemedText>
          </View>

          <ThemedText style={styles.label}>Description:</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  scrollContent: { paddingBottom: 40 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  reminderButtonContainer: { position: 'absolute', top: 50, right: 16, zIndex: 10 },
  reminderButton: { 
    backgroundColor: 'gold', 
    flexDirection: 'row', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 5 
  },
  reminderButtonText: { color: 'black', fontWeight: '800', marginLeft: 5, fontSize: 12 },
  fadedImageContainer: { width: width, height: 300, marginBottom: 16, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  textContainer: { paddingHorizontal: 16, borderTopColor: 'rgba(255,215,0,0.1)', borderTopWidth: 1, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaText: { color: 'gold', fontSize: 14, marginLeft: 8 },
  label: { fontSize: 12, fontWeight: '700', opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  description: { fontSize: 16, lineHeight: 24, opacity: 0.9 }
});