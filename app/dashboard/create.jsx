import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../src/services/api'; 
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { ThemeContext } from '../../components/ThemedContext';
import CornerDropdown from '../../components/CornerDropdown';
import CachedImage from '../../components/CachedImage'; // 1. Added Import

export default function DonationsPage() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDevotions = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      
      if (!net.isConnected) {
        // Load from cache if offline
        const cached = await AsyncStorage.getItem('cache_devs');
        if (cached) {
            const parsed = JSON.parse(cached);
            setItems(parsed);
            setFilteredItems(parsed);
        }
      } else {
        // Fetch from API and update cache
        try {
          const res = await api.get('api/devotions/');
          setItems(res.data);
          setFilteredItems(res.data);
          await AsyncStorage.setItem('cache_devs', JSON.stringify(res.data));
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    fetchDevotions();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = items.filter((item) =>
      item.Title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF' }]}
      onPress={() => router.push({ 
        pathname: '/devotions-detail', 
        params: { 
          title: item.Title,
          author: item.author,
          scripture: item.Scripture,
          body: item.Body,
          moreScriptures: item.Morescriptures,
          prayer: item.Prayer,
          thumbnail: item.thumbnail
        } 
      })}
    >
      {/* 2. Used CachedImage instead of standard Image */}
      <CachedImage uri={item.thumbnail} style={styles.itemImage} type="devotion" />
      <View style={styles.infoContainer}>
        <ThemedText style={styles.title} numberOfLines={2}>{item.Title}</ThemedText>
        <ThemedText style={styles.subtitle} numberOfLines={1}>By {item.author}</ThemedText>
        <ThemedText style={styles.date}>{item.date_published}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View>
                <ThemedText style={styles.headerTitle}>Devotions</ThemedText>
                <View style={styles.goldUnderline} />
            </View>
            <CornerDropdown />
        </View>
        
        <TextInput
          style={[styles.searchBar, { 
            backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0',
            color: isDark ? '#FFF' : '#000'
          }]}
          placeholder="Search by title..."
          placeholderTextColor={isDark ? '#888' : '#AAA'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="gold" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { paddingHorizontal: 20, paddingBottom: 15 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 8, borderRadius: 2, marginBottom: 15 },
  searchBar: {
    height: 45,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginTop: 5,
  },
  list: { padding: 16 },
  loader: { marginTop: 50 },
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', height: 100 },
  itemImage: { width: 100, height: '100%' },
  infoContainer: { padding: 12, flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 12, opacity: 0.6 },
  date: { fontSize: 10, color: 'gold', fontWeight: '800', marginTop: 4 }
});