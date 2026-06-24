import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../src/services/api'; 
import ThemedView from '../components/ThemedView'; 
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../components/ThemedContext';

export default function EventsPage() {
  const { isDark } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('api/events/');
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

const renderEvent = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF' }]}
      onPress={() => {
        // We pass the individual properties so expo-router can handle them perfectly
        router.push({ 
          pathname: '/event-details', 
          params: { 
            title: item.title,
            date: item.date,
            location: item.location,
            description: item.description,
            image: item.image 
          } 
        });
      }}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.infoContainer}>
        <ThemedText style={styles.title} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.date}>{new Date(item.date).toDateString()}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="gold" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Updates</ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="gold" style={styles.loader} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 24, fontWeight: '900' },
  list: { padding: 16 },
  loader: { marginTop: 50 },
  card: { 
    marginBottom: 16, 
    borderRadius: 12, 
    overflow: 'hidden', 
    flexDirection: 'row', 
    height: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: { width: 100, height: '100%' },
  infoContainer: { padding: 12, flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  date: { fontSize: 12, color: 'gold', fontWeight: '600' }
});