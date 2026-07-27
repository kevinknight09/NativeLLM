import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { ModelOption } from '../types';
import { AVAILABLE_MODELS } from '../constants/models';
import { styles } from '../styles/appStyles';

type ModelPickerModalProps = {
  visible: boolean;
  selectedModel: ModelOption;
  downloadedModels: Record<string, boolean>;
  hasLoadedContext: boolean;
  onSelectModel: (model: ModelOption) => void;
  onClose: () => void;
};

export const ModelPickerModal: React.FC<ModelPickerModalProps> = ({
  visible,
  selectedModel,
  downloadedModels,
  hasLoadedContext,
  onSelectModel,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select AI Model</Text>
          <Text style={styles.modalSubtitle}>Choose a model recommended for your device's RAM:</Text>
        </View>

        <ScrollView style={styles.modalList}>
          {AVAILABLE_MODELS.map((item) => {
            const isDownloaded = downloadedModels[item.id];
            const isSelected = selectedModel.id === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.modelCard, isSelected && styles.selectedModelCard]}
                onPress={() => onSelectModel(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.tagContainer}>
                    <Text style={styles.sizeTag}>{item.size}</Text>
                    {isDownloaded && <Text style={styles.downloadedTag}>Downloaded</Text>}
                  </View>
                </View>

                <Text style={styles.cardDescription}>{item.description}</Text>

                <View style={styles.requirementRow}>
                  <Text style={styles.ramText}>⚡ RAM: {item.ramRequirement}</Text>
                </View>

                <Text style={styles.deviceText}>📱 Suitable for: {item.recommendedDevices}</Text>

                <TouchableOpacity
                  style={[styles.selectBtn, isSelected && styles.selectedBtn]}
                  onPress={() => onSelectModel(item)}
                >
                  <Text style={styles.selectBtnText}>
                    {isSelected ? 'Currently Selected' : isDownloaded ? 'Load Model' : 'Download & Load'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {hasLoadedContext && (
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Text style={styles.closeModalText}>Close Selection</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
  );
};
