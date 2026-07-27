import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '../types';
import { styles } from '../styles/appStyles';

type ChatMessageProps = {
  message: Message;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
        {message.content}
      </Text>
    </View>
  );
};
