import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, RefreshControl 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

// 1. Import your shared Appwrite config
import { account, databases, DATABASE_ID, COLLECTION_ID, Query } from '../lib/appwrite'; 

// Your Theme Components
import ThemedView from '../components/ThemedView'; 
import ThemedText from '../components/ThemedText';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch only the logged-in user's favorites
  const fetchFavorites = async () => {
    try {
      const user = await account.get();
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userid', user.$id),
          Query.orderDesc('$createdAt') // Newest saves at the top
        ]
      );
      setFavorites(response.documents);
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const deleteFavorite = async (docId) => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this scripture?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, docId);
              setFavorites(favorites.filter(item => item.$id !== docId));
            } catch (error) {
              Alert.alert("Error", "Could not delete. Check your permissions.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <ThemedText style={styles.scriptureText}>{item.scripture}</ThemedText>
      </View>
      
      <TouchableOpacity 
        onPress={() => deleteFavorite(item.$id)} 
        style={styles.deleteBtn}
        hitSlop={10}
      >
        <Icon name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.root}>
      {/* Header Section */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>My Favorites</ThemedText>
        <View style={styles.goldLine} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffd700" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchFavorites} 
              tintColor="#ffd700" 
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Icon name="heart-dislike-outline" size={50} color="rgba(255,255,255,0.2)" />
              <ThemedText style={styles.emptyText}>No favorites saved yet.</ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { 
    paddingHorizontal: 25, 
    marginTop: 60, 
    marginBottom: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900',
    letterSpacing: -1,
  },
  goldLine: { 
    height: 4, 
    width: 40, 
    backgroundColor: '#ffd700', 
    marginTop: 8, 
    borderRadius: 2 
  },
  listContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Transparent dark card
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  textContainer: { flex: 1 },
  scriptureText: { 
    fontSize: 16, 
    lineHeight: 24, 
    fontStyle: 'italic',
    opacity: 0.9 
  },
  deleteBtn: { 
    marginLeft: 15, 
    padding: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 10
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 50 
  },
  emptyText: { 
    marginTop: 10,
    opacity: 0.5, 
    fontSize: 16 
  }
});