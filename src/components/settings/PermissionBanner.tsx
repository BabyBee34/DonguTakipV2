import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Warning } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

interface PermissionBannerProps {
  onOpenSettings: () => void;
}

export default function PermissionBanner({ onOpenSettings }: PermissionBannerProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Warning size={20} color="#D97706" weight="fill" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bildirim izni verilmedi</Text>
          <Text style={styles.description}>
            Ayarlardan bildirim iznini açabilirsin.
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Aç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#B45309',
  },
  button: {
    backgroundColor: '#D97706',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
});
