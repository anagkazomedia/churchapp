import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../components/ThemedContext';

const { width } = Dimensions.get('window');

export default function ResourcesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useContext(ThemeContext);

  const options = [
    {
      title: 'Library',
      description: 'Browse our collection of books and reading materials.',
      icon: 'library',
      route: '/Library',
    },
    {
      title: 'Student Resources',
      description: 'Access past papers and study materials.',
      icon: 'document-text',
      route: '/papers',
    },
  ];

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="gold" />
        </TouchableOpacity>
        <ThemedText style={styles.heading}>Resources</ThemedText>
      </View>

      <View style={styles.content}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}
            onPress={() => router.push(option.route)}
          >
            <View style={styles.iconContainer}>
              <Icon name={option.icon} size={32} color="gold" />
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={styles.cardTitle}>{option.title}</ThemedText>
              <ThemedText style={styles.cardDesc}>{option.description}</ThemedText>
            </View>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    marginBottom: 10 
  },
  backButton: { marginRight: 15 },
  heading: { fontSize: 32, fontWeight: '900', color: 'gold' },
  content: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 14, opacity: 0.7 },
});