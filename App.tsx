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

import { Message, ModelOption, ChatSession } from './src/types';
import { AVAILABLE_MODELS } from './src/constants/models';
import { styles } from './src/styles/appStyles';
import { ModelPickerModal } from './src/components/ModelPickerModal';
import { ChatHistoryModal } from './src/components/ChatHistoryModal';
import { ChatMessage } from './src/components/ChatMessage';
import { formatPrompt } from './src/utils/promptFormatter';
import { saveAllSessions, loadAllSessions, deleteSessionFromDisk } from './src/utils/chatStorage';

const INITIAL_SYSTEM_MESSAGE: Message = {
  id: '1',
  role: 'system',
  content: 'You are NativeLLM, a helpful, completely private AI assistant.',
};

export default function App() {
  // Multi-session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_SYSTEM_MESSAGE]);

  const [inputText, setInputText] = useState('');
  
  // Model Selection state
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [showModelModal, setShowModelModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [downloadedModels, setDownloadedModels] = useState<Record<string, boolean>>({});

  // Status
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);

  useEffect(() => {
    const startup = async () => {
      await checkDownloadedModels();
      await initializeSessions();

      // Auto-load model if it's already downloaded
      const modelPath = `${RNFS.DocumentDirectoryPath}/${selectedModel.filename}`;
      if (await RNFS.exists(modelPath)) {
        setupModel(selectedModel);
      }
    };
    startup();
  }, []);

  const checkDownloadedModels = async () => {
    const statusMap: Record<string, boolean> = {};
    for (const m of AVAILABLE_MODELS) {
      const path = `${RNFS.DocumentDirectoryPath}/${m.filename}`;
      statusMap[m.id] = await RNFS.exists(path);
    }
    setDownloadedModels(statusMap);
  };

  const initializeSessions = async () => {
    const loadedSessions = await loadAllSessions();
    setSessions(loadedSessions);

    if (loadedSessions.length > 0) {
      // Restore most recent session
      const latest = loadedSessions[0];
      setCurrentSessionId(latest.id);
      setMessages(latest.messages);
    } else {
      // Create first default session
      createNewSession([], loadedSessions);
    }
  };

  const createNewSession = (existingMessages: Message[] = [], currentSessions = sessions) => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: existingMessages.length > 0 ? existingMessages : [INITIAL_SYSTEM_MESSAGE],
    };

    const updated = [newSession, ...currentSessions];
    setSessions(updated);
    setCurrentSessionId(newId);
    setMessages(newSession.messages);
    saveAllSessions(updated);
    return newSession;
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistoryModal(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const updated = await deleteSessionFromDisk(sessionId, sessions);
    setSessions(updated);

    if (currentSessionId === sessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        createNewSession([], []);
      }
    }
  };

  const handleSelectModel = async (model: ModelOption) => {
    setSelectedModel(model);
    setShowModelModal(false);
    
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
    if (isInitializing || isDownloading) return;

    const modelPath = `${RNFS.DocumentDirectoryPath}/${modelToLoad.filename}`;
    try {
      let exists = await RNFS.exists(modelPath);

      // If file exists, check if it's not empty (prevents corrupted loads)
      if (exists) {
        const stats = await RNFS.stat(modelPath);
        if (stats.size === 0) {
          await RNFS.unlink(modelPath);
          exists = false;
        }
      }
      
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
        const result = await download.promise;
        setIsDownloading(false);

        if (result.statusCode !== 200) {
          throw new Error(`Download failed with status ${result.statusCode}`);
        }

        setDownloadedModels((prev) => ({ ...prev, [modelToLoad.id]: true }));
      }

      setIsInitializing(true);

      // Ensure any existing context is released before loading new one
      if (llamaContext) {
        try { await llamaContext.release(); } catch (e) {
          console.log('Error releasing context:', e);
        }
        setLlamaContext(null);
      }

      console.log('Initializing Llama with model:', modelPath);
      const context = await initLlama({
        model: modelPath,
        use_mlock: false,
        n_ctx: 512, // Even smaller context to be extremely safe
        n_gpu_layers: 0, // Explicitly 0 for Android CPU
      });
      
      setLlamaContext(context);
    } catch (error) {
      console.error('Failed to setup model:', error);
      // Fallback for user notification
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: `⚠️ Error loading model: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or select a different model.`
        }
      ]);
    } finally {
      setIsInitializing(false);
      setIsDownloading(false);
    }
  };

  const persistCurrentMessages = (updatedMsgs: Message[]) => {
    setSessions((prevSessions) => {
      const now = Date.now();
      const firstUserMsg = updatedMsgs.find(m => m.role === 'user')?.content;
      const title = firstUserMsg ? (firstUserMsg.length > 30 ? firstUserMsg.slice(0, 30) + '...' : firstUserMsg) : 'New Conversation';

      const updated = prevSessions.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: s.title === 'New Conversation' ? title : s.title,
            updatedAt: now,
            messages: updatedMsgs,
          };
        }
        return s;
      });

      // Sort by most recently updated
      updated.sort((a, b) => b.updatedAt - a.updatedAt);
      saveAllSessions(updated);
      return updated;
    });
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
        setMessages((prev) => {
          const next = prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantResponse }
              : msg
          );
          return next;
        });
      });

      // Persist conversation to session history
      setMessages((prev) => {
        persistCurrentMessages(prev);
        return prev;
      });
    } catch (error) {
      console.error('Inference error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderWelcomeHeader = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>🦙</Text>
      </View>
      <Text style={styles.welcomeTitle}>NativeLLM</Text>
      <Text style={styles.welcomeSubtitle}>100% offline personal AI</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>NativeLLM 🦙</Text>
          <TouchableOpacity
            style={[styles.modelBadge, styles.activeModelBadge]}
            onPress={() => setShowModelModal(true)}
          >
            <Text style={styles.modelBadgeText}>🧠 {selectedModel.name}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.controlGroupLeft}>
            <TouchableOpacity
              style={styles.modelBadge}
              onPress={() => setShowHistoryModal(true)}
            >
              <Text style={styles.modelBadgeText}>📜 History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modelBadge}
              onPress={() => createNewSession()}
            >
              <Text style={styles.modelBadgeText}>➕ New Chat</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.modelBadge}
            onPress={() => setShowModelModal(true)}
          >
            <Text style={styles.modelBadgeText}>⚙️ Models</Text>
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
          ListHeaderComponent={messages.length <= 1 ? renderWelcomeHeader : null}
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
              (!inputText.trim() || isGenerating || !llamaContext) && styles.sendButtonDisabled,
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

      <ChatHistoryModal
        visible={showHistoryModal}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={() => {
          createNewSession();
          setShowHistoryModal(false);
        }}
        onDeleteSession={handleDeleteSession}
        onClose={() => setShowHistoryModal(false)}
      />
    </SafeAreaView>
  );
}
