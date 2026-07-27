import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { initLlama, LlamaContext } from 'llama.rn';
import RNFS from 'react-native-fs';

import { Message, ModelOption } from './src/types';
import { AVAILABLE_MODELS } from './src/constants/models';
import { styles } from './src/styles/appStyles';
import { ModelPickerModal } from './src/components/ModelPickerModal';
import { ChatMessage } from './src/components/ChatMessage';
import { formatPrompt } from './src/utils/promptFormatter';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: 'You are NativeLLM, a helpful, completely private AI assistant.' },
    { id: '2', role: 'assistant', content: 'Hello! I am NativeLLM. Select a model to start chatting offline.' },
  ]);
  const [inputText, setInputText] = useState('');
  
  // Model & State Selection
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[1]); // Default Qwen2.5 0.5B
  const [showModelModal, setShowModelModal] = useState<boolean>(true);
  const [downloadedModels, setDownloadedModels] = useState<Record<string, boolean>>({});

  // Status
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);

  useEffect(() => {
    checkDownloadedModels();
  }, []);

  const checkDownloadedModels = async () => {
    const statusMap: Record<string, boolean> = {};
    for (const m of AVAILABLE_MODELS) {
      const path = `${RNFS.DocumentDirectoryPath}/${m.filename}`;
      statusMap[m.id] = await RNFS.exists(path);
    }
    setDownloadedModels(statusMap);
  };

  const handleSelectModel = async (model: ModelOption) => {
    setSelectedModel(model);
    setShowModelModal(false);
    
    // Release previous context if loaded
    if (llamaContext) {
      try {
        await llamaContext.release();
      } catch (e) {
        console.log('Error releasing context', e);
      }
      setLlamaContext(null);
    }

    setupModel(model);
  };

  const setupModel = async (modelToLoad: ModelOption) => {
    const modelPath = `${RNFS.DocumentDirectoryPath}/${modelToLoad.filename}`;
    try {
      const exists = await RNFS.exists(modelPath);
      
      if (!exists) {
        setIsDownloading(true);
        setDownloadProgress(0);
        const download = RNFS.downloadFile({
          fromUrl: modelToLoad.url,
          toFile: modelPath,
          progress: (res) => {
            const progress = (res.bytesWritten / res.contentLength) * 100;
            setDownloadProgress(progress);
          },
        });
        await download.promise;
        setIsDownloading(false);
        setDownloadedModels((prev) => ({ ...prev, [modelToLoad.id]: true }));
      }

      setIsInitializing(true);
      const context = await initLlama({
        model: modelPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: Platform.OS === 'ios' ? 100 : 0,
      });
      
      setLlamaContext(context);
      setIsInitializing(false);

    } catch (error) {
      console.error('Failed to setup model:', error);
      setIsInitializing(false);
      setIsDownloading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isGenerating || !llamaContext) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsGenerating(true);

    const promptString = formatPrompt(updatedMessages, selectedModel.promptTemplate);

    let assistantResponse = '';
    const assistantMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    try {
      await llamaContext.completion({
        prompt: promptString,
        n_predict: 256,
        temperature: 0.7,
      }, (res) => {
        assistantResponse += res.token;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMessageId 
              ? { ...msg, content: assistantResponse }
              : msg
          )
        );
      });
    } catch (error) {
      console.error('Inference error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>NativeLLM 🦙</Text>
          <TouchableOpacity 
            style={styles.modelBadge} 
            onPress={() => setShowModelModal(true)}
          >
            <Text style={styles.modelBadgeText}>Model: {selectedModel.name} ⚙️</Text>
          </TouchableOpacity>
        </View>
        
        {isDownloading && (
          <Text style={styles.statusText}>Downloading {selectedModel.name}: {downloadProgress.toFixed(1)}%</Text>
        )}
        {isInitializing && !isDownloading && (
          <Text style={styles.statusText}>Loading model into RAM...</Text>
        )}
      </View>
      
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={!llamaContext ? 'Loading model...' : `Message ${selectedModel.name}...`}
            placeholderTextColor="#888"
            multiline
            editable={!!llamaContext && !isGenerating}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!inputText.trim() || isGenerating || !llamaContext) && styles.sendButtonDisabled
            ]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isGenerating || !llamaContext}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ModelPickerModal
        visible={showModelModal}
        selectedModel={selectedModel}
        downloadedModels={downloadedModels}
        hasLoadedContext={!!llamaContext}
        onSelectModel={handleSelectModel}
        onClose={() => setShowModelModal(false)}
      />
    </SafeAreaView>
  );
}
