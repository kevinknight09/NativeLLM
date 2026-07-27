import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
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

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Using a very small model (TinyLlama 1.1B 4-bit quantized) for mobile performance.
// You can replace this URL with a Llama 3 8B GGUF if you have a high-end device.
const MODEL_URL = 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
const MODEL_FILENAME = 'tinyllama.gguf';
const MODEL_PATH = `${RNFS.DocumentDirectoryPath}/${MODEL_FILENAME}`;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: 'You are NativeLLM, a helpful, completely private AI assistant.' },
    { id: '2', role: 'assistant', content: 'Hello! I am NativeLLM. I run completely offline on your device.' },
  ]);
  const [inputText, setInputText] = useState('');
  
  // App State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);

  useEffect(() => {
    setupModel();
  }, []);

  const setupModel = async () => {
    try {
      // 1. Check if model exists
      const exists = await RNFS.exists(MODEL_PATH);
      
      if (!exists) {
        setIsDownloading(true);
        // 2. Download the model if it doesn't exist
        const download = RNFS.downloadFile({
          fromUrl: MODEL_URL,
          toFile: MODEL_PATH,
          progress: (res) => {
            const progress = (res.bytesWritten / res.contentLength) * 100;
            setDownloadProgress(progress);
          },
        });
        await download.promise;
        setIsDownloading(false);
      }

      // 3. Initialize the Llama Context
      setIsInitializing(true);
      const context = await initLlama({
        model: MODEL_PATH,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: Platform.OS === 'ios' ? 100 : 0, // Enable Metal on iOS
      });
      
      setLlamaContext(context);
      setIsInitializing(false);

    } catch (error) {
      console.error('Failed to setup model:', error);
      setIsInitializing(false);
      setIsDownloading(false);
    }
  };

  const formatPrompt = (msgs: Message[]) => {
    // Basic ChatML-like formatting for the prompt
    let prompt = '';
    for (const msg of msgs) {
      prompt += `<|im_start|>${msg.role}\n${msg.content}<|im_end|>\n`;
    }
    prompt += '<|im_start|>assistant\n';
    return prompt;
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

    const promptString = formatPrompt(updatedMessages);

    let assistantResponse = '';
    const assistantMessageId = (Date.now() + 1).toString();

    // Add empty assistant message to stream into
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
        // Callback for streaming partial responses
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

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'system') return null; // Hide system prompt
    
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NativeLLM 🦙</Text>
        {isDownloading && (
          <Text style={styles.statusText}>Downloading Model: {downloadProgress.toFixed(1)}%</Text>
        )}
        {isInitializing && !isDownloading && (
          <Text style={styles.statusText}>Loading Model into RAM...</Text>
        )}
      </View>
      
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={!llamaContext ? 'Setting up model...' : 'Message NativeLLM...'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#0A84FF',
    fontSize: 12,
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#0A84FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#2C2C2E',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#E5E5EA',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 20,
    minWidth: 70,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
