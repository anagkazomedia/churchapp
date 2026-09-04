import React, { useState, useContext } from 'react';
import { StyleSheet, View, Share, Linking } from 'react-native';
import { Menu, IconButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemeContext } from './ThemedContext';
import { Colors } from "../constants/Colors";

const CornerDropdown = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  
  // Destructure toggleTheme and isDark from your context
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const theme = isDark ? Colors.dark : Colors.light;

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Error", err));
    setVisible(false);
  };

  const handleNavigation = (path) => {
    setVisible(false);
    router.push(path);
  };

  const handleShare = async () => {
    setVisible(false);
    try {
      await Share.share({
        message: 'Check out the Anagkazo app on Google Play: https://play.google.com/store/apps/details?id=com.churchapp.anagkazo&pcampaignid=web_share',
      });
    } catch (error) {
      console.error("Error sharing app:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <IconButton 
            icon="dots-vertical" 
            iconColor={theme.text} 
            size={28} 
            onPress={() => setVisible(true)} 
            style={styles.iconBtn}
          />
        }
        // Matching your 12px-15px sharp radius preference
        contentStyle={{ backgroundColor: theme.background, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#333' : '#EEE' }}>
        
        {/* NEW: THEME SWITCH BUTTON */}
        <Menu.Item 
          leadingIcon={isDark ? "weather-sunny" : "moon-waning-crescent"} 
          title={isDark ? "Light Mode" : "Dark Mode"} 
          titleStyle={{ color: theme.text, fontWeight: '700' }}
          onPress={() => {
            toggleTheme();
            setVisible(false);
          }} 
        />

        <Divider />

        {/* INTERNAL LINKS */}

        <Menu.Item 
          leadingIcon="calendar-clock" 
          title="Updates" 
          titleStyle={{ color: theme.text }}
          onPress={() => handleNavigation('/events')}
        />
        <Menu.Item 
          leadingIcon="file-document-outline" 
          title="Resources" 
          titleStyle={{ color: theme.text }}
          onPress={() => handleNavigation('/resources')}
        />

        <Menu.Item 
          leadingIcon="help-circle-outline" 
          title="About Us" 
          titleStyle={{ color: theme.text }}
          onPress={() => handleNavigation('/about')} 
        />

        <Divider />

        {/* EXTERNAL / APP ACTIONS */}

        <Menu.Item 
          leadingIcon="share-variant-outline" 
          title="Share App" 
          titleStyle={{ color: theme.text }}
          onPress={handleShare} 
        />
        
        <Divider />
        
        <View style={styles.socialRow}>
           <IconButton icon="facebook" iconColor="#1877F2" size={20} onPress={() => openLink('https://facebook.com/@frankmutebi')} />
           <IconButton icon="instagram" iconColor="#E4405F" size={20} onPress={() => openLink('https://www.instagram.com/anagkazomedia?igsh=bnVqbzh2ajc2Z2d1')} />
           <IconButton icon="youtube" iconColor="#FF0000" size={20} onPress={() => openLink('https://www.youtube.com/@AnagkazoEaglesFellowship')} />
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  iconBtn: { margin: 0 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 5 }
});

export default CornerDropdown;