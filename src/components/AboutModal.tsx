import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet } from 'react-native';

type AboutModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={aboutStyles.container}>
        <View style={aboutStyles.header}>
          <Text style={aboutStyles.headerTitle}>About NativeLLM</Text>
          <TouchableOpacity style={aboutStyles.backBadge} onPress={onClose}>
            <Text style={aboutStyles.backBadgeText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={aboutStyles.content}>
          {/* Logo & App Info */}
          <View style={aboutStyles.cardCenter}>
            <View style={aboutStyles.logoContainer}>
              <Text style={aboutStyles.logoEmoji}>🦙</Text>
            </View>
            <Text style={aboutStyles.appName}>NativeLLM</Text>
            <View style={aboutStyles.betaBadge}>
              <Text style={aboutStyles.betaBadgeText}>🧪 Beta Testing</Text>
            </View>
            <Text style={aboutStyles.appVersion}>Version 0.1.0-beta</Text>
          </View>

          {/* Developer Credits */}
          <View style={aboutStyles.sectionCard}>
            <Text style={aboutStyles.sectionLabel}>DESIGN & DEVELOPMENT</Text>
            <Text style={aboutStyles.developerName}>Rounak Saha</Text>
            <Text style={aboutStyles.sectionDescription}>
              Crafted with a focus on privacy, speed, and offline AI intelligence directly on mobile hardware.
            </Text>
          </View>

          {/* Key Highlights */}
          <View style={aboutStyles.sectionCard}>
            <Text style={aboutStyles.sectionLabel}>KEY HIGHLIGHTS</Text>
            
            <View style={aboutStyles.bulletRow}>
              <Text style={aboutStyles.bulletIcon}>🔒</Text>
              <View style={aboutStyles.bulletTextContainer}>
                <Text style={aboutStyles.bulletTitle}>100% Private & Offline</Text>
                <Text style={aboutStyles.bulletDesc}>No data or prompts ever leave your device.</Text>
              </View>
            </View>

            <View style={aboutStyles.bulletRow}>
              <Text style={aboutStyles.bulletIcon}>⚡</Text>
              <View style={aboutStyles.bulletTextContainer}>
                <Text style={aboutStyles.bulletTitle}>On-Device C++ Inference</Text>
                <Text style={aboutStyles.bulletDesc}>Powered by GGUF quantization and llama.cpp native bindings.</Text>
              </View>
            </View>

            <View style={aboutStyles.bulletRow}>
              <Text style={aboutStyles.bulletIcon}>🚀</Text>
              <View style={aboutStyles.bulletTextContainer}>
                <Text style={aboutStyles.bulletTitle}>Continuous Upgrades</Text>
                <Text style={aboutStyles.bulletDesc}>New model options and release versioning will be added after initial launch.</Text>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={aboutStyles.footerText}>
            NativeLLM © 2026 • Designed & Developed by Rounak Saha
          </Text>
        </ScrollView>

        <TouchableOpacity style={aboutStyles.closeBtn} onPress={onClose}>
          <Text style={aboutStyles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const aboutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  backBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  backBadgeText: {
    color: '#0A84FF',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  cardCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  betaBadge: {
    backgroundColor: '#3A2E10',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9500',
    marginTop: 8,
  },
  betaBadgeText: {
    color: '#FF9500',
    fontSize: 13,
    fontWeight: 'bold',
  },
  appVersion: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sectionLabel: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  developerName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionDescription: {
    color: '#AAA',
    fontSize: 14,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  bulletIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  bulletTextContainer: {
    flex: 1,
  },
  bulletTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  bulletDesc: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  footerText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  closeBtn: {
    padding: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
