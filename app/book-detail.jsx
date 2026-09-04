import React, { useState } from 'react';
import { 
  StyleSheet, View, Pressable, Linking, ScrollView, 
  Dimensions, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Icon from 'react-native-vector-icons/Ionicons';
import CachedImage from '../components/CachedImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768 || Platform.OS === 'web';

export default function BookDetail() {
  const book = useLocalSearchParams();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const rawPdfUrl = book?.pdf || '';
  const descriptionText = book?.description || 'No description available for this book.';
  const isLongDescription = descriptionText.length > 200;

  const handleReadBook = () => {
    if (!rawPdfUrl) return;

    if (IS_LARGE_SCREEN) {
      const gdocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawPdfUrl)}`;
      Linking.openURL(gdocsViewerUrl);
    } else {
      Linking.openURL(rawPdfUrl);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Floating Back Button */}
      <View style={styles.headerBar}>
        <Pressable
          style={({ focused }) => [
            styles.backBtn,
            focused && styles.focusedButton
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color="gold" />
          {IS_LARGE_SCREEN && <ThemedText style={styles.backButtonText}>Back</ThemedText>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={IS_LARGE_SCREEN ? styles.tvLayoutContainer : styles.mobileLayoutContainer}>
          
          {/* Expanded Cover Thumbnail Section */}
          <View style={IS_LARGE_SCREEN ? styles.tvCoverWrapper : styles.mobileCoverWrapper}>
            <CachedImage 
              uri={book.thumbnail} 
              style={IS_LARGE_SCREEN ? styles.tvThumbnail : styles.mobileThumbnail} 
              type="book" 
            />
          </View>

          {/* Details & Info Section */}
          <View style={[styles.detailsContainer, IS_LARGE_SCREEN && styles.tvDetailsContainer]}>
            <ThemedText style={styles.title}>{book.title || 'Untitled Book'}</ThemedText>
            
            {book.author && (
              <ThemedText style={styles.author}>by {book.author}</ThemedText>
            )}
            
            {book.category && (
              <View style={styles.tag}>
                <ThemedText style={styles.tagText}>{book.category}</ThemedText>
              </View>
            )}

            <View style={styles.divider} />

            <ThemedText style={styles.descTitle}>Description</ThemedText>
            
            <ThemedText 
              style={styles.desc} 
              numberOfLines={isExpanded ? undefined : 4}
            >
              {descriptionText}
            </ThemedText>

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

            {/* Read Book Action Button */}
            <Pressable 
              style={({ focused }) => [
                styles.readBtn,
                focused && styles.focusedReadBtn
              ]} 
              onPress={handleReadBook}
            >
              <Icon name="book-outline" size={20} color="black" style={{ marginRight: 8 }} />
              <ThemedText style={styles.readBtnText}>READ BOOK</ThemedText>
            </Pressable>
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
    left: 20,
    zIndex: 10,
  },
  backBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  scroll: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 95 : 75,
    paddingBottom: 40,
  },

  mobileLayoutContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  tvLayoutContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    gap: 40,
  },

  // Expanded Cover Image Styles
  mobileCoverWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  tvCoverWrapper: {
    width: 380, // Increased width for TV/Web
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  mobileThumbnail: { 
    width: '90%', 
    height: 450, // Increased height for mobile
    borderRadius: 16,
    resizeMode: 'cover',
  },
  tvThumbnail: { 
    width: 380, 
    height: 540, // Increased height for TV/Web
    borderRadius: 16,
    resizeMode: 'cover',
  },

  detailsContainer: { 
    width: '100%',
  },
  tvDetailsContainer: { 
    flex: 1,
    padding: 0,
  },
  title: { 
    fontSize: IS_LARGE_SCREEN ? 34 : 26, 
    fontWeight: '900',
    marginBottom: 4,
  },
  author: { 
    fontSize: 18, 
    opacity: 0.7, 
    marginBottom: 12,
    fontWeight: '600',
  },
  tag: { 
    backgroundColor: 'gold', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginBottom: 16 
  },
  tagText: {
    color: 'black',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },
  descTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  desc: { 
    fontSize: 15, 
    lineHeight: 24, 
    opacity: 0.8, 
  },

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

  readBtn: { 
    flexDirection: 'row',
    backgroundColor: 'gold', 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    alignSelf: IS_LARGE_SCREEN ? 'flex-start' : 'stretch',
  },
  focusedReadBtn: {
    backgroundColor: '#FFE55C',
    transform: [{ scale: 1.04 }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  readBtnText: { 
    color: 'black', 
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});