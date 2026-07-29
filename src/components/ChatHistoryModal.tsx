import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ChatSession } from '../types';

type ChatHistoryModalProps = {
  visible: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClose: () => void;
};

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  visible,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={historyStyles.container}>
        <View style={historyStyles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <TouchableOpacity style={historyStyles.backBtn} onPress={onClose}>
              <Text style={historyStyles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={historyStyles.title}>Chat History 💬</Text>
          </View>
          <TouchableOpacity style={historyStyles.newChatBtn} onPress={onNewChat}>
            <Text style={historyStyles.newChatBtnText}>+ New Chat</Text>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <View style={historyStyles.emptyContainer}>
            <Text style={historyStyles.emptyText}>No previous chats saved yet.</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={historyStyles.list}
            renderItem={({ item }) => {
              const isActive = item.id === currentSessionId;
              const lastMsg = item.messages.filter(m => m.role !== 'system').slice(-1)[0]?.content || 'Empty chat';

              return (
                <View style={[historyStyles.sessionCard, isActive && historyStyles.activeCard]}>
                  <TouchableOpacity
                    style={historyStyles.sessionContent}
                    onPress={() => onSelectSession(item)}
                  >
                    <Text style={historyStyles.sessionTitle} numberOfLines={1}>
                      {item.title || 'Untitled Chat'}
                    </Text>
                    <Text style={historyStyles.sessionPreview} numberOfLines={2}>
                      {lastMsg}
                    </Text>
                    <Text style={historyStyles.sessionDate}>{formatDate(item.updatedAt)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={historyStyles.deleteBtn}
                    onPress={() => onDeleteSession(item.id)}
                  >
                    <Text style={historyStyles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}

        <TouchableOpacity style={historyStyles.closeBtn} onPress={onClose}>
          <Text style={historyStyles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const historyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
  },
  backBtnText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '600',
  },
  newChatBtn: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newChatBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  sessionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeCard: {
    borderColor: '#0A84FF',
    backgroundColor: '#1E2838',
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionPreview: {
    color: '#AAA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  sessionDate: {
    color: '#666',
    fontSize: 11,
  },
  deleteBtn: {
    padding: 10,
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 18,
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
  },
});
