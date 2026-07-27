import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modelBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#444',
  },
  modelBadgeText: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    color: '#34C759',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
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

  /* Modal Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 4,
  },
  modalList: {
    flex: 1,
    padding: 16,
  },
  modelCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedModelCard: {
    borderColor: '#0A84FF',
    backgroundColor: '#1E2838',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeTag: {
    backgroundColor: '#333',
    color: '#AAA',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  downloadedTag: {
    backgroundColor: '#1C3A27',
    color: '#34C759',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#CCC',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 18,
  },
  requirementRow: {
    marginTop: 10,
  },
  ramText: {
    color: '#FF9500',
    fontWeight: '600',
    fontSize: 13,
  },
  deviceText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  selectBtn: {
    marginTop: 14,
    backgroundColor: '#0A84FF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedBtn: {
    backgroundColor: '#34C759',
  },
  selectBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeModalBtn: {
    padding: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  closeModalText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
